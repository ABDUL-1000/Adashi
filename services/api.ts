import axios, { AxiosError } from "axios";

import { getErrorMessage } from "@/lib/getErrorMessage";
import { getToken } from "@/lib/token";
import { useAuthStore } from "@/store/authStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error: unknown) {
  return getErrorMessage(error);
}

export default api;
