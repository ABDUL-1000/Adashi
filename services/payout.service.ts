import api from "./api";
import type {
  ManualPayoutRequest,
  ManualPayoutResponse,
  PayoutsResponse,
} from "@/types/payout.types";

export const payoutService = {
  // TODO: Add list payouts endpoint when backend provides it.
  getPayouts: async (): Promise<PayoutsResponse> => {
    throw new Error("List payouts endpoint is not available yet.");
  },
  manualPayout: async (payload: ManualPayoutRequest) => {
    return api.post<ManualPayoutResponse, ManualPayoutResponse>(
      "/payouts/manual",
      payload
    );
  },
};
