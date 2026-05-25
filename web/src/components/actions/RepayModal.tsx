import { useState, useMemo } from "react";
import { Modal } from "react-bootstrap";
import { AssetAmountInput } from "@/components/primitives/AssetAmountInput";
import { TxSimulationPanel } from "./TxSimulationPanel";
import { useRepay } from "@/hooks/useRepay";
import { parseMUSD, formatMUSD } from "@/lib/format";
import type { Position } from "@/lib/chain/types";
import { copy } from "@/lib/copy/strings";

type Step = "input" | "review";

interface RepayModalProps {
  show: boolean;
  onHide: () => void;
  position: Position;
  onFullRepay?: () => void;
}

export function RepayModal({ show, onHide, position, onFullRepay }: RepayModalProps) {
  const debtStr = formatMUSD(position.musdBorrowed, { symbol: false });
  const [amount, setAmount] = useState(debtStr);
  const [step, setStep] = useState<Step>("input");
  const [fullyRepaid, setFullyRepaid] = useState(false);
  const repay = useRepay();

  const amountBigint = useMemo(() => {
    try { return parseMUSD(amount); } catch { return 0n; }
  }, [amount]);

  const isOverRepay = amountBigint > position.musdBorrowed;
  const clamped = isOverRepay ? position.musdBorrowed : amountBigint;
  const isFullRepay = clamped >= position.musdBorrowed && position.musdBorrowed > 0n;

  async function handleConfirm() {
    await repay.mutateAsync(clamped);
    if (isFullRepay) { setFullyRepaid(true); onFullRepay?.(); }
    else { setStep("input"); onHide(); }
  }

  function handleClose() { setStep("input"); setAmount(debtStr); setFullyRepaid(false); onHide(); }

  if (fullyRepaid) {
    return (
      <Modal show={show} onHide={handleClose} centered aria-labelledby="repay-done-title">
        <Modal.Header closeButton style={{ border: "none" }} />
        <Modal.Body className="text-center py-5">
          <div style={{ fontSize: 40, marginBottom: "var(--s-4)", color: "var(--c-success)" }}>✓</div>
          <h2 id="repay-done-title" style={{ fontFamily: "var(--font-display)", marginBottom: "var(--s-3)" }}>
            {copy.repay.successTitle}
          </h2>
          <p style={{ color: "var(--c-text-mute)", marginBottom: "var(--s-6)" }}>
            {copy.repay.fullRepaySuccess}
          </p>
          <button type="button" className="btn btn-primary" onClick={handleClose}>
            {copy.repay.openDashboard}
          </button>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <Modal show={show} onHide={handleClose} centered aria-labelledby="repay-modal-title">
      <Modal.Header closeButton style={{ border: "none" }}>
        <Modal.Title id="repay-modal-title" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
          {copy.repay.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {step === "input" && (
          <>
            <AssetAmountInput
              id="repay-amount"
              label={copy.repay.amountLabel}
              value={amount}
              onChange={setAmount}
              ticker="MUSD"
              max={debtStr}
            />
            <button
              type="button"
              className="btn btn-sm mb-3 w-100"
              style={{ border: "1px solid var(--c-border)", background: "var(--c-surface-2)", color: "var(--c-text)" }}
              onClick={() => setAmount(debtStr)}
            >
              {copy.repay.fullRepayBtn}
            </button>
            <button
              type="button"
              className="btn btn-primary w-100"
              style={{ minHeight: 48 }}
              disabled={clamped <= 0n}
              onClick={() => setStep("review")}
            >
              Review
            </button>
          </>
        )}
        {step === "review" && (
          <TxSimulationPanel
            call={`repay(${clamped.toString()})`}
            gasEstimate="~39,000 gas (simulated)"
            balanceAfter={`-${formatMUSD(clamped)}`}
            onConfirm={() => void handleConfirm()}
            loading={repay.isPending}
          />
        )}
      </Modal.Body>
    </Modal>
  );
}
