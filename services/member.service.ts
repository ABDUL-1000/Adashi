import api from "./api";
import type { ApiResponse } from "@/types/api.types";

export const memberService = {
  joinGroup: async (groupIdOrInviteCode: string) => {
    const { data } = await api.post<ApiResponse>(
      `/members/join/${groupIdOrInviteCode}`
    );
    return data;
  },
};
