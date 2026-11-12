import api from "./api";
import type {
  ManualPayoutRequest,
  ManualPayoutResponse,
  PayoutsResponse,
} from "@/types/payout.types";

export const payoutService = {
  getPayouts: async () => {
    return api.get<PayoutsResponse, PayoutsResponse>("/payouts");
  },
  manualPayout: async (payload: ManualPayoutRequest) => {
    return api.post<ManualPayoutResponse, ManualPayoutResponse>(
      "/payouts/manual",
      payload
    );
  },
};
