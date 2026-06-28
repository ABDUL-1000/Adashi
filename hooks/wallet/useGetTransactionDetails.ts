import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { walletService } from "@/services/wallet.service";

export function useGetTransactionDetails(transactionId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.walletTransaction(transactionId ?? ""),
    queryFn: () => walletService.getTransactionDetails(transactionId as string),
    enabled: Boolean(transactionId),
  });
}
