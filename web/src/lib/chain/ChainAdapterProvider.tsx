import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import type { ChainAdapter } from "./types";
import { MockChainAdapter } from "./MockChainAdapter";

const ChainAdapterCtx = createContext<ChainAdapter | null>(null);

export function ChainAdapterProvider({ children }: { children: ReactNode }) {
  const adapter = useMemo(() => new MockChainAdapter(), []);

  useEffect(() => {
    return () => {
      (adapter as MockChainAdapter).destroy?.();
    };
  }, [adapter]);

  return (
    <ChainAdapterCtx.Provider value={adapter}>
      {children}
    </ChainAdapterCtx.Provider>
  );
}

export function useChainAdapter(): ChainAdapter {
  const ctx = useContext(ChainAdapterCtx);
  if (!ctx) throw new Error("useChainAdapter must be used inside ChainAdapterProvider");
  return ctx;
}
