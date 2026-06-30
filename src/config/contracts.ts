/**
 * Deployed Soroban contract addresses + network config (Stellar Testnet).
 *
 * These are the live contracts deployed from `contracts/`. Import these instead of
 * hardcoding addresses, and swap `src/utils/mockStorage.ts` calls for real contract
 * invocations using `@stellar/stellar-sdk` + the connected wallet.
 *
 * Values fall back to the deployed testnet addresses but can be overridden via Vite
 * env vars (see `.env.example`).
 */

export const NETWORK_PASSPHRASE =
  import.meta.env.VITE_NETWORK_PASSPHRASE ?? "Test SDF Network ; September 2015";

export const RPC_URL =
  import.meta.env.VITE_RPC_URL ?? "https://soroban-testnet.stellar.org";

export const HORIZON_URL =
  import.meta.env.VITE_HORIZON_URL ?? "https://horizon-testnet.stellar.org";

/** FormsContract — create/get/update/disable payment forms. */
export const FORMS_CONTRACT_ID =
  import.meta.env.VITE_FORMS_CONTRACT_ID ??
  "CDU7UXX4GFJNUIAGM4AOONMXOSL3M6AHFUMGAFJTBAR6HZOTGIK6EFET";

/** PaymentsContract — process_payment, receipts, total revenue. */
export const PAYMENTS_CONTRACT_ID =
  import.meta.env.VITE_PAYMENTS_CONTRACT_ID ??
  "CAYUFOPVI2WJTV5BUIORCAG7QTUOFJXHA7M2Y7GIVVIE7H6KHVIW7BMO";

/** Native XLM Stellar Asset Contract (testnet). */
export const NATIVE_TOKEN_ID =
  import.meta.env.VITE_NATIVE_TOKEN_ID ??
  "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

export const EXPLORER_CONTRACT = (id: string) =>
  `https://stellar.expert/explorer/testnet/contract/${id}`;
export const EXPLORER_TX = (hash: string) =>
  `https://stellar.expert/explorer/testnet/tx/${hash}`;
