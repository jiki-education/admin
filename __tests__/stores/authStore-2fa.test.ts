/**
 * Auth Store 2FA Tests
 * Tests for two-factor authentication functionality in the auth store
 */

// Unmock the auth store for these tests
jest.unmock("@/stores/authStore");

import { useAuthStore } from "@/stores/authStore";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("Auth Store - 2FA functionality", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      hasCheckedAuth: false,
      twoFactorPending: null,
      provisioningUri: null
    });
  });

  describe("login with 2FA", () => {
    test("sets twoFactorPending to 'verify' when 2fa_required response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: "2fa_required" })
      });

      await useAuthStore.getState().login({ email: "test@example.com", password: "password" });

      const state = useAuthStore.getState();
      expect(state.twoFactorPending).toBe("verify");
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
    });

    test("sets twoFactorPending to 'setup' and stores provisioning_uri when 2fa_setup_required", async () => {
      const provisioningUri = "otpauth://totp/Jiki:test@example.com?secret=ABC123";
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            status: "2fa_setup_required",
            provisioning_uri: provisioningUri
          })
      });

      await useAuthStore.getState().login({ email: "test@example.com", password: "password" });

      const state = useAuthStore.getState();
      expect(state.twoFactorPending).toBe("setup");
      expect(state.provisioningUri).toBe(provisioningUri);
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
    });

    test("sets user and isAuthenticated when normal login success", async () => {
      const user = { handle: "test", email: "test@example.com", name: "Test User" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user })
      });

      await useAuthStore.getState().login({ email: "test@example.com", password: "password" });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(user);
      expect(state.isAuthenticated).toBe(true);
      expect(state.twoFactorPending).toBeNull();
    });
  });

  describe("verify2FA", () => {
    test("calls /auth/verify-2fa endpoint with otp_code", async () => {
      const user = { handle: "test", email: "test@example.com", name: "Test User" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user })
      });

      await useAuthStore.getState().verify2FA("123456");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/auth/verify-2fa"),
        expect.objectContaining({
          method: "POST",
          credentials: "include",
          body: JSON.stringify({ otp_code: "123456" })
        })
      );
    });

    test("sets user and clears 2FA state on success", async () => {
      const user = { handle: "test", email: "test@example.com", name: "Test User" };
      useAuthStore.setState({ twoFactorPending: "verify" });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user })
      });

      await useAuthStore.getState().verify2FA("123456");

      const state = useAuthStore.getState();
      expect(state.user).toEqual(user);
      expect(state.isAuthenticated).toBe(true);
      expect(state.twoFactorPending).toBeNull();
    });

    test("throws error and sets error message on failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: { message: "Invalid code" } })
      });

      await expect(useAuthStore.getState().verify2FA("123456")).rejects.toThrow("Invalid code");

      const state = useAuthStore.getState();
      expect(state.error).toBe("Invalid code");
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe("setup2FA", () => {
    test("calls /auth/setup-2fa endpoint with otp_code", async () => {
      const user = { handle: "test", email: "test@example.com", name: "Test User" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user })
      });

      await useAuthStore.getState().setup2FA("123456");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/auth/setup-2fa"),
        expect.objectContaining({
          method: "POST",
          credentials: "include",
          body: JSON.stringify({ otp_code: "123456" })
        })
      );
    });

    test("sets user and clears 2FA state on success", async () => {
      const user = { handle: "test", email: "test@example.com", name: "Test User" };
      useAuthStore.setState({
        twoFactorPending: "setup",
        provisioningUri: "otpauth://..."
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user })
      });

      await useAuthStore.getState().setup2FA("123456");

      const state = useAuthStore.getState();
      expect(state.user).toEqual(user);
      expect(state.isAuthenticated).toBe(true);
      expect(state.twoFactorPending).toBeNull();
      expect(state.provisioningUri).toBeNull();
    });

    test("throws error and sets error message on failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: { message: "Setup failed" } })
      });

      await expect(useAuthStore.getState().setup2FA("123456")).rejects.toThrow("Setup failed");

      const state = useAuthStore.getState();
      expect(state.error).toBe("Setup failed");
    });
  });

  describe("clear2FAState", () => {
    test("clears twoFactorPending, provisioningUri, and error", () => {
      useAuthStore.setState({
        twoFactorPending: "setup",
        provisioningUri: "otpauth://...",
        error: "Some error"
      });

      useAuthStore.getState().clear2FAState();

      const state = useAuthStore.getState();
      expect(state.twoFactorPending).toBeNull();
      expect(state.provisioningUri).toBeNull();
      expect(state.error).toBeNull();
    });
  });
});
