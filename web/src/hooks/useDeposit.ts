import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useChainAdapter } from "@/lib/chain/ChainAdapterProvider";
import { CollatTxError } from "@/lib/chain/types";
import { copy } from "@/lib/copy/strings";

export function useDeposit() {
  const adapter = useChainAdapter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (amount: bigint) => adapter.deposit(amount),
    onMutate: () => {
      toast.loading("Depositing BTC…", { id: "deposit" });
    },
    onSuccess: (result) => {
      toast.success(copy.deposit.successTitle, { id: "deposit" });
      void qc.invalidateQueries({ queryKey: ["position"] });
      void qc.invalidateQueries({ queryKey: ["vault"] });
      return result;
    },
    onError: (err) => {
      const code = err instanceof CollatTxError ? err.code : "generic";
      const msg = copy.errors[code as keyof typeof copy.errors] ?? copy.errors.generic;
      toast.error(msg, { id: "deposit" });
    },
  });
}
