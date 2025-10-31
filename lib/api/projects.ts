/**
 * Projects API Service
 * API integration for project management endpoints
 */

import { api } from "./client";
import type {
  AdminProject,
  AdminProjectFilters,
  AdminProjectsResponse,
  CreateProjectData,
  UpdateProjectData
} from "@/app/dashboard/projects/types";

/**
 * Get list of projects with filtering and pagination
 * GET /admin/projects
 */
export async function getAdminProjects(filters?: AdminProjectFilters): Promise<AdminProjectsResponse> {
  const params: Record<string, string> = {
    ...(filters?.title && { title: filters.title }),
    ...(filters?.page && { page: filters.page.toString() }),
    ...(filters?.per && { per: filters.per.toString() })
  };

  const response = await api.get<AdminProjectsResponse>("/admin/projects", { params });
  return response.data;
}

/**
 * Get a single project by ID
 * GET /admin/projects/:id
 */
export async function getAdminProject(id: number): Promise<AdminProject> {
  const response = await api.get<{ project: AdminProject }>(`/admin/projects/${id}`);
  return response.data.project;
}

/**
 * Create a new project
 * POST /admin/projects
 */
export async function createProject(data: CreateProjectData): Promise<AdminProject> {
  const response = await api.post<{ project: AdminProject }>("/admin/projects", { project: data });
  return response.data.project;
}

/**
 * Update an existing project
 * PATCH /admin/projects/:id
 */
export async function updateProject(id: number, data: UpdateProjectData): Promise<AdminProject> {
  const response = await api.patch<{ project: AdminProject }>(`/admin/projects/${id}`, { project: data });
  return response.data.project;
}

/**
 * Delete a project by ID
 * DELETE /admin/projects/:id
 */
export async function deleteProject(id: number): Promise<void> {
  await api.delete(`/admin/projects/${id}`);
}