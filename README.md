# Collat

Bank on Bitcoin. Spend your Bitcoin without selling it.

Deposit BTC once. Shop normally. Collat does the rest.

Collat is a Bitcoin-collateralized spending protocol built on **Mezo** (EVM).
Deposit BTC as collateral and auto-borrow MUSD at checkout. No manual steps.
No selling your Bitcoin. Your BTC stays on-chain in your vault.

[![Test](https://img.shields.io/badge/tests-26%2F26%20passing-brightgreen)]()
[![Solidity](https://img.shields.io/badge/solidity-0.8.24-blue)]()
[![Foundry](https://img.shields.io/badge/built%20with-foundry-orange)]()
[![License](https://img.shields.io/badge/license-GPL--3.0-green)]()

## How It Works

```
01. Deposit BTC
    Lock BTC as collateral in your Collat vault. One-time setup.

02. Shop Normally
    Pay online with a virtual Collat card. The protocol auto-borrows
    the exact MUSD needed against your BTC collateral.

03. Repay and Unlock
    Repay MUSD at any time. BTC is released proportionally back to you.
```

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

## Smart Contracts (Solidity + Foundry)

| Contract | Purpose |
|----------|---------|
| `CollatVault.sol` | Vault: deposit/withdraw BTC, borrow/repay MUSD, liquidate, interest accrual |
| `PriceFeed.sol` | BTC/USD oracle with multi-oracle support and staleness checks |
| `MockBTCToken.sol` | Test BTC ERC-20 token (for testnet) |

### Instructions

| Function | Description |
|----------|-------------|
| `depositCollateral(amount)` | Deposit BTC as collateral |
| `withdrawCollateral(amount)` | Withdraw BTC (requires no outstanding loan) |
| `borrow(amount)` | Borrow MUSD against BTC (max 60% LTV) |
| `repay(amount)` | Repay MUSD to reduce debt |
| `liquidate(owner, debtToCover)` | Liquidate underwater positions (>75% LTV, +5% penalty) |
| `accrueInterest(owner)` | Accrue time-based interest on outstanding debt |
| `getMaxBorrow(owner)` | View max available borrowing power |
| `getHealthFactor(owner)` | View position health factor |

### Parameters

| Parameter | Value |
|-----------|-------|
| Max LTV | 60% (6000 bps) |
| Liquidation LTV | 75% (7500 bps) |
| Liquidation Penalty | 5% (500 bps) |
| Collateral Token | BTC (ERC-20, 8 decimals) |
| Borrow Token | MUSD (ERC-20, 6 decimals) |
| Interest Rate | 5% APR (configurable) |
| Fee Rate | 0.5% (configurable) |

### Bugs Fixed from Anchor Version

| Bug | Fix |
|-----|-----|
| LTV divided by `LAMPORTS_PER_SOL` incorrectly | Proper decimal normalization (BTC 8dp, MUSD 6dp) |
| Liquidation seized BTC without repaying MUSD | Liquidator must transfer MUSD to vault first |
| No interest accrual model | Per-second interest with configurable APR |
| Single centralized oracle | Multi-oracle with staleness threshold |

## Getting Started

### Prerequisites

- [Foundry](https://book.getfoundry.sh/) (forge + cast)
- [Node.js](https://nodejs.org/) >= 18
- [MetaMask](https://metamask.io/) or any EVM wallet

### Smart Contracts

```bash
cd solidity

# Install dependencies
forge install

# Build
forge build

# Run tests (26 tests)
forge test

# Run with verbose output
forge test -vvv

# Run with gas report
forge test --gas-report
```

### Deploy to Mezo Testnet (matsnet)

```bash
cd solidity

# Set your private key
export PRIVATE_KEY=your_private_key_here

# Deploy to Mezo testnet
forge script script/DeployCollat.s.sol \
  --rpc-url https://rpc.test.mezo.org \
  --broadcast \
  --verify \
  -vvvv

# Or use the configured profile
forge script script/DeployCollat.s.sol --rpc-url matsnet --broadcast -vvvv
```

Get testnet BTC from the [Mezo Faucet](https://faucet.test.mezo.org).

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Deployed Addresses

### Mezo Matsnet (Testnet)

| Contract | Address |
|----------|---------|
| MUSD (official) | `0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503` |

*After deployment, run `forge script` to populate the remaining addresses in `solidity/broadcast/deployed-addresses.json`.*

## ⚠️ Credit Card: What Works and What Doesn't

See [docs/CREDIT_CARD_ARCHITECTURE.md](docs/CREDIT_CARD_ARCHITECTURE.md) for the full analysis.

**TL;DR:** A blockchain cannot replace Visa/Mastercard. But Collat provides the
on-chain collateral infrastructure, and the virtual card MVP works through a
card issuing API (Stripe Issuing, Marqeta, Lithic) with an off-chain auth relay.

| Feature | Collat MVP | Production |
|---------|-----------|------------|
| BTC collateral vault | ✅ On-chain | ✅ |
| MUSD borrowing | ✅ 60% LTV max | ✅ |
| Interest accrual | ✅ 5% APR | ✅ |
| Liquidation | ✅ +5% penalty | ✅ |
| Virtual card numbers | ✅ Via API partner | ✅ |
| Physical NFC card | ❌ Phase 4 | ✅ Tangem-style |
| Auto-borrow at checkout | ✅ Auth relay | ✅ |
| KYC-free | ✅ Protocol level | ✅ Issuer handles KYC |

## Mezo Testnet Details

| Parameter | Value |
|-----------|-------|
| Network Name | Mezo Matsnet |
| Chain ID | 31611 |
| RPC URL | `https://rpc.test.mezo.org` |
| Explorer | `https://explorer.test.mezo.org` |
| Faucet | `https://faucet.test.mezo.org` |
| Native Currency | BTC (18 decimals) |
| MUSD Token | `0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503` |

## Mezo Mainnet

| Parameter | Value |
|-----------|-------|
| Chain ID | 31612 |
| MUSD Token | `0xdD468A1DDc392dcdbEf6db6e34E89AA338F9F186` |
| Explorer | `https://explorer.mezo.org` |

## Project Structure

```
collat-mezo/
├── solidity/              # Foundry project
│   ├── src/               # Solidity contracts
│   │   ├── CollatVault.sol
│   │   ├── PriceFeed.sol
│   │   ├── MockBTCToken.sol
│   │   └── interfaces/
│   ├── test/              # Foundry tests
│   │   └── CollatVault.t.sol
│   ├── script/            # Deploy scripts
│   │   └── DeployCollat.s.sol
│   └── foundry.toml
├── frontend/              # React + Vite landing page
│   ├── src/
│   │   ├── components/
│   │   ├── App.tsx
│   │   └── index.css
│   └── vite.config.ts
├── docs/
│   └── CREDIT_CARD_ARCHITECTURE.md
├── PRD.md
├── COMPETITOR_ANALYSIS.md
└── README.md
```
