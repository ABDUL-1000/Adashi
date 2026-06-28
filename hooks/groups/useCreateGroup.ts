import { useMutation, useQueryClient } from "@tanstack/react-query";

import { groupService } from "@/services/group.service";

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: groupService.createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}
