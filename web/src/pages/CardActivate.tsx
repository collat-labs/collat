import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Nfc, Key, Shield, Check } from "lucide-react";
import { copy } from "@/lib/copy/strings";

type Step = 1 | 2 | 3 | "done";

function NfcPulse() {
  return (
    <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto var(--s-6)" }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2px solid var(--c-primary)",
          }}
          animate={{ scale: [1, 1.8, 2.2], opacity: [0.6, 0.2, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
        />
      ))}
      <div
        style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--c-surface-2)", borderRadius: "50%", border: "1px solid var(--c-border)",
        }}
      >
        <Nfc size={36} strokeWidth={1.5} style={{ color: "var(--c-primary)" }} aria-hidden="true" />
      </div>
    </div>
  );
}

function ProgressDots() {
  return (
    <div className="d-flex justify-content-center gap-2 my-4">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--c-primary)" }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4 }}
        />
      ))}
    </div>
  );
}

function BackupDiagram({ pairedCount }: { pairedCount: number }) {
  return (
    <svg width="240" height="80" viewBox="0 0 240 80" aria-label={`${pairedCount} of 3 cards paired`} style={{ display: "block", margin: "0 auto var(--s-5)" }}>
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={i * 90 + 10}
          y={16}
          width={60}
          height={38}
          rx={6}
          fill={i < pairedCount ? "var(--grad-card-silver)" : "var(--c-surface-2)"}
          stroke={i < pairedCount ? "var(--c-silver-500)" : "var(--c-border)"}
          strokeWidth={1}
        />
      ))}
      {pairedCount > 1 && (
        <path d="M70 35 L100 35" stroke="var(--c-silver-500)" strokeWidth={1.5} strokeDasharray="4 2" markerEnd="url(#arr)" />
      )}
      {pairedCount > 2 && (
        <path d="M160 35 L190 35" stroke="var(--c-silver-500)" strokeWidth={1.5} strokeDasharray="4 2" markerEnd="url(#arr)" />
      )}
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0 0 L6 3 L0 6 Z" fill="var(--c-silver-500)" />
        </marker>
      </defs>
      {[0, 1, 2].map((i) => (
        <text
          key={i}
          x={i * 90 + 40}
          y={40}
          textAnchor="middle"
          fontSize={9}
          fill={i < pairedCount ? "var(--c-black)" : "var(--c-text-mute)"}
          fontFamily="var(--font-mono)"
          fontWeight={i < pairedCount ? 600 : 400}
        >
          {i < pairedCount ? "✓" : `CARD ${i + 1}`}
        </text>
      ))}
    </svg>
  );
}

