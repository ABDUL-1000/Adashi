import { useQuery } from "@tanstack/react-query";

import { groupService } from "@/services/group.service";
import { queryKeys } from "@/lib/queryKeys";

export function useGetGroups() {
  return useQuery({
    queryKey: queryKeys.groups,
    queryFn: groupService.getGroups,
  });
}
