import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useChainAdapter } from "@/lib/chain/ChainAdapterProvider";
import { useAccount } from "@/hooks/useAccount";
import type { CollatEvent } from "@/lib/chain/types";

export function useEvents(filter?: { types?: CollatEvent["type"][] }) {
  const adapter = useChainAdapter();
  const account = useAccount() ?? undefined;
  const qc = useQueryClient();

  const query = useQuery<CollatEvent[]>({
    queryKey: ["events", account, filter?.types],
    queryFn: () => adapter.getEvents({ owner: account, types: filter?.types }),
    staleTime: 5_000,
  });

  useEffect(() => {
    return adapter.on(() => {
      void qc.invalidateQueries({ queryKey: ["events"] });
    });
  }, [adapter, qc]);

  return query;
}
