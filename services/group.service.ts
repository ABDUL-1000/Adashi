import api from "./api";
import type {
  CreateGroupRequest,
  CreateGroupResponse,
  DeleteGroupResponse,
  GroupDetailsResponse,
  GroupsResponse,
  NewRoundPayload,
  NewRoundResponse,
  OrganizerMembershipResponse,
  RecordPaymentPayload,
  RecordPaymentResponse,
  RemindResponse,
  UpdateInvitePayload,
  UpdateInviteResponse,
  RemoveGroupMemberResponse,
  ReorderPositionsPayload,
  ReorderPositionsResponse,
  UpdateGroupPayload,
  UpdateGroupResponse,
} from "@/types/group.types";

export const groupService = {
  createGroup: async (payload: CreateGroupRequest) => {
    return api.post<CreateGroupResponse, CreateGroupResponse>("/groups", payload);
  },
  getGroups: async () => {
    return api.get<GroupsResponse, GroupsResponse>("/groups");
  },
  getGroupDetails: async (id: string) => {
    return api.get<GroupDetailsResponse, GroupDetailsResponse>(`/groups/${id}`);
  },
  updateGroup: async (id: string, payload: UpdateGroupPayload) => {
    return api.patch<UpdateGroupResponse, UpdateGroupResponse>(`/groups/${id}`, payload);
  },
  reorderGroupPositions: async (
    id: string,
    payload: ReorderPositionsPayload
  ) => {
    return api.patch<ReorderPositionsResponse, ReorderPositionsResponse>(
      `/groups/${id}/reorder-positions`,
      payload
    );
  },
  deleteGroup: async (id: string) => {
    return api.delete<DeleteGroupResponse, DeleteGroupResponse>(`/groups/${id}`);
  },
  removeGroupMember: async (id: string, memberId: string) => {
    return api.delete<RemoveGroupMemberResponse, RemoveGroupMemberResponse>(
      `/groups/${id}/members/${memberId}`
    );
  },
  setOrganizerMembership: async (id: string, join: boolean) => {
    return api.post<OrganizerMembershipResponse, OrganizerMembershipResponse>(
      `/groups/${id}/organizer-membership`,
      { join }
    );
  },
  updateInvite: async (id: string, payload: UpdateInvitePayload) => {
    return api.patch<UpdateInviteResponse, UpdateInviteResponse>(`/groups/${id}/invite`, payload);
  },
  recordPayment: async (id: string, cycleId: string, payload: RecordPaymentPayload) => {
    return api.post<RecordPaymentResponse, RecordPaymentResponse>(
      `/groups/${id}/cycles/${cycleId}/payments`,
      payload
    );
  },
  undoPayment: async (id: string, cycleId: string, paymentId: string) => {
    return api.delete<RecordPaymentResponse, RecordPaymentResponse>(
      `/groups/${id}/cycles/${cycleId}/payments/${paymentId}`
    );
  },
  remindUnpaid: async (id: string) => {
    return api.post<RemindResponse, RemindResponse>(`/groups/${id}/remind`);
  },
  startNewRound: async (id: string, payload: NewRoundPayload) => {
    return api.post<NewRoundResponse, NewRoundResponse>(`/groups/${id}/new-round`, payload);
  },
};
