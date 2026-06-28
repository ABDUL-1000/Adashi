import type { Group } from "@/types/group.types";

export const isGroupOwner = (group: Pick<Group, "organizerId">, userId?: string | null) =>
  Boolean(userId) && group.organizerId === userId;

export const isGroupMember = (
  group: Pick<Group, "members">,
  userId?: string | null
) => Boolean(userId) && group.members?.some((member) => member.userId === userId);

export const canEditGroup = (
  group: Pick<Group, "organizerId" | "status">,
  userId?: string | null
) => isGroupOwner(group, userId) && group.status !== "ACTIVE";

export const canDeleteGroup = (
  group: Pick<Group, "organizerId" | "status">,
  userId?: string | null
) => isGroupOwner(group, userId) && group.status === "PENDING";

export const canRemoveMember = (
  group: Pick<Group, "organizerId" | "status">,
  userId?: string | null
) => isGroupOwner(group, userId) && group.status === "PENDING";

export const canReorderMembers = (
  group: Pick<Group, "organizerId" | "status">,
  userId?: string | null
) => isGroupOwner(group, userId) && group.status === "PENDING";
