import { useQuery } from "@tanstack/react-query";

import { payoutService } from "@/services/payout.service";

export function useGetPayouts() {
  return useQuery({
    queryKey: ["payouts"],
    queryFn: payoutService.getPayouts,
  });
}
