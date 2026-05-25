import { useState, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface CollatCardProps {
  size?: "lg" | "md" | "sm";
}

const SIZES = {
  lg: { w: 400, h: 252 },
  md: { w: 320, h: 202 },
  sm: { w: 240, h: 151 },
};

export function CollatCard({ size = "lg" }: CollatCardProps) {
  const { w, h } = SIZES[size];
  const shouldReduce = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (shouldReduce || !cardRef.current) return;
    // Skip tilt on coarse pointers (touch) — avoids jittery scroll-as-tilt on mobile
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rotateY = ((e.clientX - cx) / rect.width) * 10;
    const rotateX = -((e.clientY - cy) / rect.height) * 6;
    setRotate({ x: rotateX, y: rotateY });
  }

  function handleMouseLeave() {
    setRotate({ x: 0, y: 0 });
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={shouldReduce ? undefined : { rotateX: rotate.x, rotateY: rotate.y }}
      transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.5 }}
      style={{
        width: "min(100%, " + w + "px)",
        aspectRatio: `${w} / ${h}`,
        height: "auto",
        maxWidth: w,
        borderRadius: 16,
        background: "var(--grad-card-silver)",
        boxShadow: "var(--sh-card)",
        position: "relative",
        overflow: "hidden",
        transformStyle: "preserve-3d",
        perspective: 800,
        cursor: "default",
        userSelect: "none",
      }}
      aria-label="Collat Card — tap to sign NFC card"
    >
      {/* Chip illustration */}
      <div
        style={{
          position: "absolute",
          left: 24,
          top: h * 0.32,
          width: 42,
          height: 32,
          background: "linear-gradient(135deg, #c8a84b 0%, #f5d580 40%, #a07c2e 100%)",
          borderRadius: 5,
          border: "1px solid rgba(160,124,46,.5)",
        }}
        aria-hidden="true"
      />

      {/* Wordmark */}
      <div
        style={{
          position: "absolute",
          top: 22,
          left: 24,
          fontFamily: '"Geist Mono", ui-monospace, monospace',
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: "0.1em",
          color: "rgba(30,30,30,.9)",
        }}
      >
        COLLAT
        <span style={{ color: "rgba(180,20,30,.8)" }}>.</span>
      </div>

      {/* NFC indicator */}
      <div style={{ position: "absolute", top: 20, right: 24 }}>
        <svg width="28" height="22" viewBox="0 0 28 22" fill="none" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M ${6 + i * 5} 1 Q ${18 + i * 3} 11 ${6 + i * 5} 21`}
              stroke="rgba(60,60,60,.5)"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          ))}
        </svg>
      </div>

      {/* TAP TO SIGN label */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          left: 24,
          fontFamily: '"Geist Mono", ui-monospace, monospace',
          fontSize: size === "sm" ? 9 : 11,
          letterSpacing: "0.2em",
          color: "rgba(30,30,30,.5)",
          textTransform: "uppercase",
        }}
      >
        TAP TO SIGN
      </div>

      {/* Mezo badge */}
      <div
        style={{
          position: "absolute",
          bottom: 22,
          right: 24,
          fontFamily: '"Geist", system-ui, sans-serif',
          fontSize: size === "sm" ? 9 : 10,
          fontWeight: 600,
          letterSpacing: "0.1em",
          color: "rgba(30,30,30,.4)",
          textTransform: "uppercase",
        }}
      >
        MEZO
      </div>

      {/* Holographic sheen overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,.15) 50%, transparent 70%)",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />
    </motion.div>
  );
}
