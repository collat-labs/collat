import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, Clock } from "lucide-react";
import { CollatCard } from "@/components/card/CollatCard";
import { copy } from "@/lib/copy/strings";

const STEPS = [
  { n: "01", title: "Deposit BTC", body: "Lock BTC as collateral in your Collat vault. One-time setup." },
  { n: "02", title: "Shop Normally", body: "Pay online or in-store. Collat auto-borrows the exact MUSD needed and settles the merchant instantly." },
  { n: "03", title: "Repay and Unlock", body: "Repay MUSD at any time. BTC is released proportionally back to you." },
];

const DIFF = [
  { Icon: Zap,    title: "No manual borrow step",  body: "Collat triggers the loan automatically at checkout." },
  { Icon: Shield, title: "BTC stays on-chain",      body: "Your collateral never leaves the Mezo smart contract." },
  { Icon: Clock,  title: "Repay on your schedule",  body: "No fixed deadlines. No liquidation on everyday purchases." },
];

const AI_FEATURES = [
  { title: "Liquidation Prediction", body: "Monitors on-chain flows, funding rates, and macro signals. Proactive alerts before volatility hits your position." },
  { title: "Smart Spending Limits",  body: "Dynamic per-transaction limit based on volatility, repayment history, and MUSD liquidity." },
  { title: "Tax-Intelligent Routing", body: "Classifies each auto-borrow by category. Generates a year-end tax report." },
  { title: "Natural Language Manager", body: '"Hey Collat, how much can I spend?" Conversational interface to check LTV and manage your position.' },
];

const TOOLING = [
  { name: "Spectrum Nodes",    role: "Primary RPC on Mezo testnet." },
  { name: "Validation Cloud",  role: "Enterprise RPC on Mezo mainnet." },
  { name: "Goldsky",           role: "Indexes vault events. Powers the dashboard." },
  { name: "Tenderly",          role: "Simulates flows pre-deploy. Monitors production." },
  { name: "Boar Network",      role: "Blockchain MCP for the AI agent." },
];

const stagger = { container: { animate: { transition: { staggerChildren: 0.04 } } } };
const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.2, 0.8, 0.2, 1] } },
};

