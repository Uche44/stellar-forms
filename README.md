# StellarForms 🚀

> Create payment forms. Share one link. Get paid directly on Stellar.

StellarForms is a decentralized, non-custodial payment collection platform designed for creators, freelancers, and businesses. It allows anyone to generate customizable payment forms that visitors can settle directly using Stellar wallets. 

Unlike traditional payment gateways, StellarForms never holds user funds—payments are settled peer-to-peer on the Stellar network while payment configuration states are managed on-chain by Soroban smart contracts.

---

## 🏗️ Architecture

```text
                     React Frontend (Vite)
                               │
      ┌────────────────────────┴────────────────────────┐
      │                                                 │
Stellar Wallets Kit                                 Stellar SDK
(Freighter, Albedo, xBull)                         (Horizon Client)
      │                                                 │
      └────────────────────────┬────────────────────────┘
                               │
                          Soroban RPC
                               │
             ┌─────────────────┴─────────────────┐
             │                                   │
      Forms Contract                     Payments Contract
   (Stores form schemas)               (Validates & transfers XLM)
```

- **React Frontend**: Built using React, TypeScript, Vite, Tailwind CSS, TanStack Query, and React Hook Form. It uses the `@creit.tech/stellar-wallets-kit` to integrate multiple wallets under a unified interface.
- **Forms Smart Contract**: Written in Rust, it creates, updates, and disables payment forms on-chain. It emits events for metadata tracking.
- **Payments Smart Contract**: Validates payments, handles inter-contract checks (asking the Forms contract if a form is active), transfers the native XLM token directly from the payer to the creator, and records receipts on-chain.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, PostCSS (custom glassmorphic theme)
- **Routing**: React Router DOM v6
- **State/Data Fetching**: TanStack Query (React Query)
- **Forms & Validation**: React Hook Form, Zod
- **Notifications**: React Hot Toast
- **Testing**: Vitest, React Testing Library, jsdom

### Smart Contracts
- **Language**: Rust
- **Target**: WASM (`wasm32-unknown-unknown`)
- **Framework**: Soroban SDK

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v18+) & npm
- Rust & Cargo (to compile contracts)
- `stellar-cli` (to deploy contracts and interact via terminal)
- A browser wallet (e.g. Freighter, Albedo, xBull) configured for Stellar Testnet.

### Frontend Installation
1. Clone the repository and navigate into the workspace.
2. Install the package dependencies:
   ```bash
   npm install
   ```
3. Run the development server locally:
   ```bash
   npm run dev
   ```
4. Access the application in your browser at `http://localhost:5173`.

### Smart Contracts Development
The smart contracts are located in the `contracts/` directory and managed under a Cargo workspace.

1. Navigate to the contract folder:
   ```bash
   cd contracts
   ```
2. Build the contracts into WebAssembly:
   ```bash
   cargo build --target wasm32-unknown-unknown --release
   ```
3. Run the contract unit tests:
   ```bash
   cargo test
   ```

### Contract Deployment (Stellar Testnet)
Ensure you have a funded Testnet account configured in `stellar-cli`.

1. Deploy the Forms Contract:
   ```bash
   stellar contract deploy \
     --wasm target/wasm32-unknown-unknown/release/stellarforms_forms.wasm \
     --source <your-account-alias> \
     --network testnet
   ```
2. Deploy the Payments Contract:
   ```bash
   stellar contract deploy \
     --wasm target/wasm32-unknown-unknown/release/stellarforms_payments.wasm \
     --source <your-account-alias> \
     --network testnet
   ```
3. Update the contract IDs in the frontend configuration file.

---

## 🧪 Testing

### Running Frontend Tests
Frontend tests are built using Vitest and React Testing Library:
```bash
npm run test
```

### Running Rust Contract Tests
To execute contract unit tests inside the cargo workspace:
```bash
cargo test --manifest-path contracts/Cargo.toml
```

---

## 🔒 Security & Custody
StellarForms is **completely non-custodial**:
- Payer funds flow directly from their wallet signature to the creator's wallet address.
- Smart contracts operate as validator-logs and router-transfers; they never escrow or hold XLM.
- Secret keys are never requested or stored; all signatures are handled through secure web-wallet extensions.
