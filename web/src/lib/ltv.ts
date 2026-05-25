// All LTV math lives here. No inline calculations in JSX.
//
// The Anchor program at programs/collat-mezo/src/lib.rs:131-137 divides by
// LAMPORTS_PER_SOL (1e9) as a Solana-specific scaling artefact. The equivalent
// EVM math does not have that divisor. This file uses clean decimal-aware math.
//
// Units:
//   btcDeposited  — 8-decimal bigint  (1 BTC = 100_000_000n)
//   musdBorrowed  — 6-decimal bigint  (1 MUSD = 1_000_000n)
//   pricePerBtc   — 6-decimal bigint  (USD 60,000 = 60_000_000_000n)

const MAX_LTV_BPS = 6000n;          // 60%
const LIQ_LTV_BPS = 7500n;          // 75%
const LIQ_PENALTY_BPS = 500n;       // 5%
const BPS = 10_000n;

/** Returns LTV in basis points (e.g. 3200 = 32.00%) */
export function calcLTV(btcDeposited: bigint, musdBorrowed: bigint, pricePerBtc: bigint): number {
  if (btcDeposited === 0n) return 0;
  // collateralValueMUSD (6 dec) = btc (8 dec) * price (6 dec) / 1e8
  const collateralValue = (btcDeposited * pricePerBtc) / 100_000_000n;
  if (collateralValue === 0n) return 0;
  return Number((musdBorrowed * BPS) / collateralValue);
}

/** Maximum additional MUSD the user can borrow without hitting 60% LTV */
export function calcMaxBorrow(btcDeposited: bigint, musdBorrowed: bigint, pricePerBtc: bigint): bigint {
  const collateralValue = (btcDeposited * pricePerBtc) / 100_000_000n;
  const maxDebt = (collateralValue * MAX_LTV_BPS) / BPS;
  const available = maxDebt - musdBorrowed;
  return available > 0n ? available : 0n;
}

/** LTV at which liquidation is triggered (75% → 7500 bps) */
export function calcLiquidationPrice(btcDeposited: bigint, musdBorrowed: bigint): bigint {
  if (btcDeposited === 0n || musdBorrowed === 0n) return 0n;
  // liqPrice (6 dec) = musd * BPS / btc / LIQ_LTV_BPS * 1e8
  return (musdBorrowed * BPS * 100_000_000n) / (btcDeposited * LIQ_LTV_BPS);
}

export type HealthBand = "safe" | "caution" | "danger";

/** Returns the health band for a given LTV in basis points */
export function healthBand(ltvBps: number): HealthBand {
  if (ltvBps >= 7500) return "danger";
  if (ltvBps >= 6000) return "caution";
  return "safe";
}

/** Returns the health label for display */
export function healthLabel(band: HealthBand): string {
  switch (band) {
    case "safe":    return "Healthy";
    case "caution": return "Watch";
    case "danger":  return "At Risk";
  }
}

export { MAX_LTV_BPS, LIQ_LTV_BPS, LIQ_PENALTY_BPS };
