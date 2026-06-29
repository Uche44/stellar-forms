
# Project Overview

## Project Name

**StellarForms** (working title)

## Tagline

**Create payment forms. Share one link. Get paid directly on Stellar.**

## Vision

StellarForms is a decentralized payment collection platform inspired by Nayra. It enables creators, freelancers, businesses, and organizations to create customizable payment forms that anyone can pay using a Stellar wallet.

Unlike traditional payment processors, StellarForms never takes custody of user funds. Payments are settled directly on the Stellar network, while Soroban smart contracts manage payment forms, metadata, and payment events.

---

# Product Goals

The application should allow users to:

* Connect a Stellar wallet.
* Create reusable payment forms.
* Share payment links.
* Receive payments directly into their own wallet.
* Track payment history.
* View analytics.
* Receive live payment notifications.
* Operate entirely on Stellar Testnet for development.

No custodial backend should ever hold user funds.

---

# Technical Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* TanStack Query
* React Hook Form
* Zod
* Lucide React
* React Hot Toast

---

## Blockchain

* Soroban
* Stellar SDK
* Stellar Wallets Kit (Level 2+)
* Freighter
* Stellar Testnet
* Horizon API
* RPC Server

---

## Smart Contracts

Language

* Rust

Contracts

* Forms Contract
* Payments Contract

---

## Testing

Frontend

* Vitest
* React Testing Library

Contracts

* Rust tests

---

## Deployment

Frontend

* Vercel

Contracts

* Stellar Testnet

CI/CD

* GitHub Actions

---

# High-Level Architecture

```text
                 React Frontend
                       │
      ┌────────────────┴────────────────┐
      │                                 │
Wallet Integration                Stellar SDK
      │                                 │
      └──────────────┬──────────────────┘
                     │
              Soroban RPC
                     │
      ┌──────────────┴──────────────┐
      │                             │
 Forms Contract           Payments Contract
```

---

# Core Features

## Wallet

* Connect wallet
* Disconnect wallet
* Multi-wallet support (Level 2)
* Wallet detection
* Session persistence

---

## Payment Forms

A creator can create a form containing:

* Title
* Description
* Amount
* Currency (XLM for MVP)
* Optional amount
* Custom fields
* Active status

Example

```text
Support My Open Source Work

Amount:
10 XLM

Fields:

Name

Email

Message
```

---

## Payments

Visitor opens the form.

Connects wallet.

Pays.

Receives receipt.

Creator immediately receives funds.

---

## Dashboard

Creator sees

```text
Wallet

Current Balance

Total Payments

Forms Created

Recent Payments

Analytics
```

---

## Payment History

Each payment stores

* Payer
* Recipient
* Amount
* Timestamp
* Transaction Hash
* Form ID

---

# Smart Contract Design

## Contract 1 — Forms

Responsibilities

* Create form
* Update form
* Disable form
* Retrieve form
* Retrieve creator forms

Events

```text
FormCreated

FormUpdated

FormDisabled
```

---

## Contract 2 — Payments

Responsibilities

* Process payment
* Record payment
* Validate payment
* Retrieve payment history
* Analytics

Events

```text
PaymentReceived

PaymentCompleted

PaymentFailed
```

---

## Inter-contract Communication

```text
Payment Contract

↓

Calls

↓

Forms Contract

↓

Checks

Is Form Active?

↓

Returns

True

↓

Payment Executes
```

---

# Data Model

## Payment Form

```ts
id

creator

title

description

amount

isVariableAmount

customFields[]

status

createdAt
```

---

## Payment

```ts
id

formId

payer

recipient

amount

hash

timestamp
```

---

# Milestone Plan

## Milestone 1 — Project Foundation

Deliverables

* Project initialized
* Folder structure
* Routing
* Tailwind
* Linting
* Formatting
* Theme
* Responsive layout

Acceptance Criteria

Project builds without errors.

---

## Milestone 2 — Wallet Integration (Level 1)

Implement

* Freighter integration
* Connect
* Disconnect
* Detect installation
* Session restore
* Wallet information

Acceptance Criteria

Wallet connection works reliably.

---

## Milestone 3 — Balance & Native Payments (Level 1)

Implement

* Fetch XLM balance
* Display balance
* Native XLM transfer
* Transaction feedback
* Transaction hash
* Explorer link

