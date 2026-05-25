interface MetricStatProps {
  label: string;
  value: string;
  sub?: string;
  size?: "lg" | "md" | "sm";
  accent?: boolean;
  className?: string;
}

export function MetricStat({ label, value, sub, size = "md", accent = false, className = "" }: MetricStatProps) {
  const valueSizes = { lg: "var(--fs-mono-hero)", md: "var(--fs-mono-data)", sm: "var(--fs-body)" };

  return (
    <div className={className}>
      <div
        style={{
          fontSize: "var(--fs-sm)",
          color: "var(--c-text-mute)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: "var(--s-1)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: valueSizes[size],
          fontWeight: 600,
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          color: accent ? "var(--c-primary)" : "var(--c-text)",
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-mute)", marginTop: "var(--s-1)" }}>
          {sub}
        </div>
      )}
    </div>
  );
}
