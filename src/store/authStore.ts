import { create } from "zustand";
import type { LoginFormValues } from "../schemas/loginSchema";
import api from "../components/axios/axios";
import { useModuleStore } from "./moduleStore";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCheckingAuth: boolean;
  error: string | null;
  login: (values: LoginFormValues) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true,
  error: null,

  login: async (values) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.post("/auth/login", values);

      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });

      return true;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message ?? "Login failed",
      });

      return false;
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        error: null,
      });
      // Forget this school's menu
      useModuleStore.getState().reset();
    }
  },

  checkAuth: async () => {
    try {
      const response = await api.get("/auth/me");

      set({
        user: response.data.user,
        isAuthenticated: true,
        isCheckingAuth: false,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isCheckingAuth: false,
      });
    }
  },
}));
