/**
 * Authentication Store
 * Zustand store for managing authentication state
 */

import { login as apiLogin, logout as apiLogout, signup as apiSignup, validateToken } from "@/lib/auth/service";
import type { AuthState, LoginCredentials, SignupData, User } from "@/types/auth";
import { create } from "zustand";

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, _get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  hasCheckedAuth: false,

  // Actions
  login: async (credentials: LoginCredentials) => {
    try {
      set({ isLoading: true, error: null });

      const apiUser = await apiLogin(credentials);

      // Store email in sessionStorage for session restoration
      const { setUserEmail } = await import("@/lib/auth/storage");
      setUserEmail(apiUser.email);

      // Use email from API response, but only store email
      const user: User = { email: apiUser.email };

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        hasCheckedAuth: true
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
        hasCheckedAuth: true
      });
      throw error;
    }
  },

  signup: async (userData: SignupData) => {
    try {
      set({ isLoading: true, error: null });

      const apiUser = await apiSignup(userData);

      // Store email in sessionStorage for session restoration
      const { setUserEmail } = await import("@/lib/auth/storage");
      setUserEmail(apiUser.email);

      // Use email from API response, but only store email
      const user: User = { email: apiUser.email };

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        hasCheckedAuth: true
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Signup failed";
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
        hasCheckedAuth: true
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true, error: null });

      await apiLogout();

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        hasCheckedAuth: true
      });
    } catch (error) {
      // Even if logout API fails, clear local state
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        hasCheckedAuth: true
      });

      console.error("Logout error:", error);
    }
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true, error: null });

      const isValid = await validateToken();

      if (isValid) {
        // Token is valid, get user email from sessionStorage
        try {
          const { getUserEmail } = await import("@/lib/auth/storage");
          const email = getUserEmail();
          
          if (email) {
            const user: User = { email };
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              hasCheckedAuth: true
            });
            return;
          }
        } catch (userError) {
          console.error("Failed to get user email from storage:", userError);
        }
      }

      // Token invalid or no user data found
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        hasCheckedAuth: true
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        hasCheckedAuth: true
      });

      console.error("Auth check error:", error);
    }
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  }
}));
