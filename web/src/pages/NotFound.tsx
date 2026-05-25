import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container py-5 text-center page-transition" style={{ maxWidth: 480 }}>
      <div
        style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-hero)", fontWeight: 700, color: "var(--c-border)", lineHeight: 1, marginBottom: "var(--s-5)" }}
        aria-hidden="true"
      >
        404
      </div>
      <h1 style={{ fontFamily: "var(--font-display)", marginBottom: "var(--s-3)" }}>Page not found</h1>
      <p style={{ color: "var(--c-text-mute)", marginBottom: "var(--s-7)" }}>
        This page doesn't exist. Check the URL or return to the dashboard.
      </p>
      <Link to="/dashboard" className="btn btn-primary" style={{ minHeight: 48, paddingInline: "var(--s-7)" }}>
        Open Dashboard
      </Link>
    </div>
  );
}
