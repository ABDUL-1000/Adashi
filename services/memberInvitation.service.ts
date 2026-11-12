import api from "./api";
import type {
  AcceptInvitationResponse,
  CreateMemberInvitationResponse,
  InvitationPreviewResponse,
  MyInvitationsResponse,
  SimpleResponse,
} from "@/types/memberInvitation.types";

export const memberInvitationService = {
  create: async (groupId: string, email: string) => {
    return api.post<CreateMemberInvitationResponse, CreateMemberInvitationResponse>(
      `/groups/${groupId}/member-invitations`,
      { email }
    );
  },
  cancel: async (groupId: string, invitationId: string) => {
    return api.delete<SimpleResponse, SimpleResponse>(
      `/groups/${groupId}/member-invitations/${invitationId}`
    );
  },
  mine: async () => {
    return api.get<MyInvitationsResponse, MyInvitationsResponse>("/member-invitations/mine");
  },
  preview: async (token: string) => {
    return api.get<InvitationPreviewResponse, InvitationPreviewResponse>(
      `/member-invitations/${token}`
    );
  },
  accept: async (token: string) => {
    return api.post<AcceptInvitationResponse, AcceptInvitationResponse>(
      `/member-invitations/${token}/accept`
    );
  },
  decline: async (token: string) => {
    return api.post<SimpleResponse, SimpleResponse>(`/member-invitations/${token}/decline`);
  },
};
