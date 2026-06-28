import api from "./api";
import type {
  InitializePaymentRequest,
  InitializePaymentResponse,
  PaymentsResponse,
} from "@/types/payment.types";

export const paymentService = {
  initializePayment: async (payload: InitializePaymentRequest) => {
    const { data } = await api.post<InitializePaymentResponse>(
      "/payments/initialize",
      payload
    );
    return data;
  },
  getPayments: async () => {
    const { data } = await api.get<PaymentsResponse>("/payments");
    return data;
  },
  verifyPayment: async (reference: string) => {
    // TODO: Confirm whether the backend expects reference in the URL or body.
    const { data } = await api.post("/payments/verify", { reference });
    return data;
  },
};
