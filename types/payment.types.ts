import type { ApiResponse } from "./api.types";

export type Payment = {
  id: string;
  amount: string;
  status: string;
  createdAt: string;
  paidAt?: string;
  group?: { id: string; name: string };
};

export type VerifyPaymentRequest = {
  groupId: string;
  cycleId: string;
  transactionReference: string;
};

export type VerifyPaymentResponse = ApiResponse<unknown>;
export type PaymentsResponse = ApiResponse<Payment[]>;
