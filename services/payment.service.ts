import api from "./api";
import type {
  PaymentsResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
} from "@/types/payment.types";

export const paymentService = {
  getPayments: async () => {
    return api.get<PaymentsResponse, PaymentsResponse>("/payments");
  },
  verifyPayment: async (payload: VerifyPaymentRequest) => {
    return api.post<VerifyPaymentResponse, VerifyPaymentResponse>(
      "/payments/verify",
      payload
    );
  },
};
