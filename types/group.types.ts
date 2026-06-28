import type { ApiResponse } from "./api.types";

export type GroupFrequency = "WEEKLY" | "MONTHLY";
export type GroupStatus = "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED" | string;
export type PayoutMethod =
  | "ORGANIZER_SELECTED"
  | "FIRST_COME_FIRST_SERVED"
  | "RANDOM";

export type GroupOrganizer = {
  id: string;
  name: string;
  email?: string;
};

export type GroupMemberUser = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
};

export type GroupMember = {
  id: string;
  userId: string;
  groupId: string;
  payoutPosition: number;
  joinedAt: string;
  user: GroupMemberUser;
};

export type ContributionCycle = {
  id: string;
  groupId: string;
  cycleNumber: number;
  startDate: string;
  endDate: string;
};

export type Group = {
  id: string;
  organizerId: string;
  name: string;
  contributionAmount: string;
  slots: number;
  frequency: GroupFrequency | string;
  startDate: string;
  status: GroupStatus;
  createdAt: string;
  updatedAt: string;
  organizer?: GroupOrganizer;
  members?: GroupMember[];
  contributionCycles?: ContributionCycle[];
  invites?: { code: string }[];
};

export type CreateGroupRequest = {
  name: string;
  contributionAmount: number;
  slots: number;
  frequency: GroupFrequency;
  startDate: string;
};

export type CreateGroupPayload = {
  group: Group;
};

export type GroupDetailsLedger = {
  payments: Array<{
    id: string;
    amount?: string;
    status?: string;
    paidAt?: string;
    createdAt?: string;
    user?: { name: string; email?: string };
  } | Record<string, unknown>>;
  payouts: Array<{
    id: string;
    amount?: string;
    status?: string;
    paidAt?: string;
    createdAt?: string;
    user?: { name: string; email?: string };
  } | Record<string, unknown>>;
};

export type GroupDetails = {
  group: Group & {
    organizer: GroupOrganizer;
    members: GroupMember[];
    contributionCycles: ContributionCycle[];
  };
  userContext: {
    payoutPosition: number;
    joinedAt: string;
  } | null;
  currentCycle: ContributionCycle | null;
  ledger: GroupDetailsLedger;
};

export type GroupsResponse = ApiResponse<Group[]>;
export type GroupDetailsResponse = ApiResponse<GroupDetails>;
export type CreateGroupResponse = ApiResponse<CreateGroupPayload | Group>;
