import type {
  Address, TxHash, Position, Vault, PriceFeed, CollatEvent,
  TxResult, WalletOption, ChainAdapter,
} from "./types";
import { CollatTxError } from "./types";

const STORAGE_KEY = "collat:state";
const MOCK_CHAIN_ID = 31612; // Mezo testnet

const VAULT: Vault = {
  totalBtcDeposited: 0n,
  totalMusdBorrowed: 0n,
  maxLtvBps: 6000,
  liquidationLtvBps: 7500,
  liquidationPenaltyBps: 500,
};

// Seed address for demo screenshots
const SEED_ADDRESS: Address = "0xC0117a7D0000000000000000000000000000C011";

// Price: $60,000 in 6-decimal scale = 60_000_000_000n
const INITIAL_PRICE = 60_000_000_000n;

// BTC amounts use 8 decimals; MUSD uses 6 decimals.
// Seed: 0.84 BTC deposited, 32% LTV → debt ≈ 0.84 * 60000 * 0.32 = 16,128 MUSD
const SEED_BTC = 84_000_000n;           // 0.84 BTC
const SEED_MUSD = 16_128_000_000n;      // 16,128 MUSD (6 decimals)

type StoredState = {
  account: Address | null;
  btcDeposited: string;
  musdBorrowed: string;
  pricePerBtc: string;
  priceTick: number;
  events: Array<{
    type: CollatEvent["type"];
    owner: Address;
    amount?: string;
    totalBtc?: string;
    totalDebt?: string;
    remainingDebt?: string;
    liquidator?: Address;
    debtCovered?: string;
    collateralSeized?: string;
    at: number;
    hash: TxHash;
  }>;
};

function makeHash(): TxHash {
  const hex = [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
  return `0x${hex}` as TxHash;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function readDelay() { return 80 + Math.random() * 120; }
function writeDelay() { return 800 + Math.random() * 700; }

function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StoredState;
  } catch { /* ignore */ }
  return {
    account: null,
    btcDeposited: SEED_BTC.toString(),
    musdBorrowed: SEED_MUSD.toString(),
    pricePerBtc: INITIAL_PRICE.toString(),
    priceTick: 0,
    events: [],
  };
}

