import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls to `#hash` after route change. Use once at app root.
 * Respects `prefers-reduced-motion` (no smooth scroll).
 */
export function useHashScroll() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      return;
    }
    // Wait for the new route's DOM to mount
    const id = hash.replace(/^#/, "");
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
  }, [pathname, hash]);
}
