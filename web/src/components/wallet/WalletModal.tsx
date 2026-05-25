import { useState } from "react";
import { Modal } from "react-bootstrap";
import { Shield, Chrome, Users } from "lucide-react";
import { useChainAdapter } from "@/lib/chain/ChainAdapterProvider";
import type { WalletOption } from "@/lib/chain/types";
import { copy } from "@/lib/copy/strings";

const OPTIONS: { id: WalletOption; label: string; desc: string; Icon: React.ElementType }[] = [
  { id: "passport", label: copy.wallet.passport, desc: copy.wallet.passportDesc, Icon: Shield },
  { id: "metamask", label: copy.wallet.metamask, desc: copy.wallet.metamaskDesc, Icon: Chrome },
  { id: "safe",     label: copy.wallet.safe,     desc: copy.wallet.safeDesc,     Icon: Users },
];

interface WalletModalProps {
  show: boolean;
  onHide: () => void;
  onConnect: () => void;
}

export function WalletModal({ show, onHide, onConnect }: WalletModalProps) {
  const adapter = useChainAdapter();
  const [loading, setLoading] = useState<WalletOption | null>(null);

  async function handleSelect(id: WalletOption) {
    setLoading(id);
    try {
      await adapter.connect(id);
      onConnect();
    } finally {
      setLoading(null);
    }
  }

  return (
    <Modal
      show={show}
      onHide={loading ? undefined : onHide}
      backdrop={loading ? "static" : true}
      keyboard={!loading}
      centered
      aria-labelledby="wallet-modal-title"
    >
      <Modal.Header
        closeButton
        style={{ border: "none", paddingBottom: 0 }}
      >
        <Modal.Title id="wallet-modal-title" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
          {copy.wallet.connectTitle}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ paddingTop: "var(--s-3)" }}>
        <p style={{ color: "var(--c-text-mute)", fontSize: "var(--fs-sm)", marginBottom: "var(--s-5)" }}>
          {copy.wallet.connectSub}
        </p>
        <div className="d-flex flex-column gap-2">
          {OPTIONS.map(({ id, label, desc, Icon }) => (
            <button
              key={id}
              type="button"
              className="d-flex align-items-center gap-3 text-start"
              style={{
                background: "var(--c-surface-2)",
                border: "1px solid var(--c-border)",
                borderRadius: "var(--r-3)",
                padding: "var(--s-4)",
                cursor: loading ? "not-allowed" : "pointer",
                transition: `border-color var(--d-fast) var(--e-out), background var(--d-fast) var(--e-out)`,
                opacity: loading && loading !== id ? 0.5 : 1,
                width: "100%",
              }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.borderColor = "var(--c-red-500)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--c-border)"; }}
              onClick={() => { if (!loading) void handleSelect(id); }}
              disabled={!!loading}
              aria-label={`Connect with ${label}`}
            >
              <Icon size={24} strokeWidth={1.5} style={{ color: "var(--c-text-mute)", flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-mute)" }}>{desc}</div>
              </div>
              {loading === id && (
                <div className="ms-auto spinner-border spinner-border-sm text-primary" role="status" aria-label="Connecting" />
              )}
            </button>
          ))}
        </div>
      </Modal.Body>
    </Modal>
  );
}
