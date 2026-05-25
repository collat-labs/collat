import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useChainAdapter } from "@/lib/chain/ChainAdapterProvider";
import { useAccount } from "@/hooks/useAccount";
import type { Position } from "@/lib/chain/types";

export function usePosition() {
  const adapter = useChainAdapter();
  const account = useAccount();
  const qc = useQueryClient();

  const query = useQuery<Position | null>({
    queryKey: ["position", account],
    queryFn: async () => {
      if (!account) return null;
      return adapter.getPosition(account);
    },
    staleTime: 10_000,
    enabled: !!account,
  });

  // Invalidate on chain events
  useEffect(() => {
    return adapter.on((ev) => {
      if (["Deposited","Withdrawn","Borrowed","Repaid","Liquidated"].includes(ev.type)) {
        void qc.invalidateQueries({ queryKey: ["position"] });
      }
    });
  }, [adapter, qc]);

  return query;
}
