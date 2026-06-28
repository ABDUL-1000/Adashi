import type { ApiResponse } from "./api.types";

export type Wallet = {
  id?: string;
  balance: string;
  currency?: string;
  autoDeductionEnabled?: boolean;
};

export type WalletResponse = ApiResponse<Wallet>;
