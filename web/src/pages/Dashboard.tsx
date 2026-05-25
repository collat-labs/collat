import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, CreditCard, RotateCcw, Activity } from "lucide-react";
import { usePosition } from "@/hooks/usePosition";
import { usePrice } from "@/hooks/usePrice";
import { useEvents } from "@/hooks/useEvents";
import { useAccount } from "@/hooks/useAccount";
import { calcLTV, calcMaxBorrow, healthBand } from "@/lib/ltv";
import { formatBTC, formatMUSD, formatPrice, btcToUSD, formatTimestamp, formatLTV } from "@/lib/format";
import { LtvGauge } from "@/components/position/LtvGauge";
import { HealthBadge } from "@/components/position/HealthBadge";
import { PositionCard } from "@/components/position/PositionCard";
import { DepositModal } from "@/components/actions/DepositModal";
import { WithdrawModal } from "@/components/actions/WithdrawModal";
import { BorrowModal } from "@/components/actions/BorrowModal";
import { RepayModal } from "@/components/actions/RepayModal";
import { LiquidationAlertCard } from "@/components/ai/LiquidationAlertCard";
import { SmartLimitWidget } from "@/components/ai/SmartLimitWidget";
import { NaturalLanguageChat } from "@/components/ai/NaturalLanguageChat";
import { MetricStat } from "@/components/primitives/MetricStat";
import { EmptyState } from "@/components/primitives/EmptyState";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";
import { NetworkGuard } from "@/components/wallet/NetworkGuard";
import { copy } from "@/lib/copy/strings";

type Modal = "deposit" | "withdraw" | "borrow" | "repay" | null;

const EVENT_COLOURS: Record<string, string> = {
  Deposited: "var(--c-success)",
  Withdrawn:  "var(--c-text-mute)",
  Borrowed:  "var(--c-silver-500)",
  Repaid:    "var(--c-text-mute)",
  Liquidated: "var(--c-danger)",
};

