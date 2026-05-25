import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { CollatCard } from "@/components/card/CollatCard";
import { copy } from "@/lib/copy/strings";

function readPairedCount(): number {
  try {
    const raw = localStorage.getItem("collat:cards");
    if (!raw) return 0;
    const arr = JSON.parse(raw) as string[];
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

export default function Card() {
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pairedCount, setPairedCount] = useState(() => readPairedCount());

  // Refresh paired status when window gets focus or storage changes
  useEffect(() => {
    function refresh() { setPairedCount(readPairedCount()); }
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const isPaired = pairedCount > 0;

  return (
    <div className="page-transition">
      {/* Hero */}
      <section
        style={{ minHeight: "85vh", background: "var(--c-black)", color: "var(--c-on-dark)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: "var(--s-9) var(--s-4)" }}
      >
        <p className="eyebrow mb-5">{copy.card.title}</p>
        <CollatCard size="lg" />
        <h1
          style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-hero)", lineHeight: "var(--lh-tight)", textAlign: "center", marginTop: "var(--s-7)", marginBottom: "var(--s-4)", color: "var(--c-on-dark)" }}
        >
          {copy.card.tagline}
        </h1>
        <p style={{ color: "var(--c-on-dark-mute)", maxWidth: "44ch", textAlign: "center", marginBottom: "var(--s-7)", padding: "0 var(--s-3)" }}>
          A physical NFC card with an EAL6+ secure chip. Your private key lives on the card — never extracted, never backed up in readable form.
        </p>

        <div className="d-flex flex-wrap justify-content-center gap-3" style={{ width: "100%", maxWidth: 460, padding: "0 var(--s-3)" }}>
          <button
            type="button"
            className="btn btn-primary flex-fill"
            style={{ minHeight: 52, paddingInline: "var(--s-6)", minWidth: 180 }}
            onClick={() => setShowWaitlist(true)}
          >
            {copy.card.orderBtn}
          </button>
          <Link
            to="/card/activate"
            className="btn flex-fill"
            style={{ minHeight: 52, paddingInline: "var(--s-6)", border: "1px solid var(--c-on-dark-mute)", color: "var(--c-on-dark)", background: "transparent", minWidth: 180, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
          >
            {copy.card.activateBtn}
          </Link>
        </div>

        {/* Paired status */}
        <div className="mt-4">
          <span style={{ fontSize: "var(--fs-sm)", color: isPaired ? "#7ad07e" : "var(--c-on-dark-mute)" }}>
            {isPaired
              ? `● ${pairedCount} card${pairedCount > 1 ? "s" : ""} paired`
              : `○ ${copy.card.statusNotPaired}`}
          </span>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "var(--s-10) var(--s-4)", borderTop: "1px solid var(--c-border)" }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <div className="row g-5">
            {[
              { title: copy.card.feature1Title, body: copy.card.feature1Body },
              { title: copy.card.feature2Title, body: copy.card.feature2Body },
              { title: copy.card.feature3Title, body: copy.card.feature3Body },
            ].map(({ title, body }) => (
              <div key={title} className="col-md-4">
                <h3 style={{ marginBottom: "var(--s-3)" }}>{title}</h3>
                <p style={{ color: "var(--c-text-mute)", margin: 0, fontSize: "var(--fs-sm)" }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist modal */}
      <Modal show={showWaitlist} onHide={() => setShowWaitlist(false)} centered aria-labelledby="waitlist-title">
        <Modal.Header closeButton style={{ border: "none" }}>
          <Modal.Title id="waitlist-title" style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
            Join the waitlist
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {submitted ? (
            <div className="text-center py-4">
              <div style={{ fontSize: 32, marginBottom: "var(--s-4)", color: "var(--c-success)" }}>✓</div>
              <p style={{ color: "var(--c-text-mute)" }}>You're on the list. We'll be in touch.</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); if (email.includes("@")) setSubmitted(true); }}
            >
              <div className="mb-3">
                <label htmlFor="waitlist-email" style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-mute)", display: "block", marginBottom: "var(--s-1)" }}>
                  Email address
                </label>
                <input
                  id="waitlist-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{
                    width: "100%", background: "var(--c-surface-2)", border: "1px solid var(--c-border)",
                    borderRadius: "var(--r-2)", padding: "var(--s-3)", color: "var(--c-text)",
                    fontFamily: "var(--font-sans)", fontSize: "var(--fs-body)", outline: "none",
                  }}
                  aria-required="true"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100"
                style={{ minHeight: 48 }}
                disabled={!email.includes("@")}
              >
                Request early access
              </button>
            </form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
