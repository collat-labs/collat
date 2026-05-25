import { useState, useMemo } from "react";
import { Modal } from "react-bootstrap";
import { AssetAmountInput } from "@/components/primitives/AssetAmountInput";
import { TxSimulationPanel } from "./TxSimulationPanel";
import { useDeposit } from "@/hooks/useDeposit";
import { parseBTC, formatBTC, btcToUSD, formatMUSD } from "@/lib/format";
import type { PriceFeed } from "@/lib/chain/types";
import { copy } from "@/lib/copy/strings";

type Step = "input" | "review";

interface DepositModalProps {
  show: boolean;
  onHide: () => void;
  price: PriceFeed;
  prefillAmount?: string;
}

export function DepositModal({ show, onHide, price, prefillAmount }: DepositModalProps) {
  const [amount, setAmount] = useState(prefillAmount ?? "");
  const [step, setStep] = useState<Step>("input");
  const deposit = useDeposit();

  const amountBigint = useMemo(() => {
    try { return parseBTC(amount); } catch { return 0n; }
  }, [amount]);

  const usdValue = amountBigint > 0n ? formatMUSD(btcToUSD(amountBigint, price.pricePerBtc)) : undefined;

  async function handleConfirm() {
    await deposit.mutateAsync(amountBigint);
    setStep("input");
    setAmount("");
    onHide();
  }

  function handleClose() { setStep("input"); setAmount(""); onHide(); }

  return (
    <Modal show={show} onHide={handleClose} centered aria-labelledby="deposit-modal-title">
      <Modal.Header closeButton style={{ border: "none" }}>
        <Modal.Title id="deposit-modal-title" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
          {copy.deposit.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {step === "input" && (
          <>
            <AssetAmountInput
              id="deposit-amount"
              label={copy.deposit.amountLabel}
              value={amount}
              onChange={setAmount}
              ticker="BTC"
              usdValue={usdValue}
            />
            <button
              type="button"
              className="btn btn-primary w-100 mt-2"
              style={{ minHeight: 48 }}
              disabled={amountBigint <= 0n}
              onClick={() => setStep("review")}
            >
              Review
            </button>
          </>
        )}
        {step === "review" && (
          <TxSimulationPanel
            call={`depositCollateral(${amountBigint.toString()})`}
            gasEstimate="~38,000 gas (simulated)"
            balanceAfter={`+${formatBTC(amountBigint, { compact: true })} BTC`}
            onConfirm={() => void handleConfirm()}
            loading={deposit.isPending}
          />
        )}
      </Modal.Body>
    </Modal>
  );
}
