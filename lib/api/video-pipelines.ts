/**
 * Video Pipelines API Service
 * API integration for video production pipeline management endpoints
 */

import { api } from "@/lib/api";

export interface PipelineProgress {
  completed: number;
  in_progress: number;
  pending: number;
  failed: number;
  total: number;
}

export interface PipelineMetadata {
  totalCost: number;
  estimatedTotalCost?: number;
  progress: PipelineProgress;
}

export interface PipelineConfig {
  storage: {
    bucket: string;
    prefix?: string;
  };
}

export interface Pipeline {
  uuid: string;
  title: string;
  version: string;
  config: PipelineConfig;
  metadata: PipelineMetadata;
  created_at: string;
  updated_at: string;
}

export interface Node {
  uuid: string;
  pipeline_uuid: string;
  title: string;
  type: string;
  inputs: Record<string, unknown>;
  config: Record<string, unknown>;
  asset?: Record<string, unknown>;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  metadata?: Record<string, unknown>;
  output?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PipelineWithNodes extends Pipeline {
  nodes: Node[];
}

export interface PipelinesResponse {
  results: Pipeline[];
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
  };
}

export interface PipelineFilters {
  page?: number;
  per?: number;
}

export interface CreatePipelineData {
  title: string;
  version?: string;
  config: PipelineConfig;
  metadata?: Partial<PipelineMetadata>;
}

export interface UpdatePipelineData {
  title?: string;
  version?: string;
  config?: PipelineConfig;
  metadata?: Partial<PipelineMetadata>;
}

/**
 * Get list of pipelines with filtering and pagination
 * GET /v1/admin/video_production/pipelines
 */
export async function getPipelines(filters?: PipelineFilters): Promise<PipelinesResponse> {
  const params: Record<string, string> = {
    ...(filters?.page && { page: filters.page.toString() }),
    ...(filters?.per && { per: filters.per.toString() })
  };

  const response = await api.get<PipelinesResponse>("/admin/video_production/pipelines", { params });
  return response.data;
}

/**
 * Get single pipeline with nodes
 * GET /v1/admin/video_production/pipelines/:uuid
 */
export async function getPipeline(uuid: string): Promise<{ pipeline: PipelineWithNodes }> {
  const response = await api.get<{ pipeline: PipelineWithNodes }>(`/admin/video_production/pipelines/${uuid}`);
  return response.data;
}

/**
 * Create a new pipeline
 * POST /v1/admin/video_production/pipelines
 */
export async function createPipeline(data: CreatePipelineData): Promise<Pipeline> {
  const response = await api.post<Pipeline>("/admin/video_production/pipelines", {
    pipeline: data
  });
  return response.data;
}

/**
 * Update a pipeline
 * PATCH /v1/admin/video_production/pipelines/:uuid
 */
export async function updatePipeline(uuid: string, data: UpdatePipelineData): Promise<Pipeline> {
  const response = await api.patch<Pipeline>(`/admin/video_production/pipelines/${uuid}`, {
    pipeline: data
  });
  return response.data;
}

/**
 * Delete a pipeline by uuid
 * DELETE /v1/admin/video_production/pipelines/:uuid
 */
export async function deletePipeline(uuid: string): Promise<void> {
  await api.delete(`/admin/video_production/pipelines/${uuid}`);
}