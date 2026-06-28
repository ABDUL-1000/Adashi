import { useMutation } from "@tanstack/react-query";

import { reminderService } from "@/services/reminder.service";

export function useTriggerReminder() {
  return useMutation({
    mutationFn: reminderService.triggerReminder,
  });
}
