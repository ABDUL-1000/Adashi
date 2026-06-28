import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { walletService } from "@/services/wallet.service";

export function useGetWallet() {
  return useQuery({
    queryKey: queryKeys.wallet,
    queryFn: walletService.getWallet,
  });
}
