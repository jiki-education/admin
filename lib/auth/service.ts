"use client";

/**
 * Authentication Service
 * API integration for authentication endpoints
 */

import { api } from "@/lib/api";
import type { PasswordReset, PasswordResetRequest, User } from "@/types/auth";

/**
 * Request password reset
 * POST /auth/password
 */
export async function requestPasswordReset(data: PasswordResetRequest): Promise<void> {
  await api.post("/auth/password", { user: data });
}

/**
 * Complete password reset
 * PATCH /auth/password
 */
export async function resetPassword(data: PasswordReset): Promise<void> {
  await api.patch("/auth/password", { user: data });
}

/**
 * Get current user from /internal/me endpoint
 * GET /internal/me
 */
export async function getCurrentUser(useRetries: boolean = true): Promise<User> {
  const response = await api.get<{ user: User }>("/internal/me", undefined, useRetries);
  return response.data.user;
}
