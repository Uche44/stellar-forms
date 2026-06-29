#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec, symbol_short};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Form {
    pub id: u64,
    pub creator: Address,
    pub title: String,
    pub description: String,
    pub amount: i128, // amount in stroops (1 XLM = 10,000,000 stroops). 0 means variable.
    pub is_variable: bool,
    pub custom_fields: Vec<String>,
    pub is_active: bool,
    pub created_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Form(u64),
    CreatorForms(Address),
    FormCounter,
}

#[contract]
pub struct FormsContract;

#[contractimpl]
impl FormsContract {
    /// Creates a new payment form and returns its unique ID
    pub fn create_form(
        env: Env,
        creator: Address,
        title: String,
        description: String,
        amount: i128,
        is_variable: bool,
        custom_fields: Vec<String>,
    ) -> u64 {
        // Authenticate the creator signature
        creator.require_auth();

        // Increment and retrieve the next form ID
        let mut form_counter: u64 = env.storage().instance().get(&DataKey::FormCounter).unwrap_or(0);
        form_counter += 1;
        env.storage().instance().set(&DataKey::FormCounter, &form_counter);

        // Fetch current timestamp
        let created_at = env.ledger().timestamp();

        let form = Form {
            id: form_counter,
            creator: creator.clone(),
            title: title.clone(),
            description: description.clone(),
            amount,
            is_variable,
            custom_fields: custom_fields.clone(),
            is_active: true,
            created_at,
        };

        // Store the form
        env.storage().persistent().set(&DataKey::Form(form_counter), &form);

        // Update creator forms list
        let mut creator_forms: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::CreatorForms(creator.clone()))
            .unwrap_or(Vec::new(&env));
        creator_forms.push_back(form_counter);
        env.storage().persistent().set(&DataKey::CreatorForms(creator.clone()), &creator_forms);

        // Publish event
        env.events().publish(
            (symbol_short!("created"), form_counter),
            (creator, amount, is_variable),
        );

        form_counter
    }

    /// Retrieves form details by ID
    pub fn get_form(env: Env, id: u64) -> Form {
        env.storage()
            .persistent()
            .get(&DataKey::Form(id))
            .expect("Form not found")
    }

    /// Disables a form so it can no longer receive payments
    pub fn disable_form(env: Env, id: u64) {
        let mut form = Self::get_form(env.clone(), id);
        form.creator.require_auth();

        form.is_active = false;
        env.storage().persistent().set(&DataKey::Form(id), &form);

        // Publish event
        env.events().publish(
            (symbol_short!("disabled"), id),
            form.creator,
        );
    }

    /// Updates mutable form configuration (title, description, amount, status)
    pub fn update_form(
        env: Env,
        id: u64,
        title: String,
        description: String,
        amount: i128,
        is_active: bool,
    ) {
        let mut form = Self::get_form(env.clone(), id);
        form.creator.require_auth();

        form.title = title;
        form.description = description;
        form.amount = amount;
        form.is_active = is_active;

        env.storage().persistent().set(&DataKey::Form(id), &form);

        // Publish event
        env.events().publish(
            (symbol_short!("updated"), id),
            (form.creator, amount, is_active),
        );
    }

    /// Returns a list of form IDs created by a specific address
    pub fn get_creator_forms(env: Env, creator: Address) -> Vec<Form> {
        let form_ids: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::CreatorForms(creator.clone()))
            .unwrap_or(Vec::new(&env));

        let mut forms = Vec::new(&env);
        for id in form_ids.iter() {
            if let Some(form) = env.storage().persistent().get::<DataKey, Form>(&DataKey::Form(id)) {
                forms.push_back(form);
            }
        }
        forms
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::Env;

    #[test]
    fn test_create_and_query_form() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, FormsContract);
        let client = FormsContractClient::new(&env, &contract_id);

        let creator = Address::generate(&env);
        let title = String::from_str(&env, "Test Form");
        let description = String::from_str(&env, "Test description of the form");
        let amount = 100_000_000i128; // 10 XLM
        let is_variable = false;
        let mut custom_fields = Vec::new(&env);
        custom_fields.push_back(String::from_str(&env, "Email"));

        // Create form
        let form_id = client.create_form(
            &creator,
            &title,
            &description,
            &amount,
            &is_variable,
            &custom_fields,
        );

        assert_eq!(form_id, 1);

        // Get form and verify
        let form = client.get_form(&1);
        assert_eq!(form.id, 1);
        assert_eq!(form.creator, creator);
        assert_eq!(form.title, title);
        assert_eq!(form.amount, amount);
        assert_eq!(form.is_active, true);
        assert_eq!(form.custom_fields.len(), 1);

        // Verify forms by creator
        let creator_forms = client.get_creator_forms(&creator);
        assert_eq!(creator_forms.len(), 1);
        assert_eq!(creator_forms.get(0).unwrap().id, 1);
    }

    #[test]
    fn test_update_and_disable_form() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, FormsContract);
        let client = FormsContractClient::new(&env, &contract_id);

        let creator = Address::generate(&env);
        let title = String::from_str(&env, "Donate");
        let description = String::from_str(&env, "Please help");
        let amount = 50_000_000i128;
        let is_variable = true;
        let custom_fields = Vec::new(&env);

        let form_id = client.create_form(
            &creator,
            &title,
            &description,
            &amount,
            &is_variable,
            &custom_fields,
        );

        // Update form details
        let new_title = String::from_str(&env, "Sponsor");
        let new_desc = String::from_str(&env, "Sponsor my work");
        let new_amount = 200_000_000i128;
        client.update_form(&form_id, &new_title, &new_desc, &new_amount, &true);

        let updated_form = client.get_form(&form_id);
        assert_eq!(updated_form.title, new_title);
        assert_eq!(updated_form.amount, new_amount);

        // Disable form
        client.disable_form(&form_id);
        let disabled_form = client.get_form(&form_id);
        assert_eq!(disabled_form.is_active, false);
    }
}
