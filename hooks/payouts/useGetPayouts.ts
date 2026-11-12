import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { payoutService } from "@/services/payout.service";

export function useGetPayouts() {
  return useQuery({
    queryKey: queryKeys.payouts,
    queryFn: payoutService.getPayouts,
  });
}
