import { Form } from "react-bootstrap";

interface AssetAmountInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  ticker: string;       // e.g. "BTC" or "MUSD"
  usdValue?: string;    // optional USD readout below
  max?: string;
  error?: string;
  disabled?: boolean;
  id?: string;
}

export function AssetAmountInput({
  label, value, onChange, ticker, usdValue, max, error, disabled = false, id = "asset-input",
}: AssetAmountInputProps) {
  function handleMax() {
    if (max !== undefined) onChange(max);
  }

  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <Form.Label htmlFor={id} className="mb-0" style={{ color: "var(--c-text-mute)", fontSize: "var(--fs-sm)" }}>
          {label}
        </Form.Label>
        {max !== undefined && (
          <button
            type="button"
            className="btn btn-link p-0"
            style={{ fontSize: "var(--fs-sm)", color: "var(--c-primary)", textDecoration: "none" }}
            onClick={handleMax}
            disabled={disabled}
            aria-label={`Set maximum ${ticker} amount`}
          >
            MAX
          </button>
        )}
      </div>

      <div
        className="d-flex align-items-center"
        style={{
          background: "var(--c-surface-2)",
          border: `1px solid ${error ? "var(--c-danger)" : "var(--c-border)"}`,
          borderRadius: "var(--r-2)",
          padding: "0 var(--s-3)",
          transition: `border-color var(--d-fast) var(--e-out)`,
        }}
      >
        <input
          id={id}
          type="text"
          inputMode="decimal"
          enterKeyHint="done"
          value={value}
          onChange={(e) => {
            const v = e.target.value.replace(/[^0-9.]/g, "");
            onChange(v);
          }}
          disabled={disabled}
          placeholder="0.00"
          aria-label={label}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--c-text)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--fs-mono-data)",
            padding: "var(--s-3) 0",
            fontVariantNumeric: "tabular-nums",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--fs-sm)",
            color: "var(--c-text-mute)",
            paddingLeft: "var(--s-2)",
            userSelect: "none",
          }}
        >
          {ticker}
        </span>
      </div>

      {usdValue && !error && (
        <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-mute)", marginTop: "var(--s-1)" }}>
          ≈ {usdValue}
        </div>
      )}

      {error && (
        <div
          id={`${id}-error`}
          role="alert"
          style={{ fontSize: "var(--fs-sm)", color: "var(--c-danger)", marginTop: "var(--s-1)" }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
