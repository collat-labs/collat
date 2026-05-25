// All money formatting lives here. No inline parseFloat/Number in JSX.

const BTC_DECIMALS = 8n;
const MUSD_DECIMALS = 6n;
const PRICE_DECIMALS = 6n; // price feed is 6-decimal scaled

/** Format a raw 8-decimal BTC bigint to a human string, e.g. "0.84000000" */
export function formatBTC(raw: bigint, { compact = false } = {}): string {
  const whole = raw / 10n ** BTC_DECIMALS;
  const frac = raw % 10n ** BTC_DECIMALS;
  const fracStr = frac.toString().padStart(8, "0");
  if (compact) {
    const trimmed = fracStr.replace(/0+$/, "") || "0";
    return `${whole}.${trimmed}`;
  }
  return `${whole}.${fracStr}`;
}

/** Format a raw 6-decimal MUSD bigint to a dollar-style string, e.g. "$16,128.00" */
export function formatMUSD(raw: bigint, { symbol = true } = {}): string {
  const whole = raw / 10n ** MUSD_DECIMALS;
  const frac = raw % 10n ** MUSD_DECIMALS;
  const fracStr = frac.toString().padStart(6, "0").slice(0, 2); // 2 dp
  const intStr = whole.toLocaleString("en-US");
  return symbol ? `$${intStr}.${fracStr}` : `${intStr}.${fracStr}`;
}

/** Format a raw 6-decimal price bigint (price per BTC) to USD string */
export function formatPrice(raw: bigint): string {
  const usd = Number(raw) / 10 ** Number(PRICE_DECIMALS);
  return usd.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

/** Format basis-point LTV to "32.45%" */
export function formatLTV(bps: number): string {
  return `${(bps / 100).toFixed(2)}%`;
}

/** Short address: "0xC011…C011" */
export function shortAddress(addr: string): string {
  if (addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/** Format a unix timestamp to a readable date string */
export function formatTimestamp(unixSec: number): string {
  return new Date(unixSec * 1000).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

/** Parse a user-entered decimal string to a bigint with `decimals` precision */
export function parseBTC(value: string): bigint {
  return parseDecimalToBigInt(value, Number(BTC_DECIMALS));
}

export function parseMUSD(value: string): bigint {
  return parseDecimalToBigInt(value, Number(MUSD_DECIMALS));
}

function parseDecimalToBigInt(value: string, decimals: number): bigint {
  const [whole, frac = ""] = value.split(".");
  const padded = frac.slice(0, decimals).padEnd(decimals, "0");
  return BigInt(whole || "0") * 10n ** BigInt(decimals) + BigInt(padded || "0");
}

/** BTC raw value → USD value (raw MUSD bigint) */
export function btcToUSD(btc: bigint, pricePerBtc: bigint): bigint {
  // btc (8 dec) * price (6 dec) / 1e8 = USD in 6-decimal scale
  return (btc * pricePerBtc) / 100_000_000n;
}
