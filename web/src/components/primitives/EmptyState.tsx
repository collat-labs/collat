import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  body?: string;
  cta?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function EmptyState({ title, body, cta, icon, className = "" }: EmptyStateProps) {
  return (
    <div
      className={`d-flex flex-column align-items-center text-center py-5 ${className}`}
      role="status"
    >
      {icon && (
        <div style={{ marginBottom: "var(--s-5)", color: "var(--c-text-mute)" }}>
          {icon}
        </div>
      )}
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--fs-h2)",
          marginBottom: body ? "var(--s-3)" : "var(--s-5)",
        }}
      >
        {title}
      </h2>
      {body && (
        <p
          style={{
            color: "var(--c-text-mute)",
            maxWidth: "44ch",
            marginBottom: "var(--s-5)",
            lineHeight: "var(--lh-body)",
          }}
        >
          {body}
        </p>
      )}
      {cta}
    </div>
  );
}
