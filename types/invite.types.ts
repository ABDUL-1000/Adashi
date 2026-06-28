import type { ApiResponse } from "./api.types";
import type { GroupFrequency, GroupStatus } from "./group.types";

export type ValidateInvitePayload = {
  code: string;
  expiresAt: string;
  group: {
    id?: string;
    name: string;
    contributionAmount: string;
    slots: number;
    frequency: GroupFrequency;
    startDate: string;
    status: GroupStatus;
    _count: {
      members: number;
    };
  };
};

export type JoinGroupRequest = {
  code: string;
};

export type JoinGroupPayload = {
  groupId?: string;
  group?: { id: string };
};

export type ValidateInviteResponse = ApiResponse<ValidateInvitePayload>;
export type JoinGroupResponse = ApiResponse<JoinGroupPayload | undefined>;
