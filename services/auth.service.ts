import api from "./api";
import type {
  LoginRequest,
  LoginResponse,
  ProfileResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from "@/types/auth.types";

export const authService = {
  register: async (payload: RegisterRequest) => {
    return api.post<RegisterResponse, RegisterResponse>("/auth/register", payload);
  },
  verifyOtp: async (payload: VerifyOtpRequest) => {
    return api.post<VerifyOtpResponse, VerifyOtpResponse>(
      "/auth/verify-otp",
      payload
    );
  },
  login: async (payload: LoginRequest) => {
    return api.post<LoginResponse, LoginResponse>("/auth/login", payload);
  },
  profile: async () => {
    return api.get<ProfileResponse, ProfileResponse>("/auth/profile");
  },
};
