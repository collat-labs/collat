import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ShoppingCart } from "lucide-react";
import { copy } from "@/lib/copy/strings";

type Phase = "cart" | "step1" | "step2" | "step3" | "receipt";

const CART = [
  { name: copy.checkout.cartItem1,  price: copy.checkout.cartItem1Price, amount: 4.5 },
  { name: copy.checkout.cartItem2,  price: copy.checkout.cartItem2Price, amount: 28.0 },
];
const TOTAL = CART.reduce((s, c) => s + c.amount, 0);

const STEPS = [copy.checkout.step1, copy.checkout.step2, copy.checkout.step3];

export default function CheckoutDemo() {
  const [phase, setPhase] = useState<Phase>("cart");
  const [currentStep, setCurrentStep] = useState(0);

  async function handlePay() {
    setPhase("step1");
    for (let i = 0; i < STEPS.length; i++) {
      setCurrentStep(i);
      await new Promise((r) => setTimeout(r, 900 + Math.random() * 400));
    }
    setPhase("receipt");
  }

  return (
    <div className="container py-5 page-transition" style={{ maxWidth: 480 }}>
      <p className="eyebrow mb-4">Checkout Demo</p>
      <h1 style={{ fontFamily: "var(--font-display)", marginBottom: "var(--s-6)" }}>
        {copy.checkout.title}
      </h1>

      <AnimatePresence mode="wait">
        {phase === "cart" && (
          <motion.div key="cart" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="surface p-4 mb-4" style={{ borderRadius: "var(--r-3)" }}>
              <div className="d-flex align-items-center gap-2 mb-4">
                <ShoppingCart size={18} strokeWidth={1.5} aria-hidden="true" />
                <span style={{ fontWeight: 600 }}>Your cart</span>
              </div>
              {CART.map(({ name, price }) => (
                <div key={name} className="d-flex justify-content-between py-2" style={{ borderBottom: "1px solid var(--c-border)" }}>
                  <span>{name}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>{price}</span>
                </div>
              ))}
              <div className="d-flex justify-content-between pt-3 mt-2">
                <span style={{ fontWeight: 600 }}>{copy.checkout.total}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                  ${TOTAL.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
              style={{ minHeight: 56, fontSize: "1rem" }}
              onClick={() => void handlePay()}
            >
              {copy.checkout.payWithCollat}
            </button>
          </motion.div>
        )}

        {(phase === "step1" || phase === "step2" || phase === "step3") && (
          <motion.div key="steps" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="surface p-4" style={{ borderRadius: "var(--r-3)" }}>
              <div className="d-flex flex-column gap-4">
                {STEPS.map((label, i) => (
                  <div key={label} className="d-flex align-items-center gap-3">
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                      background: i < currentStep ? "var(--c-success)" : i === currentStep ? "var(--c-primary)" : "var(--c-border)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "background var(--d-base) var(--e-out)",
                    }}>
                      {i < currentStep
                        ? <Check size={14} strokeWidth={2} style={{ color: "#fff" }} aria-hidden="true" />
                        : i === currentStep
                          ? <div className="spinner-border spinner-border-sm" style={{ color: "#fff", width: 14, height: 14, borderWidth: 2 }} role="status" aria-label="Processing" />
                          : null}
                    </div>
                    <span style={{ fontSize: "var(--fs-sm)", color: i <= currentStep ? "var(--c-text)" : "var(--c-text-mute)" }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {phase === "receipt" && (
          <motion.div key="receipt" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="surface p-5 text-center" style={{ borderRadius: "var(--r-3)" }}>
              <div style={{ fontSize: 48, color: "var(--c-success)", marginBottom: "var(--s-4)" }}>
                <Check size={48} strokeWidth={1.5} aria-hidden="true" />
              </div>
              <h2 style={{ fontFamily: "var(--font-display)", marginBottom: "var(--s-3)" }}>{copy.checkout.receiptTitle}</h2>
              <div className="d-flex flex-column gap-2 mb-4">
                <div className="d-flex justify-content-between">
                  <span style={{ color: "var(--c-text-mute)", fontSize: "var(--fs-sm)" }}>{copy.checkout.receiptLine1}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-sm)" }}>${TOTAL.toFixed(2)} MUSD</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span style={{ color: "var(--c-text-mute)", fontSize: "var(--fs-sm)" }}>{copy.checkout.receiptLine2}</span>
                  <span style={{ color: "var(--c-success)", fontSize: "var(--fs-sm)" }}>✓</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span style={{ color: "var(--c-text-mute)", fontSize: "var(--fs-sm)" }}>{copy.checkout.receiptDebt}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-sm)" }}>+${TOTAL.toFixed(2)} MUSD</span>
                </div>
              </div>
              <button type="button" className="btn btn-sm" style={{ border: "1px solid var(--c-border)", color: "var(--c-text)", background: "transparent" }} onClick={() => setPhase("cart")}>
                Try again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
