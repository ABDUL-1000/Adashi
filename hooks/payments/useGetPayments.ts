import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { paymentService } from "@/services/payment.service";

export function useGetPayments() {
  return useQuery({
    queryKey: queryKeys.payments,
    queryFn: paymentService.getPayments,
  });
}
