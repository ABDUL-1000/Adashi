import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { groupService } from "@/services/group.service";
import type { ReorderPositionsPayload } from "@/types/group.types";

export function useReorderGroupPositions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      payload,
    }: {
      groupId: string;
      payload: ReorderPositionsPayload;
    }) => groupService.reorderGroupPositions(groupId, payload),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups });
      queryClient.invalidateQueries({
        queryKey: queryKeys.groupDetails(variables.groupId),
      });
    },
  });
}
