import { useState, useMemo } from "react";
import { Modal } from "react-bootstrap";
import { AssetAmountInput } from "@/components/primitives/AssetAmountInput";
import { TxSimulationPanel } from "./TxSimulationPanel";
import { useWithdraw } from "@/hooks/useWithdraw";
import { parseBTC, formatBTC, btcToUSD, formatMUSD } from "@/lib/format";
import type { Position, PriceFeed } from "@/lib/chain/types";
import { copy } from "@/lib/copy/strings";

type Step = "input" | "review";

interface WithdrawModalProps {
  show: boolean;
  onHide: () => void;
  position: Position;
  price: PriceFeed;
}

export function WithdrawModal({ show, onHide, position, price }: WithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<Step>("input");
  const withdraw = useWithdraw();

  const hasDebt = position.musdBorrowed > 0n;
  const maxStr = formatBTC(position.btcDeposited, { compact: true });

  const amountBigint = useMemo(() => {
    try { return parseBTC(amount); } catch { return 0n; }
  }, [amount]);

  const usdValue = amountBigint > 0n ? formatMUSD(btcToUSD(amountBigint, price.pricePerBtc)) : undefined;

  async function handleConfirm() {
    await withdraw.mutateAsync(amountBigint);
    setStep("input"); setAmount(""); onHide();
  }

  function handleClose() { setStep("input"); setAmount(""); onHide(); }

  return (
    <Modal show={show} onHide={handleClose} centered aria-labelledby="withdraw-modal-title">
      <Modal.Header closeButton style={{ border: "none" }}>
        <Modal.Title id="withdraw-modal-title" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
          {copy.withdraw.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {hasDebt && (
          <div
            className="d-flex p-3 mb-4 gap-2"
            style={{ background: "rgba(225,29,46,.07)", border: "1px solid rgba(225,29,46,.2)", borderRadius: "var(--r-2)" }}
            role="alert"
          >
            <span style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-mute)" }}>
              {copy.withdraw.blockedByDebt}
            </span>
          </div>
        )}

        {step === "input" && (
          <>
            <AssetAmountInput
              id="withdraw-amount"
              label={copy.withdraw.amountLabel}
              value={amount}
              onChange={setAmount}
              ticker="BTC"
              usdValue={usdValue}
              max={maxStr}
              disabled={hasDebt}
            />
            <button
              type="button"
              className="btn btn-primary w-100 mt-2"
              style={{ minHeight: 48 }}
              disabled={hasDebt || amountBigint <= 0n}
              onClick={() => setStep("review")}
            >
              Review
            </button>
          </>
        )}

        {step === "review" && (
          <TxSimulationPanel
            call={`withdrawCollateral(${amountBigint.toString()})`}
            gasEstimate="~41,000 gas (simulated)"
            balanceAfter={`-${formatBTC(amountBigint, { compact: true })} BTC`}
            onConfirm={() => void handleConfirm()}
            loading={withdraw.isPending}
          />
        )}
      </Modal.Body>
    </Modal>
  );
}
