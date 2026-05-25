import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ChainAdapterProvider } from "@/lib/chain/ChainAdapterProvider";
import App from "./App";

// Bootstrap + overrides (SCSS handles the @import chain)
import "./styles/bootstrap-overrides.scss";
import "./styles/globals.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 10_000 } },
});

// Apply saved theme before first paint
const savedTheme = localStorage.getItem("collat:theme");
if (savedTheme === "dark") {
  document.documentElement.setAttribute("data-theme", "dark");
} else if (savedTheme === "light") {
  document.documentElement.setAttribute("data-theme", "light");
}

async function boot() {
  // Axe-core a11y overlay in dev
  if (import.meta.env.DEV) {
    const React = await import("react");
    const ReactDOM = await import("react-dom");
    const axe = await import("@axe-core/react");
    (axe as { default: typeof axe.default }).default(React.default, ReactDOM.default, 1000);
  }

  const root = document.getElementById("root");
  if (!root) throw new Error("No #root element");

  createRoot(root).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ChainAdapterProvider>
          <BrowserRouter>
            <App />
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "var(--c-surface)",
                  color: "var(--c-text)",
                  border: "1px solid var(--c-border)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.875rem",
                },
              }}
            />
          </BrowserRouter>
        </ChainAdapterProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}

void boot();
