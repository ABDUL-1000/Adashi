import { useMutation } from "@tanstack/react-query";

import { paymentService } from "@/services/payment.service";

export function useVerifyPayment() {
  return useMutation({
    mutationFn: paymentService.verifyPayment,
  });
}
