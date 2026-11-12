import type { ApiResponse } from "./api.types";

export type Payout = {
  id: string;
  amount: string;
  status: string;
  createdAt: string;
  paidAt?: string;
  cycleNumber?: number;
  receiverName?: string;
  isMine?: boolean;
  group?: { id: string; name: string };
};

export type ManualPayoutRequest = {
  groupId: string;
  cycleId: string;
  receiverUserId?: string;
  amount?: number;
  overrideOrder?: boolean;
  correction?: boolean;
};

export type ManualPayoutResponse = ApiResponse<unknown>;
export type PayoutsResponse = ApiResponse<Payout[]>;