export default function Landing() {
  return (
    <div className="page-transition">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section
        style={{ minHeight: "82vh", display: "flex", alignItems: "center", padding: "var(--s-9) var(--s-4) var(--s-8)" }}
        aria-label="Hero"
      >
        <div className="container" style={{ maxWidth: 1200 }}>
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <motion.div variants={stagger.container} initial="initial" animate="animate">
                <motion.p variants={fadeUp} className="eyebrow mb-4">
                  {copy.brand.tagline}
                </motion.p>
                <motion.h1
                  variants={fadeUp}
                  style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-hero)", lineHeight: "var(--lh-tight)", marginBottom: "var(--s-5)" }}
                >
                  {copy.brand.heroLine1}<br />
                  <em>{copy.brand.heroLine2}</em>
                </motion.h1>
                <motion.p
                  variants={fadeUp}
                  style={{ color: "var(--c-text-mute)", maxWidth: "52ch", marginBottom: "var(--s-7)", fontSize: "1.0625rem", lineHeight: "var(--lh-body)" }}
                >
                  {copy.brand.heroSub}
                </motion.p>
                <motion.div variants={fadeUp} className="d-flex flex-wrap gap-3">
                  <Link
                    to="/dashboard"
                    className="btn btn-primary d-inline-flex align-items-center gap-2"
                    style={{ minHeight: 52, paddingInline: "var(--s-6)", fontSize: "1rem" }}
                  >
                    Open Vault
                    <ArrowRight size={16} strokeWidth={1.5} />
                  </Link>
                  <a
                    href="#how-it-works"
                    className="btn d-inline-flex align-items-center gap-1"
                    style={{ minHeight: 52, paddingInline: "var(--s-6)", border: "1px solid var(--c-border)", color: "var(--c-text)", background: "transparent", fontSize: "1rem" }}
                  >
                    See how it works ↘
                  </a>
                </motion.div>
              </motion.div>
            </div>

            {/* Proof rail */}
            <div className="col-lg-5 d-none d-lg-block">
              <div
                className="surface p-4"
                style={{ borderRadius: "var(--r-3)", opacity: 0.9 }}
                aria-label="Live position preview"
              >
                <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-mute)", marginBottom: "var(--s-3)", letterSpacing: "0.05em" }}>
                  YOUR POSITION
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-hero)", fontWeight: 600, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                  0.84
                  <span style={{ fontSize: "1.5rem", color: "var(--c-text-mute)", marginLeft: "var(--s-2)" }}>BTC</span>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-data)", color: "var(--c-text-mute)", marginTop: "var(--s-2)" }}>
                  $58,914 · 32% LTV
                </div>
                <div
                  style={{ borderTop: "1px solid var(--c-border)", marginTop: "var(--s-4)", paddingTop: "var(--s-4)" }}
                  className="d-flex justify-content-between"
                >
                  <div>
                    <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-mute)" }}>MUSD Borrowed</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums", marginTop: "var(--s-1)" }}>$16,128.00</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-mute)" }}>Health</div>
                    <div style={{ marginTop: "var(--s-1)", color: "var(--c-success)", fontWeight: 600 }}>Healthy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: "var(--s-9) var(--s-4)", borderTop: "1px solid var(--c-border)" }}>
        <div className="container" style={{ maxWidth: 1200 }}>
          <h2 className="text-center mb-5" style={{ fontFamily: "var(--font-display)" }}>How it works</h2>
          <div className="row g-4">
            {STEPS.map(({ n, title, body }) => (
              <div key={n} className="col-md-4">
                <div className="surface p-4 h-100">
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "var(--fs-hero)",
                      fontWeight: 700,
                      lineHeight: 0.9,
                      color: "var(--c-primary)",
                      marginBottom: "var(--s-5)",
                      opacity: 0.8,
                    }}
                    aria-hidden="true"
                  >
                    {n}
                  </div>
                  <h3 style={{ marginBottom: "var(--s-3)" }}>{title}</h3>
                  <p style={{ color: "var(--c-text-mute)", margin: 0 }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why it feels different ─────────────────────── */}
      <section style={{ padding: "var(--s-9) var(--s-4)", borderTop: "1px solid var(--c-border)" }}>
        <div className="container" style={{ maxWidth: 1200 }}>
          <h2 className="mb-5" style={{ fontFamily: "var(--font-display)" }}>Why it feels different</h2>
          <div className="row g-5">
            {DIFF.map(({ Icon, title, body }) => (
              <div key={title} className="col-md-4">
                <Icon size={28} strokeWidth={1.5} style={{ color: "var(--c-primary)", marginBottom: "var(--s-4)" }} aria-hidden="true" />
                <h3 style={{ marginBottom: "var(--s-2)" }}>{title}</h3>
                <p style={{ color: "var(--c-text-mute)", margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Collat Card ───────────────────────────────────── */}
      <section
        style={{ padding: "var(--s-9) var(--s-4)", background: "var(--c-black)", color: "var(--c-on-dark)", borderTop: "1px solid var(--c-black)", borderBottom: "1px solid var(--c-black)" }}
      >
        <div className="container text-center" style={{ maxWidth: 1200 }}>
          <p className="eyebrow mb-4">Phase 4</p>
          <h2 className="mb-5" style={{ fontFamily: "var(--font-display)", color: "var(--c-on-dark)" }}>The Collat Card</h2>
          <div className="d-flex justify-content-center mb-5">
            <CollatCard size="lg" />
          </div>
          <p className="mb-5" style={{ color: "var(--c-on-dark-mute)", maxWidth: "50ch", margin: "0 auto var(--s-7)", fontSize: "1.0625rem" }}>
            A physical NFC card with an EAL6+ secure chip that stores your Mezo wallet private key. Tap to sign. Self-custody always.
          </p>

          {/* Comparison table */}
          <div style={{ overflowX: "auto" }}>
            <table className="table table-borderless mx-auto" style={{ maxWidth: 640, color: "var(--c-on-dark)", fontSize: "var(--fs-sm)" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${SILVER}` }}>
                  <th style={{ color: "var(--c-on-dark-mute)", fontWeight: 400 }}>Factor</th>
                  <th style={{ color: "var(--c-on-dark-mute)", fontWeight: 400 }}>Collat Card</th>
                  <th style={{ color: "var(--c-on-dark-mute)", fontWeight: 400 }}>Traditional Visa</th>
                </tr>
              </thead>
              <tbody>
                {CARD_TABLE.map(({ factor, collat, visa }) => (
                  <tr key={factor} style={{ borderBottom: `1px solid rgba(168,174,182,.15)` }}>
                    <td style={{ color: "var(--c-on-dark-mute)" }}>{factor}</td>
                    <td style={{ color: "var(--c-on-dark)", fontWeight: 500 }}>{collat}</td>
                    <td style={{ color: "var(--c-silver-500)" }}>{visa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5">
            <Link to="/card" className="btn btn-primary" style={{ minHeight: 48, paddingInline: "var(--s-7)" }}>
              Learn more
            </Link>
          </div>
        </div>
      </section>

      {/* ── AI is the moat ────────────────────────────────── */}
      <section id="ai" style={{ padding: "var(--s-9) var(--s-4)", borderTop: "1px solid var(--c-border)" }}>
        <div className="container" style={{ maxWidth: 1200 }}>
          <p className="eyebrow mb-3">Defensible moat</p>
          <h2 className="mb-2" style={{ fontFamily: "var(--font-display)" }}>AI is the advantage</h2>
          <p style={{ color: "var(--c-text-mute)", maxWidth: "52ch", marginBottom: "var(--s-8)" }}>
            If someone forks the contracts, the winner is whoever has better risk management. AI improves with data; fixed thresholds don't.
          </p>
          <div className="row g-4">
            {AI_FEATURES.map(({ title, body }) => (
              <div key={title} className="col-md-6">
                <div className="surface-2 p-4 h-100" style={{ borderRadius: "var(--r-3)" }}>
                  <h3 style={{ fontSize: "var(--fs-h3)", marginBottom: "var(--s-2)" }}>{title}</h3>
                  <p style={{ color: "var(--c-text-mute)", margin: 0, fontSize: "var(--fs-sm)" }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Built on Mezo ─────────────────────────────────── */}
      <section style={{ padding: "var(--s-9) var(--s-4)", borderTop: "1px solid var(--c-border)" }}>
        <div className="container" style={{ maxWidth: 1200 }}>
          <blockquote style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-h1)", fontStyle: "italic", lineHeight: "var(--lh-tight)", maxWidth: "20ch", marginBottom: "var(--s-8)", color: "var(--c-text-mute)" }}>
            "Bank on yourself."
          </blockquote>
          <h2 className="mb-5" style={{ fontFamily: "var(--font-sans)" }}>Built on Mezo</h2>
          <div className="row g-3">
            {TOOLING.map(({ name, role }) => (
              <div key={name} className="col-md-4 col-lg">
                <div className="surface p-3 h-100" style={{ borderRadius: "var(--r-3)" }}>
                  <div style={{ fontWeight: 600, marginBottom: "var(--s-1)", fontSize: "var(--fs-sm)" }}>{name}</div>
                  <div style={{ color: "var(--c-text-mute)", fontSize: "var(--fs-sm)" }}>{role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const SILVER = "rgba(168,174,182,.3)";

const CARD_TABLE = [
  { factor: "Issuer",      collat: "None. Self-custody.",            visa: "Bank/Visa partnership required." },
  { factor: "KYC",         collat: "None.",                          visa: "Mandatory." },
  { factor: "Private key", collat: "On-chip, never leaves.",         visa: "Held by issuer." },
  { factor: "Spending",    collat: "Auto-borrow MUSD via NFC tap.",  visa: "Fiat via Visa network." },
  { factor: "Timeline",    collat: "Ship tomorrow.",                  visa: "Months of legal + integration." },
];
