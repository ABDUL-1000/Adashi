import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { payoutService } from "@/services/payout.service";

export function useManualPayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: payoutService.manualPayout,
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.groupDetails(variables.groupId),
      });
    },
  });
}

export const useCreatePayout = useManualPayout;
