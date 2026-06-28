import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { inviteService } from "@/services/invite.service";

export function useValidateInvite(code: string | undefined) {
  return useQuery({
    queryKey: queryKeys.invite(code ?? ""),
    queryFn: () => inviteService.validateInvite(code as string),
    enabled: Boolean(code),
  });
}
