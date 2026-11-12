import api from "./api";
import type { ApiResponse } from "@/types/api.types";

export const userService = {
  exportData: async () => {
    return api.get<ApiResponse<unknown>, ApiResponse<unknown>>("/user/export");
  },
  deleteAccount: async (password: string) => {
    return api.delete<ApiResponse<unknown>, ApiResponse<unknown>>("/user/account", {
      data: { password },
    });
  },
};
