import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { walletService } from "@/services/wallet.service";

export function useGetWalletTransactions(page = 1, limit = 20) {
  return useQuery({
    queryKey: queryKeys.walletTransactions(page, limit),
    queryFn: () => walletService.getWalletTransactions({ page, limit }),
  });
}
