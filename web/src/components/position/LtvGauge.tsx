import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { formatLTV } from "@/lib/format";

interface LtvGaugeProps {
  ltvBps: number;  // 0–10000
  size?: number;
}

const R = 80;
const CX = 110;
const CY = 110;
const SWEEP = 220; // degrees the arc spans

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const s = polarToCartesian(cx, cy, r, startDeg);
  const e = polarToCartesian(cx, cy, r, endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
}

const START_DEG = -SWEEP / 2 - 90 + 90; // -20
const MAX_LTV_DEG = START_DEG + (6000 / 10000) * SWEEP;  // 60% mark
const LIQ_DEG     = START_DEG + (7500 / 10000) * SWEEP;  // 75% mark

export function LtvGauge({ ltvBps, size = 220 }: LtvGaugeProps) {
  const shouldReduce = useReducedMotion();
  const pathRef = useRef<SVGPathElement>(null);
  const needleRef = useRef<SVGLineElement>(null);

  const arcStart = START_DEG;
  const arcEnd   = arcStart + SWEEP;
  const fillEnd  = START_DEG + (Math.min(ltvBps, 10000) / 10000) * SWEEP;

  // Colour based on band
  const fillColor =
    ltvBps >= 7500 ? "var(--c-danger)" :
    ltvBps >= 6000 ? "var(--c-warning)" :
    "var(--c-success)";

  // Needle angle (maps ltvBps to arcStart..arcEnd)
  const needleAngle = arcStart + (Math.min(ltvBps, 10000) / 10000) * SWEEP;
  const needleTip = polarToCartesian(CX, CY, R - 8, needleAngle);
  const needleBase = polarToCartesian(CX, CY, 12, needleAngle + 180);

  useEffect(() => {
    const dur = shouldReduce ? 0 : 380;
    if (pathRef.current) {
      pathRef.current.style.transition = `stroke-dashoffset ${dur}ms var(--e-out)`;
    }
  }, [shouldReduce]);

  const viewSize = 220;

  return (
    <div
      role="img"
      aria-label={`LTV gauge: ${formatLTV(ltvBps)}`}
      style={{ width: "100%", maxWidth: size, height: "auto", position: "relative" }}
    >
      <svg
        viewBox={`0 0 ${viewSize} ${viewSize * 0.65}`}
        width="100%"
        height="auto"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block", overflow: "visible" }}
        aria-hidden="true"
      >
        {/* Track */}
        <path
          d={describeArc(CX, CY, R, arcStart, arcEnd)}
          fill="none"
          stroke="var(--c-border)"
          strokeWidth={14}
          strokeLinecap="round"
        />

        {/* 60% band marker */}
        <path
          d={describeArc(CX, CY, R, MAX_LTV_DEG - 1, MAX_LTV_DEG + 1)}
          fill="none"
          stroke="var(--c-warning)"
          strokeWidth={18}
          strokeLinecap="round"
          opacity={0.6}
        />

        {/* 75% liquidation marker */}
        <path
          d={describeArc(CX, CY, R, LIQ_DEG - 1, LIQ_DEG + 1)}
          fill="none"
          stroke="var(--c-danger)"
          strokeWidth={18}
          strokeLinecap="round"
          opacity={0.7}
        />

        {/* Fill arc */}
        <path
          ref={pathRef}
          d={describeArc(CX, CY, R, arcStart, fillEnd)}
          fill="none"
          stroke={fillColor}
          strokeWidth={14}
          strokeLinecap="round"
        />

        {/* Needle */}
        <line
          ref={needleRef}
          x1={needleBase.x}
          y1={needleBase.y}
          x2={needleTip.x}
          y2={needleTip.y}
          stroke="var(--c-text)"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <circle cx={CX} cy={CY} r={5} fill="var(--c-text)" />

        {/* LTV label */}
        <text
          x={CX}
          y={CY + 24}
          textAnchor="middle"
          fill="var(--c-text)"
          fontSize={22}
          fontFamily="var(--font-mono)"
          fontWeight="600"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {formatLTV(ltvBps)}
        </text>
        <text
          x={CX}
          y={CY + 38}
          textAnchor="middle"
          fill="var(--c-text-mute)"
          fontSize={10}
          fontFamily="var(--font-sans)"
          letterSpacing="0.1em"
          textDecoration="uppercase"
        >
          LTV
        </text>

        {/* Scale labels */}
        {[
          { bps: 0, label: "0%" },
          { bps: 6000, label: "60%" },
          { bps: 7500, label: "75%" },
        ].map(({ bps, label }) => {
          const angle = arcStart + (bps / 10000) * SWEEP;
          const pt = polarToCartesian(CX, CY, R + 20, angle);
          return (
            <text key={bps} x={pt.x} y={pt.y + 4} textAnchor="middle"
              fill="var(--c-text-mute)" fontSize={9} fontFamily="var(--font-mono)">
              {label}
            </text>
          );
        })}
      </svg>
      <div aria-live="polite" className="visually-hidden">
        {`LTV is ${formatLTV(ltvBps)}`}
      </div>
    </div>
  );
}

