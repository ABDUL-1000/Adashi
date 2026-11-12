import type { ApiResponse } from "./api.types";

export type InvitationPreview = {
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED" | "EXPIRED";
  invitedEmail: string;
  expiresAt: string;
  group: {
    name: string;
    contributionAmount: string;
    frequency: string;
    slots: number;
    status: string;
    organizerName: string;
    memberCount: number;
  };
};

export type MyInvitation = {
  token: string;
  expiresAt: string;
  createdAt: string;
  group: {
    id: string;
    name: string;
    contributionAmount: string;
    frequency: string;
    slots: number;
    organizer: { name: string };
  };
};

export type CreateMemberInvitationResult = {
  id: string;
  email: string;
  expiresAt: string;
  createdAt: string;
  emailSent: boolean;
  link: string;
};

export type InvitationPreviewResponse = ApiResponse<InvitationPreview>;
export type MyInvitationsResponse = ApiResponse<MyInvitation[]>;
export type CreateMemberInvitationResponse = ApiResponse<CreateMemberInvitationResult>;
export type AcceptInvitationResponse = ApiResponse<{ groupId: string }>;
export type SimpleResponse = ApiResponse<unknown>;
