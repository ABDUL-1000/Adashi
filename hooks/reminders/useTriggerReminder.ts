import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { groupService } from "@/services/group.service";

export function useTriggerReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId }: { groupId: string }) => groupService.remindUnpaid(groupId),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groupDetails(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts });
    },
  });
}
