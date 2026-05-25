import { useQuery } from "@tanstack/react-query";
import { useChainAdapter } from "@/lib/chain/ChainAdapterProvider";
import type { PriceFeed } from "@/lib/chain/types";

export function usePrice() {
  const adapter = useChainAdapter();

  return useQuery<PriceFeed>({
    queryKey: ["price"],
    queryFn: () => adapter.getPrice(),
    staleTime: 12_000,
    refetchInterval: 12_000,
  });
}
