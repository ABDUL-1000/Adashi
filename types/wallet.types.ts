import type { ApiResponse } from "./api.types";

export type Wallet = {
  id: string;
  userId: string;
  balance: string;
  createdAt: string;
  updatedAt: string;
};

export type WalletTransaction = {
  id: string;
  type: "CONTRIBUTION" | "TOP_UP" | "PAYOUT" | "REFUND" | string;
  amount: string;
  description: string;
  reference: string;
  createdAt: string;
};

export type WalletPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type WalletTransactionsPayload = {
  transactions: WalletTransaction[];
  pagination: WalletPagination;
};

export type GetWalletTransactionsParams = {
  page?: number;
  limit?: number;
};

export type GetWalletResponse = ApiResponse<Wallet>;
export type GetWalletTransactionsResponse = ApiResponse<WalletTransactionsPayload>;
export type GetTransactionDetailsResponse = ApiResponse<WalletTransaction>;

export type WalletResponse = GetWalletResponse;
