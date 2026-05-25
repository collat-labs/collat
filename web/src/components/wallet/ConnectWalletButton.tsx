import { useState } from "react";
import { Wallet } from "lucide-react";
import toast from "react-hot-toast";
import { useChainAdapter } from "@/lib/chain/ChainAdapterProvider";
import { useAccount } from "@/hooks/useAccount";
import { WalletModal } from "./WalletModal";
import { AddressPill } from "@/components/primitives/AddressPill";
import { copy } from "@/lib/copy/strings";

export function ConnectWalletButton() {
  const adapter = useChainAdapter();
  const account = useAccount();
  const [showModal, setShowModal] = useState(false);

  function handleConnect() {
    setShowModal(false);
    toast.success("Wallet connected");
  }

  function handleDisconnect() {
    adapter.disconnect();
    toast.success("Wallet disconnected");
  }

  if (account) {
    return (
      <div className="d-flex align-items-center gap-2">
        <span
          style={{
            width: 8, height: 8, background: "var(--c-success)",
            borderRadius: "50%", display: "inline-block",
          }}
          aria-hidden="true"
        />
        <AddressPill address={account} />
        <button
          type="button"
          className="btn btn-sm"
          style={{ color: "var(--c-text-mute)", fontSize: "var(--fs-sm)", padding: "2px var(--s-2)" }}
          onClick={handleDisconnect}
        >
          {copy.wallet.disconnect}
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-primary d-flex align-items-center gap-2"
        onClick={() => setShowModal(true)}
        aria-label={copy.nav.connect}
      >
        <Wallet size={16} strokeWidth={1.5} />
        <span>{copy.nav.connect}</span>
      </button>
      <WalletModal show={showModal} onHide={() => setShowModal(false)} onConnect={handleConnect} />
    </>
  );
}
