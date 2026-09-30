import { create } from "zustand";
import type { LoginFormValues } from "../schemas/loginSchema";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean; // true while the login request is running
  isCheckingAuth: boolean; // true while we ask the backend "am I logged in?" on page load
  error: string | null;
  login: (values: LoginFormValues) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// The JWT lives in an HTTP-only cookie that JavaScript cannot read.
// The browser sends it automatically with every /api request, so we only keep the user here.
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true,
  error: null,

  // Returns true if login succeeded.
  login: async (values) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();

      if (!response.ok) {
        set({ isLoading: false, error: data.message ?? "Login failed" });
        return false;
      }

      set({ user: data.user, isAuthenticated: true, isLoading: false });
      return true;
    } catch {
      set({ isLoading: false, error: "Cannot reach the server. Please try again." });
      return false;
    }
  },

  logout: async () => {
    try {
      // The backend clears the cookie
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      set({ user: null, isAuthenticated: false, error: null });
    }
  },

  // Called once when the app loads, so a page refresh keeps the user logged in.
  checkAuth: async () => {
    try {
      const response = await fetch("/api/auth/me");

      if (!response.ok) {
        set({ user: null, isAuthenticated: false, isCheckingAuth: false });
        return;
      }

      const data = await response.json();
      set({ user: data.user, isAuthenticated: true, isCheckingAuth: false });
    } catch {
      set({ user: null, isAuthenticated: false, isCheckingAuth: false });
    }
  },
}));
