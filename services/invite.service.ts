import api from "./api";
import type {
  JoinGroupRequest,
  JoinGroupResponse,
  ValidateInviteResponse,
} from "@/types/invite.types";

export const inviteService = {
  validateInvite: async (code: string) => {
    return api.get<ValidateInviteResponse, ValidateInviteResponse>(
      `/invites/validate/${code}`
    );
  },
  joinGroup: async (payload: JoinGroupRequest) => {
    return api.post<JoinGroupResponse, JoinGroupResponse>(
      "/invites/join",
      payload
    );
  },
};
