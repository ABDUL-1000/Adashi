import { useQuery } from "@tanstack/react-query";

import { groupService } from "@/services/group.service";
import { queryKeys } from "@/lib/queryKeys";

export function useGetGroupDetails(groupId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.groupDetails(groupId ?? ""),
    queryFn: () => groupService.getGroupDetails(groupId as string),
    enabled: Boolean(groupId),
  });
}
