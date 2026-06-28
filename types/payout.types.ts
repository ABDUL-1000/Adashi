import type { ApiResponse } from "./api.types";

export type Payout = {
  id: string;
  amount: string;
  status: string;
  createdAt: string;
  paidAt?: string;
  group?: { id: string; name: string };
};

export type PayoutsResponse = ApiResponse<Payout[]>;
