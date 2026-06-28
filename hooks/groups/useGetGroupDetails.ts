import { useQuery } from "@tanstack/react-query";

import { groupService } from "@/services/group.service";

export function useGetGroupDetails(groupId: string | undefined) {
  return useQuery({
    queryKey: ["groups", groupId],
    queryFn: () => groupService.getGroupDetails(groupId as string),
    enabled: Boolean(groupId),
  });
}
