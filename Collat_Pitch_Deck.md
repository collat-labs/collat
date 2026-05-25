# Collat — Pitch Deck

**Bank on Bitcoin. Spend your Bitcoin without selling it.**
Mezo Hackathon — May 2026

---

## Problem: $1T+ BTC Is Locked, Not Spent

- **Bitcoin holders face a painful choice:** hold and have zero spending power, or sell and lose future upside.
- **Merchants don't accept BTC.** Converting to fiat requires exchanges, takes days, incurs fees, and triggers taxable events.
- **Existing BTC lending is overcomplicated** — 150% overcollateralization, lengthy KYC, manual borrow steps, rigid repayment schedules.
- **All crypto cards today sell your crypto at checkout.** Every swipe is a taxable sale. You lose BTC upside.

> "I want to spend my Bitcoin without selling it."

---

## Solution: Deposit Once. Spend Infinitely.

Collat is a **Bitcoin-collateralized spending protocol** built on **Mezo (EVM)**.

```
01. Deposit BTC
    Lock BTC as collateral in your Collat vault. One-time setup.

02. Shop Normally
    Pay online with a virtual Collat card. The protocol auto-borrows
    the exact MUSD needed against your BTC collateral.

03. Repay and Unlock
    Repay MUSD at any time. BTC is released proportionally back to you.
```

**The killer feature:** No manual borrow step. No selling. No taxable events. Just swipe.

---

## Architecture

```
 ┌─────────────────────────────────────────┐
 │            Collat Dashboard             │
 │          (React + Vite + wagmi)         │
 └────────────────┬────────────────────────┘
                  │
 ┌────────────────┴────────────────────────┐
 │            Auth Relay                   │
 │         (Off-chain service)             │
 │  Checks on-chain LTV → approves card    │
 │  then borrows MUSD on-chain             │
 └────────┬───────────────────┬────────────┘
          │                   │
 ┌────────┴────────┐  ┌───────┴──────────┐
 │ Mezo Blockchain │  │ Card Issuing API │
 │   (EVM)        │  │ (Stripe/Marqeta)  │
 │                │  │                   │
 │ CollatVault.sol│  │ Virtual Cards     │
 │ PriceFeed.sol  │  │ Merchant Settlement│
 │ MUSD (ERC-20)  │  │                   │
 └────────────────┘  └───────────────────┘
```

---

## Smart Contracts (Solidity + Foundry) — **26/26 Tests Passing**

| Contract | Purpose |
|----------|---------|
| `CollatVault.sol` | Vault: deposit/withdraw BTC, borrow/repay MUSD, liquidate, interest accrual |
| `PriceFeed.sol` | BTC/USD oracle with multi-oracle support and staleness checks |
| `MockBTCToken.sol` | Test BTC ERC-20 token (for testnet) |

### Core Parameters

| Parameter | Value |
|-----------|-------|
| Max LTV | 60% |
| Liquidation LTV | 75% |
| Liquidation Penalty | +5% |
| Interest Rate | 5% APR (configurable, max 20%) |
| Fee Rate | 0.5% (configurable, max 5%) |

---

## Key Differentiator: Auto-Borrow at Checkout

| Factor | Collat | Traditional BTC Lending | Crypto Cards |
|--------|--------|------------------------|-------------|
| Borrow step | **Auto-triggered** at checkout | Manual each time | N/A (sell) |
| Tax event | **None** (borrowing) | None | **Yes** (selling) |
| BTC upside | **You keep it** | You keep it | **You lose it** |
| Repayment | Flexible, no deadlines | Fixed term | N/A |
| Custody | On-chain vault | Centralized or wrapped | Exchange wallet |
| Card | Virtual + physical (Phase 4) | None | Prepaid/sell-to-spend |

---

## Competitive Landscape

Collat sits at the intersection of **three markets**. No existing product does all three.

| Category | Closest Competitors | Collat Advantage |
|----------|-------------------|------------------|
| **Bitcoin Lending** | Aave (WBTC), Compound, BTC.Link | Auto-borrow at checkout, native BTC on Mezo |
| **Crypto Debit Cards** | Coinbase Card, Crypto.com, Binance Card, Uniswap Card | Borrow don't sell. No taxable events. Self-custody. |
| **BTC Yield/Restaking** | Lombard, Ether.fi, SolvBTC | Spending utility, not just yield. Real consumer use case. |

### Competitors All Require Selling

