import { useQuery } from "@tanstack/react-query";

import { walletService } from "@/services/wallet.service";

export function useGetWallet() {
  return useQuery({
    queryKey: ["wallet"],
    queryFn: walletService.getWallet,
  });
}
