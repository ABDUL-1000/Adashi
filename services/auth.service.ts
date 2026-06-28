import api from "./api";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from "@/types/auth.types";

export const authService = {
  register: async (payload: RegisterRequest) => {
    const { data } = await api.post<RegisterResponse>("/auth/register", payload);
    return data;
  },
  verifyOtp: async (payload: VerifyOtpRequest) => {
    const { data } = await api.post<VerifyOtpResponse>(
      "/auth/verify-otp",
      payload
    );
    return data;
  },
  login: async (payload: LoginRequest) => {
    const { data } = await api.post<LoginResponse>("/auth/login", payload);
    return data;
  },
};
