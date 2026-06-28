import { useMutation } from "@tanstack/react-query";

import { inviteService } from "@/services/invite.service";

export function useJoinGroup() {
  return useMutation({
    mutationFn: inviteService.joinGroup,
  });
}
