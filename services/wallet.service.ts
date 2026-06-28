import api from "./api";
import type {
  GetTransactionDetailsResponse,
  GetWalletResponse,
  GetWalletTransactionsParams,
  GetWalletTransactionsResponse,
} from "@/types/wallet.types";

export const walletService = {
  getWallet: async () => {
    return api.get<GetWalletResponse, GetWalletResponse>("/wallet");
  },
  getWalletTransactions: async (params?: GetWalletTransactionsParams) => {
    return api.get<GetWalletTransactionsResponse, GetWalletTransactionsResponse>(
      "/wallet/transactions",
      { params }
    );
  },
  getTransactionDetails: async (transactionId: string) => {
    return api.get<GetTransactionDetailsResponse, GetTransactionDetailsResponse>(
      `/wallet/transactions/${transactionId}`
    );
  },
};
