import { useState } from "react";
import { Download } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { formatMUSD, formatTimestamp } from "@/lib/format";
import { AddressPill } from "@/components/primitives/AddressPill";
import { EmptyState } from "@/components/primitives/EmptyState";
import type { CollatEvent } from "@/lib/chain/types";
import { copy } from "@/lib/copy/strings";

const FILTERS: { label: string; types?: CollatEvent["type"][] }[] = [
  { label: copy.history.filterAll },
  { label: copy.history.filterDeposit,  types: ["Deposited"] },
  { label: copy.history.filterBorrow,   types: ["Borrowed"] },
  { label: copy.history.filterRepay,    types: ["Repaid"] },
  { label: copy.history.filterLiquidate, types: ["Liquidated"] },
];

const TYPE_COLOURS: Record<string, string> = {
  Deposited:  "var(--c-success)",
  Withdrawn:  "var(--c-text-mute)",
  Borrowed:   "var(--c-silver-500)",
  Repaid:     "var(--c-text-mute)",
  Liquidated: "var(--c-danger)",
};

function getAmount(ev: CollatEvent): bigint | null {
  if ("amount" in ev) return ev.amount as bigint;
  return null;
}

function exportCSV(events: CollatEvent[]) {
  const rows = [
    ["Type", "Timestamp", "Amount", "Hash"],
    ...events.map((ev) => [
      ev.type,
      new Date(ev.at * 1000).toISOString(),
      getAmount(ev)?.toString() ?? "",
      ev.hash,
    ]),
  ];
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "collat-history.csv"; a.click();
  URL.revokeObjectURL(url);
}

export default function History() {
  const [activeFilter, setActiveFilter] = useState(0);
  const { data: events, isLoading } = useEvents({ types: FILTERS[activeFilter].types });

  return (
    <div className="container py-5 page-transition" style={{ maxWidth: 900 }}>
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h1 style={{ fontFamily: "var(--font-display)", margin: 0 }}>{copy.history.title}</h1>
        <button
          type="button"
          className="btn btn-sm d-flex align-items-center gap-2"
          style={{ border: "1px solid var(--c-border)", color: "var(--c-text)", background: "transparent" }}
          onClick={() => events && exportCSV(events)}
          aria-label="Export transaction history as CSV"
        >
          <Download size={14} strokeWidth={1.5} aria-hidden="true" />
          {copy.history.exportCsv}
        </button>
      </div>

      {/* Filters */}
      <div className="d-flex flex-wrap gap-2 mb-4" role="tablist" aria-label="Event type filter">
        {FILTERS.map(({ label }, i) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={activeFilter === i}
            className="btn btn-sm"
            style={{
              border: `1px solid ${activeFilter === i ? "var(--c-primary)" : "var(--c-border)"}`,
              background: activeFilter === i ? "rgba(225,29,46,.1)" : "transparent",
              color: activeFilter === i ? "var(--c-primary)" : "var(--c-text-mute)",
              fontSize: "var(--fs-sm)",
            }}
            onClick={() => setActiveFilter(i)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="d-flex flex-column gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 56, borderRadius: "var(--r-2)" }} />
          ))}
        </div>
      ) : !events || events.length === 0 ? (
        <EmptyState title={copy.history.empty} />
      ) : (
        <div
          role="table"
          aria-label="Transaction history"
          className="surface"
          style={{ borderRadius: "var(--r-3)", overflow: "hidden" }}
        >
          <div role="rowgroup">
            {events.map((ev) => {
              const amount = getAmount(ev);
              return (
                <div
                  key={ev.hash}
                  role="row"
                  className="d-flex align-items-center justify-content-between px-4 py-3"
                  style={{ borderBottom: "1px solid var(--c-border)" }}
                >
                  <div role="cell" className="d-flex align-items-center gap-3" style={{ minWidth: 0 }}>
                    <span
                      style={{
                        fontWeight: 600, fontSize: "var(--fs-sm)",
                        color: TYPE_COLOURS[ev.type] ?? "var(--c-text-mute)",
                        flexShrink: 0,
                      }}
                    >
                      {ev.type}
                    </span>
                    <span style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-mute)", flexShrink: 0 }}>
                      {formatTimestamp(ev.at)}
                    </span>
                    <AddressPill address={ev.hash} className="d-none d-sm-inline-flex" />
                  </div>
                  <div role="cell" style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-sm)", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
                    {amount !== null ? formatMUSD(amount) : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
