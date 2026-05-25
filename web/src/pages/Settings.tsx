import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useChainAdapter } from "@/lib/chain/ChainAdapterProvider";
import { MockChainAdapter } from "@/lib/chain/MockChainAdapter";
import { copy } from "@/lib/copy/strings";
import toast from "react-hot-toast";

type Theme = "dark" | "light" | "system";

export default function Settings() {
  const adapter = useChainAdapter();
  const qc = useQueryClient();
  const [theme, setTheme] = useState<Theme>(
    (localStorage.getItem("collat:theme") as Theme | null) ?? "light"
  );
  const [resetMsg, setResetMsg] = useState(false);

  useEffect(() => {
    if (theme === "system") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
    localStorage.setItem("collat:theme", theme);
  }, [theme]);

  function handleReset() {
    if (adapter instanceof MockChainAdapter) {
      adapter.reset();
    }
    // Clear card pairings too
    localStorage.removeItem("collat:cards");
    // Force every dependent React Query to refetch
    void qc.invalidateQueries();
    setResetMsg(true);
    toast.success(copy.settings.resetConfirm);
    setTimeout(() => setResetMsg(false), 3000);
  }

  return (
    <div className="container py-5 page-transition" style={{ maxWidth: 560 }}>
      <h1 style={{ fontFamily: "var(--font-display)", marginBottom: "var(--s-8)" }}>
        {copy.settings.title}
      </h1>

      {/* Theme */}
      <section className="mb-6" aria-labelledby="theme-heading">
        <h2 id="theme-heading" style={{ fontSize: "var(--fs-h3)", marginBottom: "var(--s-4)" }}>
          {copy.settings.theme}
        </h2>
        <div className="d-flex flex-wrap gap-2" role="radiogroup" aria-label="Choose theme">
          {([["light", copy.settings.themeLight], ["dark", copy.settings.themeDark], ["system", copy.settings.themeSystem]] as const).map(([t, label]) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={theme === t}
              className="btn btn-sm"
              style={{
                border: `1px solid ${theme === t ? "var(--c-primary)" : "var(--c-border)"}`,
                background: theme === t ? "rgba(225,29,46,.1)" : "transparent",
                color: theme === t ? "var(--c-primary)" : "var(--c-text-mute)",
                minHeight: 40, paddingInline: "var(--s-4)",
              }}
              onClick={() => setTheme(t)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <hr style={{ borderColor: "var(--c-border)", margin: "var(--s-7) 0" }} />

      {/* Reset */}
      <section aria-labelledby="reset-heading">
        <h2 id="reset-heading" style={{ fontSize: "var(--fs-h3)", marginBottom: "var(--s-2)" }}>
          {copy.settings.resetTitle}
        </h2>
        <p style={{ color: "var(--c-text-mute)", fontSize: "var(--fs-sm)", marginBottom: "var(--s-4)" }}>
          {copy.settings.resetBody}
        </p>
        {resetMsg && (
          <div
            role="status"
            aria-live="polite"
            style={{ fontSize: "var(--fs-sm)", color: "var(--c-success)", marginBottom: "var(--s-3)" }}
          >
            {copy.settings.resetConfirm}
          </div>
        )}
        <button
          type="button"
          className="btn btn-danger"
          onClick={handleReset}
        >
          {copy.settings.resetBtn}
        </button>
      </section>
    </div>
  );
}
