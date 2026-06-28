import type { ApiResponse } from "./api.types";

export type Payment = {
  id: string;
  amount: string;
  status: string;
  createdAt: string;
  paidAt?: string;
  group?: { id: string; name: string };
};

export type InitializePaymentRequest = {
  groupId?: string;
  amount: number;
};

export type InitializePaymentPayload = {
  authorizationUrl?: string;
  reference?: string;
};

export type InitializePaymentResponse = ApiResponse<InitializePaymentPayload>;
export type PaymentsResponse = ApiResponse<Payment[]>;
