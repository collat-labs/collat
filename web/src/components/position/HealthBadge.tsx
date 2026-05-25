import { CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";
import type { HealthBand } from "@/lib/ltv";
import { healthLabel } from "@/lib/ltv";

interface HealthBadgeProps {
  band: HealthBand;
  className?: string;
}

const BAND_STYLES: Record<HealthBand, { color: string; bg: string; Icon: React.ElementType }> = {
  safe:    { color: "var(--c-success)", bg: "rgba(110,168,112,.12)", Icon: CheckCircle },
  caution: { color: "var(--c-warning)", bg: "rgba(212,167,58,.12)",  Icon: AlertCircle },
  danger:  { color: "var(--c-danger)",  bg: "rgba(225,29,46,.12)",   Icon: AlertTriangle },
};

export function HealthBadge({ band, className = "" }: HealthBadgeProps) {
  const { color, bg, Icon } = BAND_STYLES[band];
  const label = healthLabel(band);

  return (
    <span
      className={`d-inline-flex align-items-center gap-1 ${className}`}
      role="status"
      aria-label={`Health: ${label}`}
      style={{
        background: bg,
        color,
        border: `1px solid ${color}`,
        borderRadius: "var(--r-1)",
        padding: "2px var(--s-2)",
        fontSize: "var(--fs-sm)",
        fontWeight: 600,
      }}
    >
      <Icon size={12} strokeWidth={2} aria-hidden="true" />
      {label}
    </span>
  );
}
