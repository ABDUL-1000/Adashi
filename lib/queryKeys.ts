export const queryKeys = {
  profile: ["profile"] as const,
  groups: ["groups"] as const,
  groupDetails: (id: string) => ["groups", id] as const,
  invite: (code: string) => ["invites", code] as const,
};
