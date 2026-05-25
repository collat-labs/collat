import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { copy } from "@/lib/copy/strings";
import { formatLTV } from "@/lib/format";

interface LiquidationAlertCardProps {
  ltvBps: number;
  onAddCollateral: () => void;
}

export function LiquidationAlertCard({ ltvBps, onAddCollateral }: LiquidationAlertCardProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  // Deterministic trigger: show on days where day-of-week % 3 === 0
  const todayTriggers = new Date().getDay() % 3 === 0;
  if (!todayTriggers && ltvBps < 5000) return null;

  const dropPct = ((0.75 / (ltvBps / 10000) - 1) * 100).toFixed(0);
  const addBtc = "0.05";

  return (
    <div
      className="p-3"
      role="alert"
      style={{
        background: "rgba(212,167,58,.08)",
        border: "1px solid rgba(212,167,58,.3)",
        borderRadius: "var(--r-3)",
        position: "relative",
      }}
    >
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss alert"
        style={{
          position: "absolute", top: "var(--s-2)", right: "var(--s-2)",
          background: "none", border: "none", color: "var(--c-text-mute)", cursor: "pointer",
          padding: "var(--s-1)", minWidth: 28, minHeight: 28, display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <X size={14} strokeWidth={1.5} />
      </button>

      <div className="d-flex gap-2">
        <AlertTriangle size={18} strokeWidth={1.5} style={{ color: "var(--c-warning)", flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
        <div>
          <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", marginBottom: "var(--s-1)" }}>
            {copy.ai.alertTitle}
          </div>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-mute)", margin: 0, marginBottom: "var(--s-3)" }}>
            {copy.ai.alertBodyFn(formatLTV(ltvBps), `${dropPct}%`, addBtc)}
          </p>
          <button
            type="button"
            className="btn btn-sm"
            style={{ border: "1px solid var(--c-warning)", color: "var(--c-warning)", background: "none", fontSize: "var(--fs-sm)" }}
            onClick={onAddCollateral}
          >
            {copy.ai.alertCTA}
          </button>
        </div>
      </div>
    </div>
  );
}
