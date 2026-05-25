import { ExternalLink } from "lucide-react";
import { copy } from "@/lib/copy/strings";

interface TxSimulationPanelProps {
  call: string;           // e.g. "borrow(16128000000)"
  gasEstimate: string;    // e.g. "~42,000 gas"
  balanceAfter: string;   // e.g. "+16,128 MUSD"
  onConfirm: () => void;
  loading: boolean;
}

export function TxSimulationPanel({ call, gasEstimate, balanceAfter, onConfirm, loading }: TxSimulationPanelProps) {
  return (
    <div className="surface p-4">
      <h3 style={{ fontSize: "var(--fs-h3)", marginBottom: "var(--s-4)" }}>
        {copy.txSimulation.title}
      </h3>

      <div className="d-flex flex-column gap-3" style={{ marginBottom: "var(--s-5)" }}>
        {[
          { label: copy.txSimulation.calldata,    value: call },
          { label: copy.txSimulation.gasEstimate, value: gasEstimate },
          { label: copy.txSimulation.balanceAfter, value: balanceAfter },
        ].map(({ label, value }) => (
          <div key={label} className="d-flex justify-content-between align-items-start">
            <span style={{ color: "var(--c-text-mute)", fontSize: "var(--fs-sm)" }}>{label}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-sm)", textAlign: "right", maxWidth: "55%" }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      <a
        href="#"
        className="d-inline-flex align-items-center gap-1"
        style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-mute)", textDecoration: "none", marginBottom: "var(--s-4)" }}
        aria-label="View on Mezo Explorer (opens in new tab)"
      >
        <ExternalLink size={12} strokeWidth={1.5} />
        {copy.txSimulation.explorerLink}
      </a>

      <button
        type="button"
        className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
        onClick={onConfirm}
        disabled={loading}
        style={{ minHeight: 48 }}
      >
        {loading && <span className="spinner-border spinner-border-sm" role="status" aria-label="Pending" />}
        {copy.borrow.confirmBtn}
      </button>
    </div>
  );
}
