export type Address = `0x${string}`;
export type TxHash = `0x${string}`;

export interface Position {
  owner: Address;
  btcDeposited: bigint;  // 8 decimals
  musdBorrowed: bigint;  // 6 decimals
}

export interface Vault {
  totalBtcDeposited: bigint;
  totalMusdBorrowed: bigint;
  maxLtvBps: number;          // always 6000
  liquidationLtvBps: number;  // always 7500
  liquidationPenaltyBps: number; // always 500
}

export interface PriceFeed {
  pricePerBtc: bigint; // 6-decimal scale, e.g. 60_000_000_000n = $60,000
  updatedAt: number;   // unix seconds
}

export type CollatEvent =
  | { type: "Deposited";  owner: Address; amount: bigint; totalBtc: bigint;        at: number; hash: TxHash }
  | { type: "Withdrawn";  owner: Address; amount: bigint; totalBtc: bigint;        at: number; hash: TxHash }
  | { type: "Borrowed";   owner: Address; amount: bigint; totalDebt: bigint;       at: number; hash: TxHash }
  | { type: "Repaid";     owner: Address; amount: bigint; remainingDebt: bigint;   at: number; hash: TxHash }
  | { type: "Liquidated"; owner: Address; liquidator: Address; debtCovered: bigint; collateralSeized: bigint; at: number; hash: TxHash };

// Mirrors the Anchor error enum at programs/collat-mezo/src/lib.rs:644-664
export type CollatError =
  | "ZeroAmount"
  | "InsufficientCollateral"
  | "OutstandingLoan"
  | "ExceedsMaxLTV"
  | "OverRepay"
  | "NotLiquidatable"
  | "UnauthorizedOracle"
  | "UnauthorizedAccess"
  | "CollateralRemaining";

export class CollatTxError extends Error {
  constructor(public readonly code: CollatError, message?: string) {
    super(message ?? code);
    this.name = "CollatTxError";
  }
}

export interface TxResult {
  hash: TxHash;
  minedAt: number;
}

export type WalletOption = "passport" | "metamask" | "safe";

export interface ChainAdapter {
  chainId(): number;
  account(): Address | null;
  connect(wallet: WalletOption): Promise<Address>;
  disconnect(): void;
  getVault(): Promise<Vault>;
  getPosition(owner: Address): Promise<Position>;
  getPrice(): Promise<PriceFeed>;
  deposit(amount: bigint): Promise<TxResult>;
  withdraw(amount: bigint): Promise<TxResult>;
  borrow(amount: bigint): Promise<TxResult>;
  repay(amount: bigint): Promise<TxResult>;
  on(handler: (event: CollatEvent) => void): () => void;
  /** Subscribe to wallet account-state changes (connect/disconnect/reset) */
  onAccountChange(handler: (account: Address | null) => void): () => void;
  getEvents(filter?: { owner?: Address; types?: CollatEvent["type"][] }): Promise<CollatEvent[]>;
}
