import api from "./api";
import type { ApiResponse } from "@/types/api.types";

export const memberService = {
  joinGroup: async (groupIdOrInviteCode: string) => {
    // TODO: Remove this legacy member join helper once all callers use /invites/join.
    return api.post<ApiResponse, ApiResponse>(
      `/members/join/${groupIdOrInviteCode}`
    );
  },
};
