#![no_std]
use soroban_sdk::{
    contract, contractclient, contractimpl, contracttype, symbol_short, token, Address, Env, String, Vec
};

// Redefine Form struct layout from Forms contract for inter-contract calling compatibility
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Form {
    pub id: u64,
    pub creator: Address,
    pub title: String,
    pub description: String,
    pub amount: i128,
    pub is_variable: bool,
    pub custom_fields: Vec<String>,
    pub is_active: bool,
    pub created_at: u64,
}

// Client definition for invoking the Forms smart contract
#[contractclient(name = "FormsContractClient")]
pub trait FormsContractTrait {
    fn get_form(env: Env, id: u64) -> Form;
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PaymentRecord {
    pub id: u64,
    pub form_id: u64,
    pub payer: Address,
    pub recipient: Address,
    pub amount: i128,
    pub timestamp: u64,
    pub custom_field_values: Vec<String>,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Payment(u64),
    PaymentCounter,
    FormPayments(u64),
    TotalRevenue,
}

// Native XLM Stellar Asset Contract on TESTNET. NOTE: this id is network-specific —
// it differs on mainnet/futurenet. For production this should be an init/constructor
// parameter rather than a hardcoded constant. (Original value pointed at the wrong
// network and would have made process_payment fail on testnet.)
const NATIVE_TOKEN_CONTRACT_ID: &str = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

#[contract]
pub struct PaymentsContract;

#[contractimpl]
impl PaymentsContract {
    /// Processes a payment, transfers tokens, and logs the receipt
    pub fn process_payment(
        env: Env,
        payer: Address,
        forms_contract: Address,
        form_id: u64,
        amount: i128,
        custom_field_values: Vec<String>,
    ) -> u64 {
        // Authenticate the payer
        payer.require_auth();

        // 1. Fetch form info from Forms Contract
        let forms_client = FormsContractClient::new(&env, &forms_contract);
        let form = forms_client.get_form(&form_id);

        // 2. Validate form is active
        assert!(form.is_active, "Payment failed: Form is inactive");

        // 3. Validate payment amount
        if !form.is_variable {
            assert!(
                amount >= form.amount,
                "Payment failed: Insufficient payment amount"
            );
        } else {
            assert!(amount > 0, "Payment failed: Amount must be greater than zero");
        }

        // 4. Execute non-custodial token transfer (XLM)
        let token_address = Address::from_string(&String::from_str(&env, NATIVE_TOKEN_CONTRACT_ID));
        let token_client = token::Client::new(&env, &token_address);
        
        // Transfer native tokens from payer directly to the creator of the form
        token_client.transfer(&payer, &form.creator, &amount);

        // 5. Increment payment index
        let mut payment_counter: u64 = env.storage().instance().get(&DataKey::PaymentCounter).unwrap_or(0);
        payment_counter += 1;
        env.storage().instance().set(&DataKey::PaymentCounter, &payment_counter);

        // 6. Record the transaction receipt
        let timestamp = env.ledger().timestamp();
        let record = PaymentRecord {
            id: payment_counter,
            form_id,
            payer: payer.clone(),
            recipient: form.creator.clone(),
            amount,
            timestamp,
            custom_field_values,
        };
        env.storage().persistent().set(&DataKey::Payment(payment_counter), &record);

        // Link payment to this form
        let mut form_payments: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::FormPayments(form_id))
            .unwrap_or(Vec::new(&env));
        form_payments.push_back(payment_counter);
        env.storage().persistent().set(&DataKey::FormPayments(form_id), &form_payments);

        // Update aggregate analytics
        let mut total_revenue: i128 = env.storage().instance().get(&DataKey::TotalRevenue).unwrap_or(0);
        total_revenue += amount;
        env.storage().instance().set(&DataKey::TotalRevenue, &total_revenue);

        // Emit payments events
        env.events().publish(
            (symbol_short!("pay_rec"), form_id),
            (payer, amount),
        );
        env.events().publish(
            (symbol_short!("pay_comp"), payment_counter),
            form.creator,
        );

        payment_counter
    }

    /// Fetches a payment receipt by ID
    pub fn get_payment_record(env: Env, id: u64) -> PaymentRecord {
        env.storage()
            .persistent()
            .get(&DataKey::Payment(id))
            .expect("Payment record not found")
    }

    /// Fetches all payment records associated with a form
    pub fn get_form_payments(env: Env, form_id: u64) -> Vec<PaymentRecord> {
        let payment_ids: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::FormPayments(form_id))
            .unwrap_or(Vec::new(&env));

        let mut records = Vec::new(&env);
        for id in payment_ids.iter() {
            if let Some(record) = env.storage().persistent().get::<DataKey, PaymentRecord>(&DataKey::Payment(id)) {
                records.push_back(record);
            }
        }
        records
    }

    /// Returns aggregate revenue processed through this contract instance
    pub fn get_total_revenue(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::TotalRevenue).unwrap_or(0)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _; // brings Address::generate into scope
    use soroban_sdk::{contract, contractimpl, Env};

    // Define a Mock Forms contract for integration testing
    #[contract]
    pub struct MockFormsContract;

    #[contractimpl]
    impl MockFormsContract {
        pub fn get_form(env: Env, _id: u64) -> Form {
            let creator = Address::generate(&env);
            Form {
                id: 1,
                creator,
                title: String::from_str(&env, "Mock Form"),
                description: String::from_str(&env, "Description"),
                amount: 100_000_000, // 10 XLM
                is_variable: false,
                custom_fields: Vec::new(&env),
                is_active: true,
                created_at: 1234567,
            }
        }
    }

    #[test]
    #[should_panic(expected = "HostError: Error(Value, InvalidInput)")]
    fn test_payment_with_invalid_token() {
        let env = Env::default();
        env.mock_all_auths();

        let payments_contract_id = env.register_contract(None, PaymentsContract);
        let payments_client = PaymentsContractClient::new(&env, &payments_contract_id);

        let forms_contract_id = env.register_contract(None, MockFormsContract);
        let payer = Address::generate(&env);
        
        let mut custom_fields = Vec::new(&env);
        custom_fields.push_back(String::from_str(&env, "Alice"));

        // This should panic in test since NATIVE_TOKEN_CONTRACT_ID (CAS3...) is not registered in the test env
        payments_client.process_payment(
            &payer,
            &forms_contract_id,
            &1,
            &100_000_000,
            &custom_fields,
        );
    }
}