| Competitor | Model | Tax Event |
|------------|-------|-----------|
| Coinbase Card | Sell crypto → fiat | Yes |
| Crypto.com Visa | Sell or pre-load fiat | Yes |
| Uniswap Card | Swap token → pay | Yes |
| Binance Card | Auto-convert crypto → fiat | Yes |
| **Collat** | **Borrow MUSD → pay** | **No** |

---

## Business Model

### Three Revenue Streams

| Stream | Mechanics | Maturity |
|--------|-----------|----------|
| **Interest Spread** | 5% APR on borrowed MUSD | Phase 1 |
| **Transaction Fees** | 0.5% fee per auto-borrow at checkout | Phase 2 |
| **Card Revenue** | Interchange + monthly card fee (physical) | Phase 4 |

### The Flywheel

```
More BTC deposited  →  Higher collateral base
        ↓
  More purchasing power  →  More transaction fees
        ↓
 Better rates from LPs  →  More BTC deposited
```

---

## AI Features — Defensible Moat (Future)

If someone forks the contracts and ships the same card, the winner is whoever has **better risk management and UX**.

| Feature | Description |
|---------|-------------|
| **Liquidation Prediction** | Proactive alerts before volatility hits your position. Monitors on-chain flows, funding rates, macro signals. |
| **Smart Spending Limits** | Dynamic per-transaction limit based on volatility regime, repayment history, MUSD liquidity. |
| **Tax-Intelligent Routing** | Classifies each auto-borrow by category. Generates year-end tax report. |
| **Natural Language Agent** | "Hey Collat, how much can I spend?" Conversational position management via Boar MCP. |

**Principle:** AI never runs between the user and their swipe. Payment rails are always instant and deterministic.

---

## Hackathon Tooling Integrations

| Partner | Role |
|---------|------|
| **Spectrum Nodes** | Primary RPC on Mezo testnet. Every borrow/repay/liquidate tx. |
| **Validation Cloud** | Enterprise RPC upgrade path for Mezo mainnet. |
| **Goldsky** | Indexes vault positions, borrow/repay events with subgraphs. Powers dashboard. |
| **Tenderly** | Simulates auto-borrow flows, monitors production, traces cross-chain failures. |
| **Boar Network** | Blockchain MCP for AI agent. Powers "Hey Collat, how much can I spend?" |

---

## Mezo Track Alignment — All Three Tracks

| Track | How Collat Fits |
|-------|-----------------|
| **Bank on Bitcoin** | BTC as collateral. No wrapping. No selling. BTC stays on-chain in your vault. |
| **Supernormal dApps (MUSD)** | MUSD is the spend currency. Auto-borrow at checkout makes MUSD a real payment rail. |
| **MEZO Utilization** | Every Collat position adds BTC TVL and creates MUSD borrowing volume for Mezo. |

**MUSD is not an add-on — it is the spend asset in every transaction.**

---

## Roadmap

| Phase | Milestone | Status |
|-------|-----------|--------|
| **1** | Smart contracts on Mezo testnet — vault, borrow/repay, liquidation, oracle | ✅ DONE |
| **2** | Auto-pay SDK + Position Dashboard + Checkout Integration | Next |
| **3** | Security audit, Mezo mainnet deployment, public beta | Soon |
| **4** | Collat Card — virtual Visa/MC + Tangem-style NFC physical card | Future |

---

## Why Collat Wins This Hackathon

1. **MUSD is not just integrated — it is the only thing moving in every transaction.**
2. **Auto-borrow at checkout is genuinely novel.** No existing Mezo project does instant checkout lending.
3. **Three revenue streams, not token emissions.** Clear path to sustainable business.
4. **AI features show long-term defensibility.** Most DeFi teams ignore this.
5. **User experience is genuinely different.** Deposit once, spend infinitely. One atomic step.

---

## Demo

```
1. Deposit BTC into Collat vault (one-time)
2. Swipe virtual card at checkout
3. Auth relay checks on-chain LTV → approves
4. Auto-borrow exact MUSD needed → settles merchant
5. User repays later at their convenience
```

No selling. No manual borrow. No taxable event. **This is what spending Bitcoin should feel like.**

---

## Links

| Resource | URL |
|----------|-----|
| GitHub | `github.com/mzf11125/collat-mezo` |
| Deployed (Testnet) | Mezo Matsnet (Chain ID 31611) |
| MUSD Token | `0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503` |

---

**Thank you.**
