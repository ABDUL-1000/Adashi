import { create } from "zustand";
import { persist } from "zustand/middleware";

import { clearToken, getToken, setToken } from "@/lib/token";
import type { AuthUser } from "@/types/auth.types";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
  hydrateAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (token, user) => {
        setToken(token);
        set({ token, user, isAuthenticated: true });
      },
      setUser: (user) => set({ user, isAuthenticated: Boolean(get().token) }),
      logout: () => {
        clearToken();
        set({ token: null, user: null, isAuthenticated: false });
      },
      hydrateAuth: () => {
        const token = getToken() ?? get().token;
        set((state) => ({
          token,
          isAuthenticated: Boolean(token && state.user),
        }));
      },
    }),
    {
      name: "adashi-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setToken(state.token);
        }
      },
    }
  )
);
