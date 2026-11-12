import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { groupService } from "@/services/group.service";

export function useOrganizerMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, join }: { groupId: string; join: boolean }) => groupService.setOrganizerMembership(groupId, join),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groupDetails(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts });
    },
  });
}
