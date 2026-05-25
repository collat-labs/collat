import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useChainAdapter } from "@/lib/chain/ChainAdapterProvider";
import type { Vault } from "@/lib/chain/types";

export function useVault() {
  const adapter = useChainAdapter();
  const qc = useQueryClient();

  const query = useQuery<Vault>({
    queryKey: ["vault"],
    queryFn: () => adapter.getVault(),
    staleTime: 30_000,
  });

  useEffect(() => {
    return adapter.on((ev) => {
      if (["Deposited","Withdrawn","Borrowed","Repaid"].includes(ev.type)) {
        void qc.invalidateQueries({ queryKey: ["vault"] });
      }
    });
  }, [adapter, qc]);

  return query;
}
