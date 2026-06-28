import { useQuery } from "@tanstack/react-query";

import { groupService } from "@/services/group.service";

export function useGetGroups() {
  return useQuery({
    queryKey: ["groups"],
    queryFn: groupService.getGroups,
  });
}
