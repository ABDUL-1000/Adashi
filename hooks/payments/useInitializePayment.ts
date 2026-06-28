import { useMutation } from "@tanstack/react-query";

import { paymentService } from "@/services/payment.service";

export function useInitializePayment() {
  return useMutation({
    mutationFn: paymentService.initializePayment,
  });
}
