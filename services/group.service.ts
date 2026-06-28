import api from "./api";
import type {
  CreateGroupRequest,
  CreateGroupResponse,
  DeleteGroupResponse,
  GroupDetailsResponse,
  GroupsResponse,
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
    // TODO: Confirm delete group endpoint with backend.
    return api.delete<DeleteGroupResponse, DeleteGroupResponse>(`/groups/${id}`);
  },
  removeGroupMember: async (id: string, memberId: string) => {
    // TODO: Confirm remove member endpoint with backend.
    return api.delete<RemoveGroupMemberResponse, RemoveGroupMemberResponse>(
      `/groups/${id}/members/${memberId}`
    );
  },
};