export default function Dashboard() {
  const account = useAccount();
  const [modal, setModal] = useState<Modal>(null);

  const { data: position, isLoading: posLoading } = usePosition();
  const { data: price, isLoading: priceLoading } = usePrice();
  const { data: events } = useEvents();

  if (!account) {
    return (
      <div className="container py-5 text-center page-transition" style={{ maxWidth: 480 }}>
        <h1 style={{ fontFamily: "var(--font-display)", marginBottom: "var(--s-4)" }}>Connect your wallet</h1>
        <p style={{ color: "var(--c-text-mute)", marginBottom: "var(--s-6)" }}>
          Connect a wallet to view your Collat position.
        </p>
        <ConnectWalletButton />
      </div>
    );
  }

  const loading = posLoading || priceLoading;

  if (loading) {
    return (
      <div className="container py-5 page-transition" style={{ maxWidth: 1200 }}>
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="skeleton mb-4" style={{ height: 120, borderRadius: "var(--r-3)" }} />
            <div className="skeleton mb-4" style={{ height: 60, borderRadius: "var(--r-3)" }} />
            <div className="skeleton" style={{ height: 180, borderRadius: "var(--r-3)" }} />
          </div>
          <div className="col-lg-4">
            <div className="skeleton mb-4" style={{ height: 120, borderRadius: "var(--r-3)" }} />
            <div className="skeleton" style={{ height: 120, borderRadius: "var(--r-3)" }} />
          </div>
        </div>
      </div>
    );
  }

  if (!position || position.btcDeposited === 0n) {
    return (
      <NetworkGuard>
        <div className="container py-5 page-transition" style={{ maxWidth: 600 }}>
          <EmptyState
            title={copy.dashboard.emptyTitle}
            body={copy.dashboard.emptyExplainer}
            cta={
              <div className="d-flex gap-3">
                {copy.dashboard.emptyAssurances.map((a) => (
                  <span key={a} style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-mute)", padding: "var(--s-1) var(--s-3)", border: "1px solid var(--c-border)", borderRadius: "var(--r-1)" }}>
                    {a}
                  </span>
                ))}
              </div>
            }
          />
          <div className="d-flex justify-content-center mt-4">
            <button type="button" className="btn btn-primary" style={{ minHeight: 52, paddingInline: "var(--s-7)" }} onClick={() => setModal("deposit")}>
              {copy.dashboard.depositBtc}
            </button>
          </div>

          {price && (
            <DepositModal show={modal === "deposit"} onHide={() => setModal(null)} price={price} />
          )}
        </div>
      </NetworkGuard>
    );
  }

  const ltvBps = calcLTV(position.btcDeposited, position.musdBorrowed, price!.pricePerBtc);
  const band = healthBand(ltvBps);
  const maxBorrow = calcMaxBorrow(position.btcDeposited, position.musdBorrowed, price!.pricePerBtc);
  const btcUsd = btcToUSD(position.btcDeposited, price!.pricePerBtc);

  return (
    <NetworkGuard>
      <div className="container py-5 page-transition" style={{ maxWidth: 1200 }}>
        <h1 className="visually-hidden">{copy.dashboard.title}</h1>
        <div className="row g-4">
          {/* ── Left column ─────────────────────────────── */}
          <div className="col-lg-8">

            {/* Hero metric + gauge */}
            <div className="surface p-4 mb-4">
              <HealthBadge band={band} className="mb-3" />
              <div className="row align-items-center g-4 flex-column-reverse flex-sm-row">
                <div className="col">
                  <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-mute)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "var(--s-2)" }}>
                    {copy.dashboard.btcDeposited}
                  </div>
                  <div
                    className="mono-hero"
                    aria-label={`${formatBTC(position.btcDeposited, { compact: true })} Bitcoin deposited`}
                    style={{ wordBreak: "break-all" }}
                  >
                    {formatBTC(position.btcDeposited, { compact: true })}
                    <span style={{ fontSize: "1.25rem", color: "var(--c-text-mute)", marginLeft: "var(--s-2)" }}>BTC</span>
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-data)", color: "var(--c-text-mute)", marginTop: "var(--s-2)" }}>
                    {formatMUSD(btcUsd)} · {formatLTV(ltvBps)} LTV
                  </div>
                </div>
                <div className="col-12 col-sm-auto d-flex justify-content-center">
                  <LtvGauge ltvBps={ltvBps} size={180} />
                </div>
              </div>
            </div>

            {/* Action row */}
            <div className="row g-2 mb-4">
              {[
                { icon: ArrowDown, label: copy.dashboard.depositBtc, modal: "deposit" as Modal, primary: false },
                { icon: ArrowUp,   label: copy.dashboard.withdraw,   modal: "withdraw" as Modal, primary: false },
                { icon: CreditCard, label: copy.dashboard.borrowMusd, modal: "borrow" as Modal,  primary: true },
                { icon: RotateCcw, label: copy.dashboard.repay,      modal: "repay" as Modal,   primary: false },
              ].map(({ icon: Icon, label, modal: m, primary }) => (
                <div key={label} className="col-6 col-sm-3">
                  <button
                    type="button"
                    className={`btn ${primary ? "btn-primary" : ""} w-100 d-flex flex-column align-items-center gap-1`}
                    style={{
                      minHeight: 64,
                      border: primary ? undefined : "1px solid var(--c-border)",
                      background: primary ? undefined : "transparent",
                      color: primary ? undefined : "var(--c-text)",
                      padding: "var(--s-3) var(--s-2)",
                    }}
                    onClick={() => setModal(m)}
                    aria-label={label}
                  >
                    <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
                    <span style={{ fontSize: "var(--fs-sm)" }}>{label}</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Position summary card */}
            <PositionCard position={position} price={price!} maxBorrow={maxBorrow} className="mb-4" />

            {/* Recent activity */}
            <div className="surface p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 style={{ fontSize: "var(--fs-h3)", margin: 0 }}>
                  <Activity size={16} strokeWidth={1.5} style={{ marginRight: "var(--s-2)", verticalAlign: "middle" }} aria-hidden="true" />
                  {copy.dashboard.recentActivity}
                </h2>
                <Link to="/history" style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-mute)", textDecoration: "none" }}>
                  {copy.dashboard.viewAll} →
                </Link>
              </div>

              {events && events.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {events.slice(0, 5).map((ev) => (
                    <div key={ev.hash} className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: "1px solid var(--c-border)" }}>
                      <div className="d-flex align-items-center gap-2">
                        <span
                          style={{ fontWeight: 600, fontSize: "var(--fs-sm)", color: EVENT_COLOURS[ev.type] ?? "var(--c-text-mute)" }}
                        >
                          {ev.type}
                        </span>
                        <span style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-mute)" }}>
                          {formatTimestamp(ev.at)}
                        </span>
                      </div>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-sm)", fontVariantNumeric: "tabular-nums" }}>
                        {"amount" in ev ? formatMUSD(ev.amount as bigint) : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "var(--c-text-mute)", fontSize: "var(--fs-sm)", margin: 0 }}>{copy.history.empty}</p>
              )}
            </div>
          </div>

          {/* ── Right column ────────────────────────────── */}
          <div className="col-lg-4 d-flex flex-column gap-4">
            <LiquidationAlertCard ltvBps={ltvBps} onAddCollateral={() => setModal("deposit")} />
            <SmartLimitWidget ltvBps={ltvBps} maxBorrow={maxBorrow} />

            {/* Network status */}
            <div className="surface p-3" style={{ borderRadius: "var(--r-3)" }}>
              <div className="d-flex align-items-center gap-2">
                <span style={{ width: 8, height: 8, background: "var(--c-success)", borderRadius: "50%", flexShrink: 0 }} aria-hidden="true" />
                <span style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-mute)" }}>Mezo Testnet</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-sm)", color: "var(--c-text-mute)", marginLeft: "auto" }}>
                  BTC {formatPrice(price!.pricePerBtc)}
                </span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="surface p-4" style={{ borderRadius: "var(--r-3)" }}>
              <MetricStat
                label="Protocol Parameters"
                value=""
                className="mb-3"
              />
              <div className="d-flex flex-column gap-2">
                {[
                  { label: "Max LTV", value: "60%" },
                  { label: "Liquidation LTV", value: "75%" },
                  { label: "Liquidation penalty", value: "5%" },
                  { label: "Interest (Mezo)", value: "1–5% APR" },
                ].map(({ label, value }) => (
                  <div key={label} className="d-flex justify-content-between">
                    <span style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-mute)" }}>{label}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-sm)" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {position && price && (
        <>
          <DepositModal  show={modal === "deposit"}  onHide={() => setModal(null)} price={price} />
          <WithdrawModal show={modal === "withdraw"} onHide={() => setModal(null)} position={position} price={price} />
          <BorrowModal   show={modal === "borrow"}   onHide={() => setModal(null)} position={position} price={price} />
          <RepayModal    show={modal === "repay"}    onHide={() => setModal(null)} position={position} />
        </>
      )}

      <NaturalLanguageChat />
    </NetworkGuard>
  );
}
