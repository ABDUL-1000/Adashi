export const queryKeys = {
  profile: ["profile"] as const,
  groups: ["groups"] as const,
  groupDetails: (id: string) => ["groups", id] as const,
  invite: (code: string) => ["invites", code] as const,
  wallet: ["wallet"] as const,
  walletTransactions: (page: number, limit: number) =>
    ["wallet", "transactions", page, limit] as const,
  walletTransaction: (id: string) => ["wallet", "transactions", id] as const,
};
