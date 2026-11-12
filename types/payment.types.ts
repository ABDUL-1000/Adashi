import type { ApiResponse } from "./api.types";
import type { PaymentMethod } from "./group.types";

export type Payment = {
  id: string;
  amount: string;
  status: string;
  method?: PaymentMethod;
  createdAt: string;
  paidAt?: string;
  cycleNumber?: number;
  group?: { id: string; name: string };
};

export type VerifyPaymentRequest = {
  groupId: string;
  cycleId: string;
  transactionReference: string;
};

export type VerifyPaymentResponse = ApiResponse<unknown>;
export type PaymentsResponse = ApiResponse<Payment[]>;
