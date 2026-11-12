import { groupService } from "./group.service";

export const reminderService = {
  // Organisers remind the unpaid members of one group (the platform-wide job is admin-only).
  triggerReminder: async (groupId: string) => groupService.remindUnpaid(groupId),
};
