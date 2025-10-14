/**
 * Users API Service
 * API integration for user management endpoints
 */

import { api } from "@/lib/api";
import type { UserFilters, UsersResponse } from "@/app/dashboard/users/types";

/**
 * Get list of users with filtering and pagination
 * GET /v1/admin/users
 */
export async function getUsers(filters?: UserFilters): Promise<UsersResponse> {
  const params: Record<string, string> = {
    ...(filters?.name && { name: filters.name }),
    ...(filters?.email && { email: filters.email }),
    ...(filters?.locale && { locale: filters.locale }),
    ...(filters?.page && { page: filters.page.toString() }),
    ...(filters?.per && { per: filters.per.toString() })
  };

  const response = await api.get<UsersResponse>("/admin/users", { params });
  return response.data;
}