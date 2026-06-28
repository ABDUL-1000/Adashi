import { useMutation } from "@tanstack/react-query";

import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";

export function useVerifyOtp() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: authService.verifyOtp,
    onSuccess: (response) => {
      setAuth(response.data.token, response.data.user);
    },
  });
}
