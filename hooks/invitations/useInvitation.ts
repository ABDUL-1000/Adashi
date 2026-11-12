import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { memberInvitationService } from "@/services/memberInvitation.service";

export function useInvitationPreview(token: string | undefined) {
  return useQuery({
    queryKey: queryKeys.invitation(token ?? ""),
    queryFn: () => memberInvitationService.preview(token as string),
    enabled: Boolean(token),
    retry: false,
  });
}

export function useRespondToInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, accept }: { token: string; accept: boolean }) =>
      accept ? memberInvitationService.accept(token) : memberInvitationService.decline(token),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitation(variables.token) });
      queryClient.invalidateQueries({ queryKey: queryKeys.myInvitations });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups });
    },
  });
}
