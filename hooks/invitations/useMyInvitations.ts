import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { memberInvitationService } from "@/services/memberInvitation.service";

export function useMyInvitations() {
  return useQuery({
    queryKey: queryKeys.myInvitations,
    queryFn: memberInvitationService.mine,
  });
}
