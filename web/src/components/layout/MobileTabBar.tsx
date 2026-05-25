import { NavLink } from "react-router-dom";
import { Home, LayoutDashboard, CreditCard, History, Settings } from "lucide-react";

const TABS = [
  { to: "/",          label: "Home",      Icon: Home },
  { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/card",      label: "Card",      Icon: CreditCard },
  { to: "/history",   label: "History",   Icon: History },
  { to: "/settings",  label: "More",      Icon: Settings },
];

export function MobileTabBar() {
  return (
    <nav
      className="d-md-none"
      aria-label="Mobile tab navigation"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: "var(--z-nav)",
        background: "var(--c-surface)",
        borderTop: "1px solid var(--c-border)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="d-flex">
        {TABS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className="d-flex flex-column align-items-center justify-content-center flex-fill"
            style={({ isActive }) => ({
              padding: "var(--s-2) 0",
              color: isActive ? "var(--c-primary)" : "var(--c-text-mute)",
              textDecoration: "none",
              minHeight: 56,
              minWidth: 44,
              transition: `color var(--d-fast) var(--e-out)`,
            })}
            aria-label={label}
          >
            <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
            <span style={{ fontSize: 10, marginTop: 2 }}>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
