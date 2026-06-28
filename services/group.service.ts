import api from "./api";
import type {
  CreateGroupRequest,
  CreateGroupResponse,
  GroupDetailsResponse,
  GroupsResponse,
} from "@/types/group.types";

export const groupService = {
  createGroup: async (payload: CreateGroupRequest) => {
    return api.post<CreateGroupResponse, CreateGroupResponse>("/groups", payload);
  },
  getGroups: async () => {
    return api.get<GroupsResponse, GroupsResponse>("/groups");
  },
  getGroupDetails: async (groupId: string) => {
    return api.get<GroupDetailsResponse, GroupDetailsResponse>(`/groups/${groupId}`);
  },
};
