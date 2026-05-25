import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";
import { copy } from "@/lib/copy/strings";

const NAV_LINKS = [
  { to: "/#how-it-works", label: copy.nav.product, internal: true  },
  { to: "/card",          label: copy.nav.card,    internal: true  },
  { to: "/#ai",           label: copy.nav.ai,      internal: true  },
  { to: "https://github.com/mzf11125/collat-mezo", label: copy.nav.docs, internal: false },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="d-flex align-items-center justify-content-between"
      style={{
        position: "sticky",
        top: 0,
        zIndex: "var(--z-nav)",
        background: "var(--c-bg)",
        borderBottom: "1px solid var(--c-border)",
        padding: "0 var(--s-4)",
        height: 60,
      }}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <Link
        to="/"
        style={{
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
          fontSize: "1.125rem",
          letterSpacing: "0.05em",
          color: "var(--c-text)",
          textDecoration: "none",
        }}
        aria-label="Collat home"
      >
        COLLAT
        <span style={{ color: "var(--c-red-500)" }}>.</span>
      </Link>

      {/* Desktop links */}
      <div className="d-none d-lg-flex align-items-center gap-4">
        {NAV_LINKS.map(({ to, label, internal }) =>
          internal ? (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                color: isActive ? "var(--c-text)" : "var(--c-text-mute)",
                textDecoration: "none",
                fontSize: "var(--fs-sm)",
                fontWeight: isActive ? 600 : 400,
                transition: `color var(--d-fast) var(--e-out)`,
              })}
            >
              {label}
            </NavLink>
          ) : (
            <a
              key={to}
              href={to}
              target="_blank"
              rel="noreferrer"
              style={{
                color: "var(--c-text-mute)",
                textDecoration: "none",
                fontSize: "var(--fs-sm)",
              }}
            >
              {label}
            </a>
          )
        )}
      </div>

      {/* Connect + hamburger */}
      <div className="d-flex align-items-center gap-2">
        <div className="d-none d-lg-block">
          <ConnectWalletButton />
        </div>
        <button
          type="button"
          className="d-lg-none btn p-0"
          style={{ color: "var(--c-text)", minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close navigation" : "Open navigation"}
        >
          {open ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          id="mobile-nav"
          style={{
            position: "fixed",
            inset: "60px 0 0 0",
            background: "var(--c-bg)",
            borderTop: "1px solid var(--c-border)",
            padding: "var(--s-6) var(--s-4)",
            zIndex: "var(--z-nav)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--s-5)",
            overflowY: "auto",
          }}
        >
          {NAV_LINKS.map(({ to, label, internal }) =>
            internal ? (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                style={{ color: "var(--c-text)", textDecoration: "none", fontSize: "var(--fs-h3)", fontWeight: 500 }}
              >
                {label}
              </NavLink>
            ) : (
              <a
                key={to}
                href={to}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                style={{ color: "var(--c-text)", textDecoration: "none", fontSize: "var(--fs-h3)", fontWeight: 500 }}
              >
                {label}
              </a>
            )
          )}
          <div className="mt-3">
            <ConnectWalletButton />
          </div>
        </div>
      )}
    </nav>
  );
}
