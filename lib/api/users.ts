/**
 * Users API Service
 * API integration for user management endpoints
 */

import { api } from "@/lib/api";
import type { UpdateUserData, User, UserFilters, UsersResponse } from "@/app/dashboard/users/types";

/**
 * Get list of users with filtering and pagination
 * GET /admin/users
 */
export async function getUsers(filters?: UserFilters): Promise<UsersResponse> {
  const params: Record<string, string> = {
    ...(filters?.name && { name: filters.name }),
    ...(filters?.email && { email: filters.email }),
    ...(filters?.locale && { locale: filters.locale }),
    ...(filters?.admin !== undefined && { admin: filters.admin.toString() }),
    ...(filters?.page && { page: filters.page.toString() }),
    ...(filters?.per && { per: filters.per.toString() })
  };

  const response = await api.get<UsersResponse>("/admin/users", { params });
  return response.data;
}

/**
 * Update a user by ID
 * PATCH /admin/users/:id
 */
export async function updateUser(userId: number, data: UpdateUserData): Promise<User> {
  const response = await api.patch<{ user: User }>(`/admin/users/${userId}`, { user: data });
  return response.data.user;
}

/**
 * Delete a user by ID
 * DELETE /admin/users/:id
 */
export async function deleteUser(userId: number): Promise<void> {
  await api.delete(`/admin/users/${userId}`);
}
