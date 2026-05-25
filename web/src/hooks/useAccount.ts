import { useSyncExternalStore } from "react";
import { useChainAdapter } from "@/lib/chain/ChainAdapterProvider";
import type { Address } from "@/lib/chain/types";

/**
 * Reactive wallet-account state. Re-renders the calling component whenever
 * the adapter notifies of a connect/disconnect/reset. Replaces the
 * legacy `adapter.account()` + `forceRender` pattern.
 */
export function useAccount(): Address | null {
  const adapter = useChainAdapter();
  return useSyncExternalStore(
    (cb) => adapter.onAccountChange(cb),
    () => adapter.account(),
    () => null
  );
}