Acceptance Criteria

Meets all Level 1 requirements.

---

## Milestone 4 — Payment Form UI

Implement

* Create form page
* Form builder
* Form preview
* Shareable URLs (initially local/mock)

Acceptance Criteria

Users can build and preview payment forms.

---

## Milestone 5 — Soroban Forms Contract (Level 2)

Implement

* Write Forms contract
* Deploy to Testnet
* Create form on-chain
* Read form data
* Update form
* Disable form

Acceptance Criteria

Forms are stored on-chain.

---

## Milestone 6 — Multi-Wallet Integration (Level 2)

Replace Freighter-only implementation with Stellar Wallets Kit.

Support

* Freighter
* Albedo
* xBull
* Future compatible wallets

Implement

* Wallet selection modal
* Wallet switching

Acceptance Criteria

Multiple wallets function correctly.

---

## Milestone 7 — Payments Contract (Level 2)

Implement

* Deploy contract
* Contract payment execution
* Payment recording
* Payment events
* Transaction status
* Explorer links

Acceptance Criteria

Payments execute through Soroban contracts.

---

## Milestone 8 — Live Updates

Implement

* Event streaming
* Live payment feed
* Automatic UI refresh
* Transaction polling
* Loading states

Acceptance Criteria

No manual refresh is needed to observe state changes.

---

## Milestone 9 — Production Features (Level 3)

Implement

* Analytics dashboard
* Payment history
* Responsive UI
* Empty states
* Error boundaries
* Skeleton loaders
* Accessibility improvements

Acceptance Criteria

Application is production-ready on desktop and mobile.

---

## Milestone 10 — Testing, CI/CD & Documentation (Level 3)

Implement

Frontend

* Unit tests
* Component tests

Contracts

* Rust tests

Infrastructure

* GitHub Actions
* Automated linting
* Automated testing
* Deployment workflow

Documentation

* README
* Architecture diagrams
* Setup guide
* Demo GIFs/screenshots
* Demo video script

Acceptance Criteria

All Level 3 checklist items are satisfied.

---

# Development Rules for the AI Agent

## General

* Build incrementally; each milestone must end in a working application.
* Do not begin a new milestone until the current one is fully implemented, tested, and documented.
* Prefer composition over inheritance and reusable modules over duplicated logic.
* Keep UI components presentational; place business logic in hooks, services, or state managers.

## Code Quality

* Enable TypeScript strict mode.
* Avoid `any`; justify any unavoidable usage.
* Follow SOLID principles where applicable.
* Use consistent naming conventions and file organization.
* Add comments only where they clarify non-obvious logic.

## Smart Contracts

* Keep contracts modular with a single responsibility.
* Emit events for every meaningful state change.
* Validate all inputs before mutating state.
* Write unit tests alongside contract logic.
* Design storage to be forward-compatible with additional features.

## Frontend

* Validate all user input with Zod before blockchain interactions.
* Provide clear loading, success, and error states.
* Handle required error cases such as missing wallet, rejected signature, insufficient balance, and network failures.
* Ensure responsive layouts and keyboard accessibility.

## Testing & Delivery

* Every milestone must include relevant tests where applicable.
* Keep commits focused and descriptive.
* Ensure the project remains deployable after every milestone.
* Update documentation continuously rather than leaving it until the end.

## Success Criteria

By the end of the project, the application should satisfy every requirement across Levels 1–3:

* ✔ Wallet setup and connection
* ✔ Multi-wallet support
* ✔ Balance retrieval
* ✔ Native XLM transactions
* ✔ Soroban smart contract deployment
* ✔ Frontend contract interaction
* ✔ Read/write on-chain data
* ✔ Real-time event handling
* ✔ Transaction status tracking
* ✔ Inter-contract communication
* ✔ Comprehensive error handling
* ✔ Responsive frontend
* ✔ Frontend and contract tests
* ✔ CI/CD pipeline
* ✔ Complete documentation
* ✔ Public deployment with verifiable contract addresses and transaction hashes

This plan is designed so that the AI agent never needs to rewrite major pieces of the application. Each milestone extends the existing architecture, resulting in a cohesive, production-style decentralized payment platform that demonstrates increasing mastery of the Stellar ecosystem while meeting every challenge requirement.


