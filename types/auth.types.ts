import type { ApiMessageResponse, ApiResponse } from "./api.types";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

export type VerifyOtpRequest = {
  email: string;
  otp: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthPayload = {
  token: string;
  user: AuthUser;
};

export type Profile = AuthUser & {
  createdAt: string;
};

export type RegisterResponse = ApiMessageResponse;
export type VerifyOtpResponse = ApiResponse<AuthPayload>;
export type LoginResponse = ApiResponse<AuthPayload>;
export type ProfileResponse = ApiResponse<Profile>;
