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
  invites?: GroupInvite[];
  roundNumber?: number;
  previousGroupId?: string | null;
  mySummary?: MyRoundSummary | null;
};

export type GroupInvite = {
  code: string;
  expiresAt: string;
};

export type MyRoundSummary = {
  cycleId: string;
  cycleNumber: number;
  totalCycles: number;
  dueDate: string;
  isMember: boolean;
  hasPaid: boolean;
  amountDue: string;
  collectorName: string | null;
  isMyTurnToCollect: boolean;
  payoutRecorded: boolean;
};

export type CreateGroupRequest = {
  name: string;
  contributionAmount: number;
  slots: number;
  frequency: GroupFrequency;
  startDate: string;
  joinAsContributor?: boolean;
  inviteExpiresInDays?: number;
};

export type UpdateGroupPayload = {
  name?: string;
  contributionAmount?: number;
  slots?: number;
  frequency?: GroupFrequency;
  startDate?: string;
};

export type ReorderPositionsPayload = {
  positions: Array<{
    memberId: string;
    position: number;
  }>;
};

export type CreateGroupPayload = {
  group: Group;
};

export type PaymentMethod = "CASH" | "TRANSFER" | "PAYSTACK";
export type MemberCycleStatus = "PAID" | "UNPAID" | "LATE";
export type CyclePhase = "UPCOMING" | "CURRENT" | "CLOSED";

export type CycleMemberStatus = {
  memberId: string;
  userId: string;
  name: string;
  status: MemberCycleStatus;
  payment: {
    id: string;
    amount: string;
    method: PaymentMethod;
    paidAt: string | null;
    note: string | null;
  } | null;
};

export type CycleLedger = {
  id: string;
  cycleNumber: number;
  startDate: string;
  endDate: string;
  phase: CyclePhase;
  expectedCollector: { userId: string; name: string; payoutPosition: number } | null;
  expectedPot: number;
  collectedAmount: number;
  members: CycleMemberStatus[];
  paidCount: number;
  unpaidCount: number;
  payout: {
    id: string;
    amount: string;
    receiverUserId: string;
    receiverName: string;
    disbursedAt: string | null;
  } | null;
};

export type LedgerPayment = {
  id: string;
  amount: string;
  status: string;
  method: PaymentMethod;
  paidAt: string | null;
  createdAt: string;
  memberName: string;
};

export type LedgerPayout = {
  id: string;
  amount: string;
  cycleNumber: number;
  receiverName: string;
  receiverUserId: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
};

export type GroupDetailsLedger = {
  payments: LedgerPayment[];
  payouts: LedgerPayout[];
  cycles: CycleLedger[];
};

export type MemberInvitationSummary = {
  id: string;
  email: string;
  expiresAt: string;
  createdAt: string;
};

export type GroupDetails = {
  group: Group & {
    organizer: GroupOrganizer;
    members: GroupMember[];
    contributionCycles: ContributionCycle[];
  };
  viewer: {
    isOrganizer: boolean;
    isMember: boolean;
    canEditStructure: boolean;
    hasActivity: boolean;
  };
  userContext: {
    payoutPosition: number;
    joinedAt: string;
  } | null;
  currentCycle: ContributionCycle | null;
  ledger: GroupDetailsLedger;
  memberInvitations: MemberInvitationSummary[];
};

export type RecordPaymentPayload = {
  memberId: string;
  method: "CASH" | "TRANSFER";
  note?: string;
  paidAt?: string;
};

export type UpdateInvitePayload = {
  expiresAt?: string;
  expireNow?: boolean;
  regenerate?: boolean;
};

export type RemindResult = {
  cycleNumber: number;
  unpaidMembers: string[];
  sent: number;
  skipped: number;
  failed: number;
};

export type NewRoundPayload = {
  startDate: string;
  memberIds?: string[];
};

export type GroupsResponse = ApiResponse<Group[]>;
export type GroupDetailsResponse = ApiResponse<GroupDetails>;
export type CreateGroupResponse = ApiResponse<CreateGroupPayload | Group>;
export type UpdateGroupResponse = ApiResponse<Group>;
export type ReorderPositionsResponse = ApiResponse<GroupDetails | Group>;
export type DeleteGroupResponse = ApiResponse<undefined>;
export type RemoveGroupMemberResponse = ApiResponse<undefined>;
export type RecordPaymentResponse = ApiResponse<unknown>;
export type UpdateInviteResponse = ApiResponse<GroupInvite>;
export type RemindResponse = ApiResponse<RemindResult>;
export type OrganizerMembershipResponse = ApiResponse<unknown>;
export type NewRoundResponse = ApiResponse<Group>;
