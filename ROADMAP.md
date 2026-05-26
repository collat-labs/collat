# Collat Roadmap

## Phase 1 — Smart Contracts [COMPLETED]

| Task | Status |
|------|--------|
| CollatVault.sol (deposit, withdraw, borrow, repay, liquidate) | ✅ Deployed |
| PriceFeed.sol (multi-oracle BTC/USD with staleness checks) | ✅ Deployed |
| MockBTCToken.sol (testnet BTC ERC-20) | ✅ Deployed |
| Interest accrual (per-second, configurable APR) | ✅ |
| 26 passing Foundry tests | ✅ |
| Deploy to Mezo Matsnet (chainId 31611) | ✅ |

**Deployed addresses (Matsnet):**
- CollatVault: `0xAEaD0Bef16bEcecc87fA559262e58c904eDF9ac6`
- PriceFeed: `0x318Ecad2bA565778753918e287AAaA2e65E5b1Dd`
- BTC Token: `0xc583b1aa2f68BE9176Ce17b36b6928c99091E3fd`
- MUSD: `0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503`

---

## Phase 2 — Frontend + Dashboard [COMPLETED]

| Task | Status |
|------|--------|
| Landing page (5 animated sections, liquid-glass UI) | ✅ |
| Dashboard with real on-chain data via viem | ✅ |
| RainbowKit wallet integration (MetaMask, WalletConnect) | ✅ |
| Deposit BTC panel with approve + deposit flow | ✅ |
| Position table (BTC deposited, MUSD borrowed, LTV, health factor) | ✅ |
| Virtual card preview UI | ✅ |
| Mezo faucet integration | ✅ |
| Bitcoin-themed Mixkit stock videos | ✅ |

---

## Phase 3 — Auto-Pay Integration [IN PROGRESS]

| Task | Status |
|------|--------|
| Mobile-responsive dashboard UX | 🔄 |
| Borrow MUSD directly from dashboard | ⬜ |
| Repay MUSD from dashboard | ⬜ |
| Transaction history with explorer links | ⬜ |
| Health factor alerts and notifications | ⬜ |

---

## Phase 4 — Mainnet Launch

| Task | Status |
|------|--------|
| Third-party smart contract audit | ⬜ |
| Upgrade PriceFeed to use Pyth oracle (decentralized) | ⬜ |
| Deploy to Mezo mainnet (chainId 31612) | ⬜ |
| Public beta with deposit caps | ⬜ |
| Bug bounty program | ⬜ |

---

## Phase 5 — Collat Card

| Task | Status |
|------|--------|
| Card creation function in CollatVault (`CardCreated` event already defined) | ⬜ |
| Auth relay service (checks on-chain LTV, approves card spend) | ⬜ |
| Card issuing API integration (Stripe Issuing / Marqeta / Lithic) | ⬜ |
| Virtual card numbers for online spending | ⬜ |
| Physical NFC card with EAL6+ secure chip (Tangem-style) | ⬜ |
| Tap-to-borrow at POS (phone constructs tx, card signs via NFC) | ⬜ |
| Multi-card backup (2-3 linked cards, no seed phrase needed) | ⬜ |

---

## Phase 6 — QR Payment Integration

| Task | Status |
|------|--------|
| QR code generation for wallet deposit address | ⬜ |
| QR code for receiving MUSD payments | ⬜ |
| QR code for receiving BTC deposits directly to vault | ⬜ |
| QR pay panel in dashboard (generate + share QR for any address) | ⬜ |
| Amount-embedded QR codes (preset value QR) | ⬜ |
| QR scan to trigger repayment flow | ⬜ |
| QRIS compatibility research (requires off-chain settlement partner) | ⬜ |
| Merchant QR checkout (user scans, Collat auto-borrows MUSD and settles) | ⬜ |

**QR Payment Architecture:**

```
┌──────────────────────────────────────┐
│           Collat Dashboard           │
│  ┌────────────────────────────────┐  │
│  │       QR Pay Panel             │  │
│  │  ┌──────────┐  ┌────────────┐  │  │
│  │  │ Deposit  │  │  Receive   │  │  │
│  │  │ Address  │  │  Payment   │  │  │
│  │  │ QR Code  │  │  QR Code   │  │  │
│  │  └──────────┘  └────────────┘  │  │
│  └────────────────────────────────┘  │
│                                      │
│  Generate QR → Share to anyone →     │
│  They scan with any app →            │
│  BTC/MUSD sent to your vault         │
└──────────────────────────────────────┘
```

**QRIS Integration Pathway:**

QRIS is Indonesia's national QR payment standard regulated by Bank Indonesia. A fully on-chain QRIS integration requires:

1. Partnership with a licensed Payment Service Provider (PJP) in Indonesia
2. Register as a merchant acquirer or partner with an existing one
3. Off-chain settlement: fiat IDR from QRIS → exchange → BTC → deposit to Collat vault
4. This is a regulated, off-chain bridge — not a smart contract feature

The practical approach:
- **Short term:** QR codes for wallet addresses (sending funds into Collat)
- **Medium term:** Partner with a fiat on-ramp (exchanges that support QRIS deposits like Pintu, Tokocrypto, Indodax)
- **Long term:** Direct QRIS integration via licensed payment processor

---

## Phase 7 — AI Features

| Task | Status |
|------|--------|
| Liquidation risk prediction (ML model on user positions) | ⬜ |
| Smart borrowing limits (dynamic LTV based on volatility) | ⬜ |
| Natural language position management (chat with your vault) | ⬜ |
| Spending analytics and insights | ⬜ |

---

## Future Ideas

- **Collat Pay SDK** — embed Collat checkout into any website or app ✅ (SDK panel in dashboard)
- **Recurring payments** — scheduled MUSD repayments from linked wallet ✅ (Recurring panel in dashboard)
- **Yield strategies** — deposit idle MUSD into Mezo yield protocols ✅ (Yield panel in dashboard)
- **Cross-chain BTC** — support BTC on other L2s as collateral
- **Multi-collateral** — ETH, stablecoins as additional collateral types
- **Collat DAO** — community governance of protocol parameters
- **Merchant dashboard** — tools for businesses accepting Collat payments