function saveState(s: StoredState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export class MockChainAdapter implements ChainAdapter {
  private state: StoredState;
  private handlers: Set<(e: CollatEvent) => void> = new Set();
  private accountHandlers: Set<(a: Address | null) => void> = new Set();
  private priceInterval: ReturnType<typeof setInterval> | null = null;

  private notifyAccount() {
    this.accountHandlers.forEach((h) => h(this.state.account));
  }

  constructor() {
    this.state = loadState();
    this.startPriceDrift();
  }

  private startPriceDrift() {
    // Deterministic price walk ±0.4% every 12s
    this.priceInterval = setInterval(() => {
      const tick = this.state.priceTick + 1;
      const price = BigInt(this.state.pricePerBtc);
      // Sine-based deterministic drift; tick modulo keeps it bounded
      const drift = Math.sin(tick * 0.7) * 0.004;
      const newPrice = BigInt(Math.round(Number(price) * (1 + drift)));
      this.state.pricePerBtc = newPrice.toString();
      this.state.priceTick = tick;
      saveState(this.state);
    }, 12_000);
  }

  chainId(): number { return MOCK_CHAIN_ID; }

  account(): Address | null { return this.state.account; }

  async connect(wallet: WalletOption): Promise<Address> {
    await delay(400);
    const addresses: Record<WalletOption, Address> = {
      passport: SEED_ADDRESS,
      metamask: "0xDEAD000000000000000000000000000000000001" as Address,
      safe:     "0x5AFE000000000000000000000000000000000002" as Address,
    };
    this.state.account = addresses[wallet];
    saveState(this.state);
    this.notifyAccount();
    return this.state.account;
  }

  disconnect(): void {
    this.state.account = null;
    saveState(this.state);
    this.notifyAccount();
  }

  async getVault(): Promise<Vault> {
    await delay(readDelay());
    return {
      ...VAULT,
      totalBtcDeposited: BigInt(this.state.btcDeposited),
      totalMusdBorrowed: BigInt(this.state.musdBorrowed),
    };
  }

  async getPosition(owner: Address): Promise<Position> {
    await delay(readDelay());
    if (owner !== this.state.account) {
      return { owner, btcDeposited: 0n, musdBorrowed: 0n };
    }
    return {
      owner,
      btcDeposited: BigInt(this.state.btcDeposited),
      musdBorrowed: BigInt(this.state.musdBorrowed),
    };
  }

  async getPrice(): Promise<PriceFeed> {
    await delay(readDelay());
    return {
      pricePerBtc: BigInt(this.state.pricePerBtc),
      updatedAt: Math.floor(Date.now() / 1000),
    };
  }

  private calcLtv(btc: bigint, musd: bigint, price: bigint): number {
    if (btc === 0n) return 0;
    // collateralValueMUSD = btc * pricePerBtc / 1e8 / 1e6 * 1e6
    // btc is 8-decimal, price is 6-decimal → collateral in MUSD 6-decimal
    const collateralValue = (btc * price) / 100_000_000n; // result in MUSD (6 dec)
    return Number((musd * 10_000n) / collateralValue); // in basis points
  }

  async deposit(amount: bigint): Promise<TxResult> {
    if (amount <= 0n) throw new CollatTxError("ZeroAmount");
    await delay(writeDelay());
    this.state.btcDeposited = (BigInt(this.state.btcDeposited) + amount).toString();
    const hash = makeHash();
    const ev: CollatEvent = {
      type: "Deposited",
      owner: this.state.account!,
      amount,
      totalBtc: BigInt(this.state.btcDeposited),
      at: Math.floor(Date.now() / 1000),
      hash,
    };
    this.emitAndStore(ev);
    return { hash, minedAt: Math.floor(Date.now() / 1000) };
  }

  async withdraw(amount: bigint): Promise<TxResult> {
    if (amount <= 0n) throw new CollatTxError("ZeroAmount");
    if (BigInt(this.state.musdBorrowed) > 0n) throw new CollatTxError("OutstandingLoan");
    if (BigInt(this.state.btcDeposited) < amount) throw new CollatTxError("InsufficientCollateral");
    await delay(writeDelay());
    this.state.btcDeposited = (BigInt(this.state.btcDeposited) - amount).toString();
    const hash = makeHash();
    const ev: CollatEvent = {
      type: "Withdrawn",
      owner: this.state.account!,
      amount,
      totalBtc: BigInt(this.state.btcDeposited),
      at: Math.floor(Date.now() / 1000),
      hash,
    };
    this.emitAndStore(ev);
    return { hash, minedAt: Math.floor(Date.now() / 1000) };
  }

  async borrow(amount: bigint): Promise<TxResult> {
    if (amount <= 0n) throw new CollatTxError("ZeroAmount");
    const btc = BigInt(this.state.btcDeposited);
    const musd = BigInt(this.state.musdBorrowed);
    const price = BigInt(this.state.pricePerBtc);
    const newDebt = musd + amount;
    const ltvBps = this.calcLtv(btc, newDebt, price);
    if (ltvBps > 6000) throw new CollatTxError("ExceedsMaxLTV");
    await delay(writeDelay());
    this.state.musdBorrowed = newDebt.toString();
    const hash = makeHash();
    const ev: CollatEvent = {
      type: "Borrowed",
      owner: this.state.account!,
      amount,
      totalDebt: newDebt,
      at: Math.floor(Date.now() / 1000),
      hash,
    };
    this.emitAndStore(ev);
    return { hash, minedAt: Math.floor(Date.now() / 1000) };
  }

  async repay(amount: bigint): Promise<TxResult> {
    if (amount <= 0n) throw new CollatTxError("ZeroAmount");
    const musd = BigInt(this.state.musdBorrowed);
    if (amount > musd) throw new CollatTxError("OverRepay");
    await delay(writeDelay());
    const remaining = musd - amount;
    this.state.musdBorrowed = remaining.toString();
    const hash = makeHash();
    const ev: CollatEvent = {
      type: "Repaid",
      owner: this.state.account!,
      amount,
      remainingDebt: remaining,
      at: Math.floor(Date.now() / 1000),
      hash,
    };
    this.emitAndStore(ev);
    return { hash, minedAt: Math.floor(Date.now() / 1000) };
  }

  private emitAndStore(ev: CollatEvent) {
    // Store in state
    const stored = ev as unknown as StoredState["events"][0];
    // Serialize bigints
    const serialized = JSON.parse(JSON.stringify(stored, (_, v) =>
      typeof v === "bigint" ? v.toString() : v
    ));
    this.state.events.unshift(serialized);
    if (this.state.events.length > 200) this.state.events.length = 200;
    saveState(this.state);
    this.handlers.forEach((h) => h(ev));
  }

  on(handler: (event: CollatEvent) => void): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  onAccountChange(handler: (account: Address | null) => void): () => void {
    this.accountHandlers.add(handler);
    return () => this.accountHandlers.delete(handler);
  }

  async getEvents(filter?: { owner?: Address; types?: CollatEvent["type"][] }): Promise<CollatEvent[]> {
    await delay(readDelay());
    return this.state.events
      .filter((ev) => {
        if (filter?.owner && ev.owner !== filter.owner) return false;
        if (filter?.types && !filter.types.includes(ev.type)) return false;
        return true;
      })
      .map((ev) => {
        // Rehydrate bigint fields
        const out: Record<string, unknown> = { ...ev };
        for (const k of ["amount", "totalBtc", "totalDebt", "remainingDebt", "debtCovered", "collateralSeized"]) {
          if (typeof out[k] === "string") out[k] = BigInt(out[k] as string);
        }
        return out as unknown as CollatEvent;
      });
  }

  /** Clear all state back to seed — called by Settings reset */
  reset() {
    this.state = {
      account: this.state.account,
      btcDeposited: "0",
      musdBorrowed: "0",
      pricePerBtc: INITIAL_PRICE.toString(),
      priceTick: 0,
      events: [],
    };
    saveState(this.state);
    // Trigger position/event-listener invalidations via the same channel
    this.handlers.forEach((h) => h({
      type: "Withdrawn",
      owner: this.state.account ?? ("0x0000000000000000000000000000000000000000" as Address),
      amount: 0n, totalBtc: 0n,
      at: Math.floor(Date.now() / 1000),
      hash: "0x0000000000000000000000000000000000000000000000000000000000000000" as TxHash,
    }));
  }

  destroy() {
    if (this.priceInterval) clearInterval(this.priceInterval);
  }
}
