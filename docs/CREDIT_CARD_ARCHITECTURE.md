# Collat Credit Card Architecture

## Why a Fully On-Chain Credit Card Cannot Exist (Today)

The vision of "swipe a card, auto-borrow against BTC" sounds elegant. The reality
is that a real credit card that works at every point-of-sale terminal requires
several centralized components that blockchains CANNOT replace:

### 1. Card Network Access (Visa / Mastercard)

Every payment terminal in the world connects to Visa or Mastercard rails. These
networks are **closed, permissioned systems**. You cannot join them without:

- A **licensed issuing bank** (BIN sponsorship)
- Legal incorporation in every jurisdiction you operate
- PCI-DSS compliance certification
- Settlement accounts with the card network

There is no "decentralized Visa." There is no smart contract that can join the
card network. This is the hardest problem.

### 2. Real-Time Authorization (< 200ms SLA)

When you tap your card at a coffee shop, the terminal expects an authorization
response in **under 200 milliseconds**. Blockchains — even fast ones — produce
blocks in seconds. A transaction that requires block confirmation cannot meet
this SLA.

### 3. Merchant Settlement in Fiat

Merchants receive **fiat currency** (USD, EUR, etc.) in their bank accounts.
They do not receive MUSD or any other stablecoin. Converting crypto to fiat for
merchant settlement requires:

- A fiat banking partner
- KYC/KYB on both the user and the merchant
- Compliance with local payment regulations

### 4. Chargebacks and Disputes

Card networks mandate a dispute resolution framework (chargebacks). If a customer
disputes a transaction, the merchant's bank reverses the payment. Blockchains are
**immutable by design** — you cannot reverse a confirmed transaction. This is
fundamentally incompatible with card network rules.

### 5. KYC / AML Requirements

Card issuance is a regulated financial activity. Every jurisdiction requires:

- Identity verification (KYC)
- Anti-money laundering checks (AML)
- Sanctions screening
- Transaction monitoring and suspicious activity reporting (SAR)

A permissionless smart contract does not meet any of these requirements.

### 6. Lost / Stolen Card Handling

Physical cards can be lost or stolen. Card networks provide:

- Card freezing / replacement
- Fraud liability protections ($0 liability in most cases)
- Real-time fraud detection

These are operational processes, not smart contract functions.

---

## How the Collat MVP Works (Virtual Card)

Despite the limitations above, Collat can deliver a compelling MVP with a **virtual
card** experience that demonstrates the core value proposition: spend against BTC
collateral without selling.

### MVP Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Collat Dashboard (React)              │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐    │
│  │ Position  │  │  Virtual │  │  Transaction       │    │
│  │ Overview  │  │  Cards   │  │  History           │    │
│  │          │  │          │  │                    │    │
│  │ BTC: 2.5 │  │ Card #1  │  │ $147.30 Amazon    │    │
│  │ MUSD:$45K│  │ $5K limit│  │ $23.50 Uber       │    │
│  │ LTV: 30% │  │ Active   │  │ +$10K Repaid      │    │
│  └──────────┘  └──────────┘  └────────────────────┘    │
│                         │                               │
│              ┌──────────┴──────────┐                    │
│              │   Auth Relay        │                    │
│              │   (Off-chain)       │                    │
│              │                     │                    │
│              │ 1. Card auth req    │                    │
│              │ 2. Check on-chain   │                    │
│              │    position LTV     │                    │
│              │ 3. Approve/Decline  │                    │
│              │ 4. Trigger on-chain │                    │
│              │    borrow of MUSD   │                    │
│              └──────────┬──────────┘                    │
└─────────────────────────┼───────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
    ┌─────────┴─────────┐   ┌────────┴────────┐
    │ Mezo Blockchain    │   │ Card Issuing    │
    │ (EVM)             │   │ API             │
    │                   │   │                 │
    │ CollatVault.sol   │   │ Stripe Issuing  │
    │ PriceFeed.sol     │   │ or Marqeta      │
    │ MUSD ERC-20       │   │ or Lithic       │
    └───────────────────┘   └─────────────────┘
