import { useMutation } from "@tanstack/react-query";

import { memberService } from "@/services/member.service";

export function useJoinGroup() {
  return useMutation({
    mutationFn: memberService.joinGroup,
  });
}
