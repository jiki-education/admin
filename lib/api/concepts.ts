/**
 * Concepts API Service
 * API integration for concept management endpoints
 */

import { api } from "./client";
import type {
  AdminConcept,
  AdminConceptFilters,
  AdminConceptsResponse,
  CreateConceptData,
  UpdateConceptData
} from "@/app/dashboard/concepts/types";

/**
 * Get list of concepts with filtering and pagination
 * GET /v1/admin/concepts
 */
export async function getAdminConcepts(filters?: AdminConceptFilters): Promise<AdminConceptsResponse> {
  const params: Record<string, string> = {
    ...(filters?.title && { title: filters.title }),
    ...(filters?.page && { page: filters.page.toString() }),
    ...(filters?.per && { per: filters.per.toString() })
  };

  const response = await api.get<AdminConceptsResponse>("/admin/concepts", { params });
  return response.data;
}

/**
 * Get a single concept by ID
 * GET /v1/admin/concepts/:id
 */
export async function getAdminConcept(id: number): Promise<AdminConcept> {
  const response = await api.get<{ concept: AdminConcept }>(`/admin/concepts/${id}`);
  return response.data.concept;
}

/**
 * Create a new concept
 * POST /v1/admin/concepts
 */
export async function createConcept(data: CreateConceptData): Promise<AdminConcept> {
  const response = await api.post<{ concept: AdminConcept }>("/admin/concepts", { concept: data });
  return response.data.concept;
}

/**
 * Update an existing concept
 * PATCH /v1/admin/concepts/:id
 */
export async function updateConcept(id: number, data: UpdateConceptData): Promise<AdminConcept> {
  const response = await api.patch<{ concept: AdminConcept }>(`/admin/concepts/${id}`, { concept: data });
  return response.data.concept;
}

/**
 * Delete a concept by ID
 * DELETE /v1/admin/concepts/:id
 */
export async function deleteConcept(id: number): Promise<void> {
  await api.delete(`/admin/concepts/${id}`);
}