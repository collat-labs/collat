import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useChainAdapter } from "@/lib/chain/ChainAdapterProvider";
import { CollatTxError } from "@/lib/chain/types";
import { copy } from "@/lib/copy/strings";

export function useWithdraw() {
  const adapter = useChainAdapter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (amount: bigint) => adapter.withdraw(amount),
    onMutate: () => { toast.loading("Withdrawing BTC…", { id: "withdraw" }); },
    onSuccess: () => {
      toast.success(copy.withdraw.successTitle, { id: "withdraw" });
      void qc.invalidateQueries({ queryKey: ["position"] });
      void qc.invalidateQueries({ queryKey: ["vault"] });
    },
    onError: (err) => {
      const code = err instanceof CollatTxError ? err.code : "generic";
      const msg = copy.errors[code as keyof typeof copy.errors] ?? copy.errors.generic;
      toast.error(msg, { id: "withdraw" });
    },
  });
}
