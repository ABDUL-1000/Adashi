import api from "./api";
import type {
  PaymentsResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
} from "@/types/payment.types";

export const paymentService = {
  // TODO: Add initialize payment endpoint when backend provides it.
  initializePayment: async (_payload: unknown) => {
    void _payload;
    throw new Error("Initialize payment endpoint is not available yet.");
  },
  // TODO: Add list payments endpoint when backend provides it.
  getPayments: async (): Promise<PaymentsResponse> => {
    throw new Error("List payments endpoint is not available yet.");
  },
  verifyPayment: async (payload: VerifyPaymentRequest) => {
    return api.post<VerifyPaymentResponse, VerifyPaymentResponse>(
      "/payments/verify",
      payload
    );
  },
};
