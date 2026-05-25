import { useState } from "react";
import { ChevronDown, ChevronUp, Brain } from "lucide-react";
import { formatMUSD } from "@/lib/format";
import { copy } from "@/lib/copy/strings";

interface SmartLimitWidgetProps {
  ltvBps: number;
  maxBorrow: bigint;
}

export function SmartLimitWidget({ ltvBps, maxBorrow }: SmartLimitWidgetProps) {
  const [open, setOpen] = useState(false);
  // Mock: AI tightens limit to 80% of protocol max on high-volatility days
  const todayVolatile = new Date().getDay() % 3 === 0;
  const multiplier = todayVolatile ? 0.8 : 1.0;
  const limit = BigInt(Math.round(Number(maxBorrow) * multiplier));

  return (
    <div className="surface p-3" style={{ borderRadius: "var(--r-3)" }}>
      <div className="d-flex align-items-start gap-2">
        <Brain size={18} strokeWidth={1.5} style={{ color: "var(--c-primary)", flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
        <div className="flex-fill">
          <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", marginBottom: "var(--s-1)" }}>
            {copy.ai.smartLimitTitle}
          </div>
          <div
            style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-data)", color: "var(--c-text)" }}
            aria-label={`Smart spend limit: ${formatMUSD(limit)}`}
          >
            {formatMUSD(limit)}
          </div>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-mute)", margin: "var(--s-1) 0 0" }}>
            {copy.ai.smartLimitSub}
          </p>

          <button
            type="button"
            className="btn btn-link p-0 d-flex align-items-center gap-1 mt-2"
            style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-mute)", textDecoration: "none" }}
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="smart-limit-why"
          >
            {copy.ai.smartLimitWhy}
            {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {open && (
            <div
              id="smart-limit-why"
              className="mt-2 p-2"
              style={{ background: "var(--c-surface-2)", borderRadius: "var(--r-2)", fontSize: "var(--fs-sm)", color: "var(--c-text-mute)" }}
            >
              <div className="d-flex flex-column gap-1">
                <div>Current LTV: {(ltvBps / 100).toFixed(1)}%</div>
                <div>Volatility regime: {todayVolatile ? "elevated" : "normal"}</div>
                <div>Repayment score: Good (7/10)</div>
                <div>MUSD liquidity depth: Deep</div>
                <div>Multiplier applied: {todayVolatile ? "0.80× (volatility discount)" : "1.00× (normal)"}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