export default function CardActivate() {
  const [step, setStep] = useState<Step>(1);
  const [pairedCount, setPairedCount] = useState(0);
  const [uids, setUids] = useState<string[]>([]);
  const [skipWarning, setSkipWarning] = useState(false);
  const navigate = useNavigate();

  const isFirstPair = pairedCount === 0;
  const cardLabel = isFirstPair ? "Primary card" : `Backup card ${pairedCount} of 2`;

  async function simulateTap() {
    const mockUid = (Math.random().toString(16).slice(2, 10)).toUpperCase();
    setUids((u) => [...u, mockUid]);
    setStep(2);
    await new Promise((r) => setTimeout(r, 2400));
    setPairedCount((c) => c + 1);
    setStep(3);
  }

  function pairAnother() {
    if (pairedCount >= 3) return;
    setStep(1);
  }

  function handleActivate() {
    localStorage.setItem("collat:cards", JSON.stringify(uids));
    setStep("done");
  }

  return (
    <div className="container py-5 page-transition" style={{ maxWidth: 500, textAlign: "center" }}>
      {/* Step indicator */}
      {step !== "done" && (
        <>
          <div className="d-flex justify-content-center gap-2 mb-3">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: step === s ? "var(--c-primary)" : "var(--c-border)",
                  transition: "background var(--d-base) var(--e-out)",
                }}
                aria-hidden="true"
              />
            ))}
          </div>
          <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-mute)", marginBottom: "var(--s-5)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {cardLabel}
          </div>
        </>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <NfcPulse />
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-h1)", marginBottom: "var(--s-3)" }}>
              {copy.cardActivate.step1Title}
            </h1>
            <p style={{ color: "var(--c-text-mute)", marginBottom: "var(--s-7)" }}>
              {copy.cardActivate.step1Body}
            </p>
            <button type="button" className="btn btn-primary w-100" style={{ minHeight: 52 }} onClick={() => void simulateTap()}>
              {copy.cardActivate.step1Simulate}
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <Key size={48} strokeWidth={1} style={{ color: "var(--c-primary)", marginBottom: "var(--s-5)" }} aria-hidden="true" />
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-h1)", marginBottom: "var(--s-4)" }}>
              {copy.cardActivate.step2Title}
            </h1>
            <p style={{ color: "var(--c-text-mute)", maxWidth: "40ch", margin: "0 auto var(--s-4)" }}>
              {copy.cardActivate.step2Body}
            </p>
            {uids.length > 0 && (
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-sm)", color: "var(--c-text-mute)", marginBottom: "var(--s-4)" }}>
                Card UID: …{uids[uids.length - 1].slice(-4)}
              </div>
            )}
            <ProgressDots />
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <Shield size={48} strokeWidth={1} style={{ color: "var(--c-silver-500)", marginBottom: "var(--s-5)" }} aria-hidden="true" />
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-h1)", marginBottom: "var(--s-3)" }}>
              {pairedCount === 1 ? copy.cardActivate.step3Title : `${pairedCount} cards paired`}
            </h1>
            <p style={{ color: "var(--c-text-mute)", maxWidth: "44ch", margin: "0 auto var(--s-6)" }}>
              {pairedCount < 3
                ? copy.cardActivate.step3Body
                : "All three cards are linked. Maximum redundancy reached."}
            </p>
            <BackupDiagram pairedCount={pairedCount} />

            <div className="d-flex flex-column gap-2">
              {pairedCount < 3 && (
                <button type="button" className="btn btn-primary w-100" style={{ minHeight: 48 }} onClick={pairAnother}>
                  {copy.cardActivate.step3CTA}
                </button>
              )}

              {pairedCount >= 2 ? (
                <button type="button" className="btn btn-primary w-100" style={{ minHeight: 48 }} onClick={handleActivate}>
                  Done — activate
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ color: "var(--c-text-mute)", border: "none", background: "none" }}
                  onClick={() => setSkipWarning(true)}
                >
                  {copy.cardActivate.step3Skip}
                </button>
              )}
            </div>

            {skipWarning && (
              <div
                className="mt-3 p-3"
                style={{ background: "rgba(225,29,46,.07)", border: "1px solid rgba(225,29,46,.2)", borderRadius: "var(--r-2)", fontSize: "var(--fs-sm)", color: "var(--c-text)", textAlign: "left" }}
                role="alert"
              >
                {copy.cardActivate.step3SkipWarning}
                <button type="button" className="btn btn-sm d-block mt-2 w-100 btn-danger" onClick={handleActivate}>
                  Skip anyway
                </button>
              </div>
            )}
          </motion.div>
        )}

        {step === "done" && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div style={{ marginBottom: "var(--s-4)", color: "var(--c-success)", display: "flex", justifyContent: "center" }}>
              <Check size={56} strokeWidth={1.5} aria-hidden="true" />
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-h1)", marginBottom: "var(--s-3)" }}>
              {copy.cardActivate.doneTitle}
            </h1>
            <p style={{ color: "var(--c-text-mute)", marginBottom: "var(--s-7)" }}>
              {pairedCount > 1
                ? `${pairedCount} cards linked to your Mezo ID. You can recover from any one of them.`
                : copy.cardActivate.doneBody}
            </p>
            <button type="button" className="btn btn-primary" style={{ minHeight: 52, paddingInline: "var(--s-7)" }} onClick={() => navigate("/dashboard")}>
              {copy.cardActivate.doneCTA}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
