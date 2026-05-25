import { MetricStat } from "@/components/primitives/MetricStat";
import { formatMUSD, formatPrice, btcToUSD } from "@/lib/format";
import { calcLiquidationPrice } from "@/lib/ltv";
import type { Position, PriceFeed } from "@/lib/chain/types";
import { copy } from "@/lib/copy/strings";

interface PositionCardProps {
  position: Position;
  price: PriceFeed;
  maxBorrow: bigint;
  className?: string;
}

export function PositionCard({ position, price, maxBorrow, className = "" }: PositionCardProps) {
  const btcUsd = btcToUSD(position.btcDeposited, price.pricePerBtc);
  const liqPrice = calcLiquidationPrice(position.btcDeposited, position.musdBorrowed);

  return (
    <div className={`surface p-4 ${className}`}>
      <div className="row g-4">
        <div className="col-6 col-md-3">
          <MetricStat
            label={copy.dashboard.musdBorrowed}
            value={formatMUSD(position.musdBorrowed)}
          />
        </div>
        <div className="col-6 col-md-3">
          <MetricStat
            label={copy.dashboard.availableToBorrow}
            value={maxBorrow > 0n ? formatMUSD(maxBorrow) : "$0.00"}
          />
        </div>
        <div className="col-6 col-md-3">
          <MetricStat
            label="BTC Value"
            value={formatMUSD(btcUsd)}
          />
        </div>
        <div className="col-6 col-md-3">
          <MetricStat
            label={copy.dashboard.liquidationPrice}
            value={liqPrice > 0n ? formatPrice(liqPrice) : "—"}
          />
        </div>
      </div>
    </div>
  );
}
