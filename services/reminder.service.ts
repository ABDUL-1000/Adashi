import api from "./api";
import type { TriggerReminderResponse } from "@/types/reminder.types";

export const reminderService = {
  triggerReminder: async () => {
    // TODO: Add request body when backend documents reminder trigger payload.
    return api.post<TriggerReminderResponse, TriggerReminderResponse>(
      "/reminder/trigger"
    );
  },
};
