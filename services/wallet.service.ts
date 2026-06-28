import api from "./api";
import type { WalletResponse } from "@/types/wallet.types";

export const walletService = {
  getWallet: async () => {
    // TODO: Confirm wallet endpoint when backend exposes wallet funding APIs.
    return api.get<WalletResponse, WalletResponse>("/wallet");
  },
};
