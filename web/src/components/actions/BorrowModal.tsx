import { useState, useMemo } from "react";
import { Modal } from "react-bootstrap";
import { AlertTriangle } from "lucide-react";
import { AssetAmountInput } from "@/components/primitives/AssetAmountInput";
import { TxSimulationPanel } from "./TxSimulationPanel";
import { useBorrow } from "@/hooks/useBorrow";
import { calcLTV, calcMaxBorrow, healthBand, healthLabel } from "@/lib/ltv";
import { formatLTV, formatMUSD, formatPrice, parseMUSD } from "@/lib/format";
import { calcLiquidationPrice } from "@/lib/ltv";
import type { Position, PriceFeed } from "@/lib/chain/types";
import { copy } from "@/lib/copy/strings";

// re-export formatPrice alias for liq price
function fmtLiqPrice(liq: bigint) { return liq > 0n ? formatPrice(liq) : "—"; }

interface BorrowModalProps {
  show: boolean;
  onHide: () => void;
  position: Position;
  price: PriceFeed;
}

type Step = "input" | "review";

export function BorrowModal({ show, onHide, position, price }: BorrowModalProps) {
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<Step>("input");
  const borrow = useBorrow();

  const maxBorrowBigint = calcMaxBorrow(position.btcDeposited, position.musdBorrowed, price.pricePerBtc);
  const maxBorrowStr = formatMUSD(maxBorrowBigint, { symbol: false });

  const amountBigint = useMemo(() => {
    try { return parseMUSD(amount); } catch { return 0n; }
  }, [amount]);

  const currentLtvBps = calcLTV(position.btcDeposited, position.musdBorrowed, price.pricePerBtc);
  const newDebt = position.musdBorrowed + amountBigint;
  const newLtvBps = calcLTV(position.btcDeposited, newDebt, price.pricePerBtc);
  const newBand = healthBand(newLtvBps);
  const liqBefore = calcLiquidationPrice(position.btcDeposited, position.musdBorrowed);
  const liqAfter  = calcLiquidationPrice(position.btcDeposited, newDebt);

  const exceedsMax = newLtvBps > 6000;
  const excess = exceedsMax ? newDebt - (position.btcDeposited * price.pricePerBtc / 100_000_000n * 6000n / 10000n) : 0n;
  const canReview = amountBigint > 0n && !exceedsMax;

  function handleChip(pct: number) {
    if (pct === 100) { setAmount(maxBorrowStr); return; }
    const val = (maxBorrowBigint * BigInt(pct)) / 100n;
    setAmount(formatMUSD(val, { symbol: false }));
  }

  async function handleConfirm() {
    await borrow.mutateAsync(amountBigint);
    setStep("input");
    setAmount("");
    onHide();
  }

  function handleClose() {
    setStep("input");
    setAmount("");
    onHide();
  }

  return (
    <Modal show={show} onHide={handleClose} centered aria-labelledby="borrow-modal-title">
      <Modal.Header closeButton style={{ border: "none" }}>
        <Modal.Title id="borrow-modal-title" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
          {copy.borrow.title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {step === "input" && (
          <>
            <AssetAmountInput
              id="borrow-amount"
              label={copy.borrow.amountLabel}
              value={amount}
              onChange={setAmount}
              ticker="MUSD"
              max={maxBorrowStr}
              error={exceedsMax && amountBigint > 0n
                ? copy.borrow.maxLtvError(formatMUSD(excess))
                : undefined}
            />

            {/* Quick chips */}
            <div className="d-flex gap-2 mb-4">
              {[25, 50, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  className="btn btn-sm"
                  style={{ border: "1px solid var(--c-border)", background: "var(--c-surface-2)", color: "var(--c-text)", fontSize: "var(--fs-sm)" }}
                  onClick={() => handleChip(pct)}
                  aria-label={`Borrow ${pct === 100 ? "MAX" : pct + "%"}`}
                >
                  {pct === 100 ? "MAX" : `${pct}%`}
                </button>
              ))}
            </div>

            {/* Live preview */}
            {amountBigint > 0n && (
              <div className="surface-2 p-3 mb-4" style={{ borderRadius: "var(--r-2)" }}>
                <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600, marginBottom: "var(--s-3)" }}>
                  {copy.borrow.previewTitle}
                </div>
                {[
                  { label: "LTV",              before: formatLTV(currentLtvBps), after: formatLTV(newLtvBps) },
                  { label: "Health",           before: healthLabel(healthBand(currentLtvBps)), after: healthLabel(newBand) },
                  { label: "Liquidation price", before: fmtLiqPrice(liqBefore), after: fmtLiqPrice(liqAfter) },
                ].map(({ label, before, after }) => (
                  <div key={label} className="d-flex justify-content-between align-items-center mb-1">
                    <span style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-mute)" }}>{label}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-sm)" }}>
                      {before} → <span style={{ color: exceedsMax ? "var(--c-danger)" : "var(--c-text)" }}>{after}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Risk disclosure */}
            <div
              className="d-flex gap-2 p-3 mb-4"
              style={{ background: "rgba(225,29,46,.07)", border: "1px solid rgba(225,29,46,.2)", borderRadius: "var(--r-2)" }}
            >
              <AlertTriangle size={16} strokeWidth={1.5} style={{ color: "var(--c-danger)", flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-mute)", margin: 0 }}>
                {copy.borrow.riskBody}
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary w-100"
              style={{ minHeight: 48 }}
              disabled={!canReview}
              onClick={() => setStep("review")}
            >
              {copy.borrow.reviewBtn}
            </button>
          </>
        )}

        {step === "review" && (
          <TxSimulationPanel
            call={`borrow(${amountBigint.toString()})`}
            gasEstimate="~45,000 gas (simulated)"
            balanceAfter={`+${formatMUSD(amountBigint)}`}
            onConfirm={() => void handleConfirm()}
            loading={borrow.isPending}
          />
        )}
      </Modal.Body>
    </Modal>
  );
}
