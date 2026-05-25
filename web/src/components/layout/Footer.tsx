import { Link } from "react-router-dom";
import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--c-border)",
        padding: "var(--s-6) var(--s-4)",
        marginTop: "var(--s-8)",
      }}
    >
      <div
        className="container"
        style={{ maxWidth: 1200 }}
      >
        <div className="row align-items-center">
          <div className="col-md-4">
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1rem", letterSpacing: "0.05em" }}>
              COLLAT<span style={{ color: "var(--c-red-500)" }}>.</span>
            </span>
            <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-mute)", marginTop: "var(--s-2)" }}>
              Bank on Bitcoin.
            </div>
          </div>

          <div className="col-md-4 text-md-center my-4 my-md-0">
            <div className="d-flex flex-wrap justify-content-md-center gap-4">
              {[
                { to: "/dashboard", label: "Dashboard" },
                { to: "/card",      label: "Card" },
                { to: "/history",   label: "History" },
                { to: "/settings",  label: "Settings" },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  style={{ color: "var(--c-text-mute)", fontSize: "var(--fs-sm)", textDecoration: "none" }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="col-md-4 d-flex justify-content-md-end align-items-center gap-3">
            <a
              href="https://github.com/mzf11125/collat-mezo"
              target="_blank"
              rel="noreferrer"
              aria-label="Collat on GitHub"
              style={{ color: "var(--c-text-mute)", display: "flex" }}
            >
              <Github size={18} strokeWidth={1.5} />
            </a>
            <span style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-mute)" }}>
              Mezo Testnet
            </span>
          </div>
        </div>

        <div
          style={{ borderTop: "1px solid var(--c-border)", marginTop: "var(--s-6)", paddingTop: "var(--s-4)", fontSize: "var(--fs-sm)", color: "var(--c-text-mute)" }}
          className="d-flex flex-wrap justify-content-between gap-2"
        >
          <span>Collat is a protocol for BTC collateral on Mezo. Not financial advice.</span>
          <span>Built for the Mezo Hackathon 2026.</span>
        </div>
      </div>
    </footer>
  );
}
