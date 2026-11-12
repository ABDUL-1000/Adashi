import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { groupService } from "@/services/group.service";
import type { RecordPaymentPayload } from "@/types/group.types";

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, cycleId, payload }: { groupId: string; cycleId: string; payload: RecordPaymentPayload }) => groupService.recordPayment(groupId, cycleId, payload),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groupDetails(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts });
    },
  });
}
