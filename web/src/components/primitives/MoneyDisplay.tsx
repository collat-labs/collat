import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

interface MoneyDisplayProps {
  value: string;       // pre-formatted string e.g. "$16,128.00" or "0.84 BTC"
  size?: "hero" | "data" | "body" | "sm";
  muted?: boolean;
  className?: string;
  animate?: boolean;
}

export function MoneyDisplay({
  value, size = "data", muted = false, className = "", animate = true,
}: MoneyDisplayProps) {
  const [displayed, setDisplayed] = useState(value);
  const prev = useRef(value);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    if (value === prev.current || !animate || shouldReduce) {
      setDisplayed(value);
      prev.current = value;
      return;
    }
    // Snap immediately — a full number ticker adds complexity without proportional UX gain here
    setDisplayed(value);
    prev.current = value;
  }, [value, animate, shouldReduce]);

  const sizeClass = {
    hero:  "mono-hero",
    data:  "mono-data",
    body:  "",
    sm:    "fs-sm",
  }[size];

  return (
    <span
      className={`${sizeClass} tabular-nums${muted ? " text-mute" : ""}${className ? ` ${className}` : ""}`}
      style={{ fontFamily: "var(--font-mono)" }}
      aria-label={displayed}
    >
      {displayed}
    </span>
  );
}
