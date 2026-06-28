import api from "./api";
import type {
  CreateGroupRequest,
  CreateGroupResponse,
  GroupDetailsResponse,
  GroupsResponse,
} from "@/types/group.types";

export const groupService = {
  createGroup: async (payload: CreateGroupRequest) => {
    const { data } = await api.post<CreateGroupResponse>("/groups", payload);
    return data;
  },
  getGroups: async () => {
    const { data } = await api.get<GroupsResponse>("/groups");
    return data;
  },
  getGroupDetails: async (groupId: string) => {
    const { data } = await api.get<GroupDetailsResponse>(`/groups/${groupId}`);
    return data;
  },
};