```

### MVP Flow

1. **User deposits BTC** → on-chain via `depositCollateral()`
2. **User creates virtual card** → via Stripe Issuing API (test mode for MVP)
3. **Card auth request arrives** → Auth Relay service checks on-chain position
4. **If LTV allows** → Relay approves, then calls `borrow(amount)` on-chain
5. **If LTV exceeded** → Relay declines, user must repay or add collateral
6. **User repays** → calls `repay(amount)` on-chain to reduce debt

### MVP Limitations (Honest)

| Limitation | Why |
|-----------|-----|
| Only works with participating merchants | Card issuing API requires merchant integration |
| Auth relay is centralized | One service approves transactions (can be made multi-sig later) |
| Stripe test mode only (MVP) | Real card issuance requires KYB with Stripe |
| No physical card | Requires card manufacturer + issuer partnership |
| No chargebacks | Protocol-level reversal not possible |

---

## Production Path

### Phase 1: Testnet MVP (Current)
- Smart contracts on Mezo matsnet
- Mock card generation (frontend only)
- Demo: deposit → "spend" → auto-borrow → repay

### Phase 2: Issuer Partnership
- Partner with a card issuing platform (Stripe Issuing, Marqeta, Lithic)
- Complete KYB for the company
- Generate real virtual card numbers in test mode

### Phase 3: Auth Relay
- Deploy off-chain authorization relay service
- Multi-sig governance for relay operators
- Real-time LTV checks with chain or subgraph data

### Phase 4: Production Launch
- Live virtual cards with spending limits
- KYC integration at the card issuer layer
- Physical card manufacturing (Tangem-style NFC or traditional)
- Insurance / dispute resolution through the card issuer

### Phase 5: Decentralization
- Multiple relay operators with consensus
- ZK proofs for privacy-preserving LTV checks
- DAO governance for protocol parameters

---

## The Auth Relay: How It Bridges On-Chain and Off-Chain

The Auth Relay is the critical piece that makes Collat work. Here's the detailed
flow:

```
1. Card Issuer sends auth request → Auth Relay
   {
     cardId: "ic_xxx",
     amount: 4730,        // $47.30
     merchant: "Amazon",
     currency: "USD"
   }

2. Auth Relay queries on-chain position
   const vault = CollatVault.at(address)
   const maxBorrow = vault.getMaxBorrow(userAddress)
   const ltv = vault.getCurrentLtv(userAddress)

3. Auth Relay decides:
   if (amount <= maxBorrow && ltv < 7500) {
     // APPROVE: allow the card transaction
     await vault.borrow(amountInMUSD)
     return { approved: true }
   } else {
     // DECLINE: insufficient collateral
     return { approved: false, reason: "LTV too high" }
   }
```

### Why the relay must be off-chain:

1. **Latency**: Card auth SLA is 200ms. On-chain transactions take 2-5 seconds.
   The relay APPROVES first (fast), then settles on-chain (slower).
2. **Idempotency**: Card auths can be retried. The relay must deduplicate.
3. **Error handling**: If the on-chain borrow fails after approval, the relay
   must handle the mismatch gracefully.

### Risk Mitigation:

- **Pre-auth buffer**: Always keep a small MUSD buffer in a hot wallet to cover
  race conditions
- **Max single transaction**: Caps prevent draining the entire position
- **Circuit breaker**: Auto-disable if >3 auths fail in 1 minute
- **Multi-sig**: Require 2-of-3 relay operators to approve transactions above
  a threshold

---

## Comparison: Collat vs Traditional Crypto Cards

| Feature | Collat | Crypto.com Card | Binance Card |
|---------|--------|-----------------|--------------|
| Collateral | BTC (self-custodied) | Sell crypto to fiat | Sell crypto to fiat |
| Borrow vs Sell | Borrow MUSD | Sell for fiat | Sell for fiat |
| Tax event | No (borrow) | Yes (sell) | Yes (sell) |
| BTC upside | You keep it | You lose it | You lose it |
| Custody | On-chain vault | Exchange wallet | Exchange wallet |
| KYC | At issuer layer | Full KYC | Full KYC |
| Interest | 5% APR on borrowed | N/A (prepaid) | N/A (prepaid) |

---

## Summary

**Collat cannot replace Visa.** No blockchain project can. But Collat CAN:

1. Provide the on-chain infrastructure for BTC-collateralized borrowing
2. Auto-borrow at the moment of spend through an off-chain relay
3. Integrate with existing card issuing APIs for virtual card generation
4. Become the most capital-efficient way to spend Bitcoin without selling it

The MVP delivers the smart contracts, the dashboard, and the demo flow.
Production requires a card issuing partner — but the protocol works with ANY
issuer, giving Collat flexibility to choose the best partner.
