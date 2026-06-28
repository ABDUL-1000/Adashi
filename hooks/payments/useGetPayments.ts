import { useQuery } from "@tanstack/react-query";

import { paymentService } from "@/services/payment.service";

export function useGetPayments() {
  return useQuery({
    queryKey: ["payments"],
    queryFn: paymentService.getPayments,
  });
}
