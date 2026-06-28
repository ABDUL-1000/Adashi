import { useQuery } from "@tanstack/react-query";

import { authService } from "@/services/auth.service";
import { queryKeys } from "@/lib/queryKeys";

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: authService.profile,
  });
}
