/**
 * Users API Service
 * API integration for user management endpoints
 */

import { api } from "@/lib/api";
import type { User, UserFilters, UsersResponse } from "@/app/dashboard/users/types";

/**
 * Get list of users with filtering and pagination
 * GET /admin/users
 */
export async function getUsers(filters?: UserFilters): Promise<UsersResponse> {
  const params: Record<string, string> = {
    ...(filters?.name && { name: filters.name }),
    ...(filters?.email && { email: filters.email }),
    ...(filters?.page && { page: filters.page.toString() }),
    ...(filters?.per && { per: filters.per.toString() })
  };

  const response = await api.get<UsersResponse>("/admin/users", { params });
  return response.data;
}

/**
 * Get a single user by ID
 * GET /admin/users/:id
 */
export async function getUser(userId: number): Promise<User> {
  const response = await api.get<{ user: User }>(`/admin/users/${userId}`);
  return response.data.user;
}

/**
 * Delete a user by ID
 * DELETE /admin/users/:id
 */
export async function deleteUser(userId: number): Promise<void> {
  await api.delete(`/admin/users/${userId}`);
}

/**
 * Reset a user's password
 * PATCH /admin/users/:id/reset_password
 */
export async function resetUserPassword(userId: number, password: string): Promise<void> {
  await api.patch(`/admin/users/${userId}/reset_password`, { password });
}

/**
 * Disable a user's 2FA
 * DELETE /admin/users/:id/reset_otp
 */
export async function resetUserOtp(userId: number): Promise<User> {
  const response = await api.delete<{ user: User }>(`/admin/users/${userId}/reset_otp`);
  return response.data.user;
}

/**
 * Toggle a user's admin flag (or update email)
 * PATCH /admin/users/:id
 */
export async function updateUser(userId: number, data: { email?: string; admin?: boolean }): Promise<User> {
  const response = await api.patch<{ user: User }>(`/admin/users/${userId}`, { user: data });
  return response.data.user;
}
