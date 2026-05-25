import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { shortAddress } from "@/lib/format";

interface AddressPillProps {
  address: string;
  full?: boolean;
  className?: string;
}

export function AddressPill({ address, full = false, className = "" }: AddressPillProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const display = full ? address : shortAddress(address);

  return (
    <span
      className={`d-inline-flex align-items-center gap-1 ${className}`}
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "var(--fs-sm)",
        color: "var(--c-text-mute)",
        background: "var(--c-surface-2)",
        border: "1px solid var(--c-border)",
        borderRadius: "var(--r-1)",
        padding: "2px var(--s-2)",
      }}
    >
      {display}
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Copied" : `Copy address ${address}`}
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "var(--c-text-mute)", display: "flex" }}
      >
        {copied
          ? <Check size={12} stroke="var(--c-success)" />
          : <Copy size={12} />
        }
      </button>
    </span>
  );
}
