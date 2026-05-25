import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { useChainAdapter } from "@/lib/chain/ChainAdapterProvider";
import { useAccount } from "@/hooks/useAccount";
import { copy } from "@/lib/copy/strings";

const MOCK_CHAIN_ID = 31612;

interface NetworkGuardProps {
  children: ReactNode;
}

export function NetworkGuard({ children }: NetworkGuardProps) {
  const adapter = useChainAdapter();
  const account = useAccount();
  const onCorrectChain = adapter.chainId() === MOCK_CHAIN_ID;

  if (!account) return <>{children}</>;
  if (onCorrectChain) return <>{children}</>;

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center text-center py-5"
      role="alert"
    >
      <AlertTriangle size={40} strokeWidth={1.5} style={{ color: "var(--c-warning)", marginBottom: "var(--s-5)" }} />
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-h2)", marginBottom: "var(--s-3)" }}>
        {copy.wallet.networkGuardTitle}
      </h2>
      <p style={{ color: "var(--c-text-mute)", maxWidth: "40ch", marginBottom: "var(--s-6)" }}>
        {copy.wallet.networkGuardSub}
      </p>
      <button type="button" className="btn btn-primary">
        {copy.wallet.switchNetwork}
      </button>
    </div>
  );
}
