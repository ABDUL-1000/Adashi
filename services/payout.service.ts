import api from "./api";
import type { PayoutsResponse } from "@/types/payout.types";

export const payoutService = {
  getPayouts: async () => {
    const { data } = await api.get<PayoutsResponse>("/payouts");
    return data;
  },
};
