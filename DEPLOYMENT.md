# Deployment & fixes — stellar-forms

Both Soroban contracts are built and **deployed to Stellar Testnet**, and the full
forms → payment flow is verified on-chain. This doc lists the live addresses, the
fixes that were required to build/run, and how to reproduce.

## Deployed contracts (Testnet)

| Contract | Address |
|----------|---------|
| **FormsContract** | `CDU7UXX4GFJNUIAGM4AOONMXOSL3M6AHFUMGAFJTBAR6HZOTGIK6EFET` |
| **PaymentsContract** | `CAYUFOPVI2WJTV5BUIORCAG7QTUOFJXHA7M2Y7GIVVIE7H6KHVIW7BMO` |
| Native XLM token (testnet SAC) | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |

Explorer:
- Forms — https://stellar.expert/explorer/testnet/contract/CDU7UXX4GFJNUIAGM4AOONMXOSL3M6AHFUMGAFJTBAR6HZOTGIK6EFET
- Payments — https://stellar.expert/explorer/testnet/contract/CAYUFOPVI2WJTV5BUIORCAG7QTUOFJXHA7M2Y7GIVVIE7H6KHVIW7BMO

### Verified on-chain
- Created form #1 ("Coffee Tip", 5 XLM) — tx `1acd42f2468962f8be7eb1fe00bdee424382d077075858c7b7799fc094f7e5c4`
- `process_payment` of 5 XLM (inter-contract `get_form` + native token transfer + receipt) —
  tx `401b5b8edae4b727a8a4a1e1a7756c50a897bd762d5738fa999da502913c844d`
- `get_total_revenue` → `50000000` (5 XLM) ✅

> Contracts were deployed under a throwaway testnet key for this demo. Redeploy under
> your own key (`stellar keys generate <name> --network testnet --fund`) before relying
> on any owner/admin semantics.

## Fixes applied (required to build / run)

The repo on `main` did **not** compile as-is. Three changes were made:

1. **`contracts/Cargo.toml`** — moved `[profile.release]` to the **workspace root**.
   Cargo ignores `[profile.*]` in member crates, so `overflow-checks` was never enabled
   and `stellar contract build` hard-failed. (Also delete the now-ignored `[profile.release]`
   blocks from `contracts/forms/Cargo.toml` and `contracts/payments/Cargo.toml`.)

2. **`contracts/payments/src/lib.rs`** — `Address::from_string` takes **one** argument in
   soroban-sdk 22; removed the extra `&env`:
   ```rust
   // before:  Address::from_string(&env, &String::from_str(&env, NATIVE_TOKEN_CONTRACT_ID))
   // after:   Address::from_string(&String::from_str(&env, NATIVE_TOKEN_CONTRACT_ID))
   ```

3. **`contracts/payments/src/lib.rs`** — `NATIVE_TOKEN_CONTRACT_ID` pointed at the **wrong
   network's** native token (`CAS3…`), so `process_payment` would fail on testnet. Replaced
   with the testnet native SAC (`CDLZ…`). **Recommended:** make the token address an
   `init`/constructor parameter instead of a hardcoded const so the contract isn't network-locked.

4. **`contracts/forms/Cargo.toml` + `contracts/payments/Cargo.toml`** — the test suite
   could not compile (`mock_all_auths`, `register_contract`, `Address::generate` are behind
   soroban-sdk's **`testutils`** feature). Added:
   ```toml
   [dev-dependencies]
   soroban-sdk = { version = "22.0.1", features = ["testutils"] }
   ```
   and `use soroban_sdk::testutils::Address as _;` to both `mod test` blocks.

### Test status
- **forms**: 2/2 pass ✅
- **payments**: `test_payment_with_invalid_token` **fails** — and was never actually run
  before (the suite didn't compile). Its `#[should_panic(expected = "HostError: Error(Value,
  InvalidInput)")]` is wrong: an unregistered token in the test env panics with
  `Error(Storage, MissingValue)`. Fix by either correcting the expected string, or (better)
  registering a real Stellar Asset Contract in the test and asserting the happy path. Left
  as-is here to preserve the author's intent.

### Non-blocking suggestions
- Tests use `env.register_contract(None, …)` (deprecated in sdk 22) → prefer `env.register(C, ())`.
- Persistent storage entries are never TTL-extended; add `extend_ttl` for long-lived data.

## Reproduce

### Contracts
```bash
cd contracts
stellar contract build
cargo test                       # unit tests
# deploy
stellar keys generate me --network testnet --fund
stellar contract deploy --wasm target/wasm32v1-none/release/stellarforms_forms.wasm    --source me --network testnet
stellar contract deploy --wasm target/wasm32v1-none/release/stellarforms_payments.wasm --source me --network testnet
```

### Frontend
```bash
cp .env.example .env             # deployed addresses are pre-filled
npm install
npm run dev
```

## Frontend integration

Deployed addresses are exposed in **`src/config/contracts.ts`** (env-overridable via
`.env`). The UI currently uses `src/utils/mockStorage.ts`; swap those calls for real
contract invocations using `@stellar/stellar-sdk` + the wallet from `WalletContext`,
importing `FORMS_CONTRACT_ID` / `PAYMENTS_CONTRACT_ID` / `NATIVE_TOKEN_ID` from the config.
