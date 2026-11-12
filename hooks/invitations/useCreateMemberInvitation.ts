import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { memberInvitationService } from "@/services/memberInvitation.service";

export function useCreateMemberInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, email }: { groupId: string; email: string }) =>
      memberInvitationService.create(groupId, email),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groupDetails(variables.groupId) });
    },
  });
}

export function useCancelMemberInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, invitationId }: { groupId: string; invitationId: string }) =>
      memberInvitationService.cancel(groupId, invitationId),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groupDetails(variables.groupId) });
    },
  });
}
