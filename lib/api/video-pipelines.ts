/**
 * Video Pipelines API Service
 * API integration for video production pipeline management endpoints
 */

import { api } from "@/lib/api";

// Node Types
export type NodeType = 
  | "asset"                  // Static file references
  | "generate-talking-head"  // HeyGen talking head videos
  | "generate-animation"     // Veo 3 / Runway animations
  | "generate-voiceover"     // ElevenLabs text-to-speech
  | "render-code"           // Remotion code screen animations
  | "mix-audio"             // FFmpeg audio replacement
  | "merge-videos"          // FFmpeg video concatenation
  | "compose-video";        // FFmpeg picture-in-picture overlays

export type NodeStatus = "pending" | "in_progress" | "completed" | "failed";

// Input Types and Structure
export interface NodeInputSlot {
  type: "single" | "multiple";
  required: boolean;
  description: string;
  minCount?: number;    // For multiple inputs
  maxCount?: number;    // For multiple inputs (null = unlimited)
}

export interface NodeInputs {
  [slotName: string]: NodeInputSlot;
}

export interface NodeInputValues {
  [slotName: string]: string | string[]; // UUID references to other nodes
}

// Configuration Structure
export interface NodeConfig {
  provider?: "heygen" | "elevenlabs" | "veo3" | "remotion" | "ffmpeg";
  [key: string]: any; // Additional provider-specific config
}

// Asset Data Structure
export interface NodeAsset {
  type: "text" | "image" | "audio" | "video" | "json";
  content?: string | object;  // Inline content for text/json assets
  source?: string;            // S3 URI or external URL for media assets
}

// Metadata Structure
export interface NodeMetadata {
  // Process tracking
  processUuid?: string;     // Unique execution identifier
  startedAt?: string;       // ISO8601 execution start time
  completedAt?: string;     // ISO8601 execution completion time
  
  // External API integration
  audioId?: string;         // ElevenLabs job ID
  videoId?: string;         // HeyGen job ID
  jobId?: string;           // Generic external job ID
  stage?: string;           // Current processing stage
  
  // Error tracking
  error?: string;           // Error message for failed executions
  
  // Cost and performance
  cost?: number;            // Estimated cost for this node
  retries?: number;         // Number of retry attempts
}

// Output Structure
export interface NodeOutput {
  s3Key?: string;          // S3 object key for output file
  duration?: number;       // Duration in seconds (for audio/video)
  size?: number;           // File size in bytes
  width?: number;          // Video width in pixels
  height?: number;         // Video height in pixels
  format?: string;         // File format (mp4, mp3, etc.)
  url?: string;            // Temporary or permanent URL to output
}

// Validation Errors Structure
export interface ValidationErrors {
  inputs?: {
    [slotName: string]: string[]; // Array of error messages per input slot
  };
  config?: {
    [fieldName: string]: string[]; // Array of error messages per config field
  };
}

// Pipeline structures
export interface PipelineProgress {
  pending: number;
  in_progress: number;  // Matches server response field name
  completed: number;
  failed: number;
  total: number;        // Add total field from server response
}

export interface PipelineMetadata {
  totalCost?: number;        // Actual total cost incurred
  estimatedTotalCost?: number; // Estimated cost for entire pipeline
  progress?: PipelineProgress; // Node progress summary
}

export interface PipelineConfig {
  storage?: {
    bucket: string;        // S3 bucket name
    prefix: string;        // S3 key prefix for outputs
  };
  workingDirectory?: string; // Local working directory path
}

export interface VideoProductionPipeline {
  uuid: string;         // UUID primary key (from server response)
  version: string;      // Pipeline version (default: "1.0")
  title: string;        // Human-readable pipeline title
  config: PipelineConfig; // JSONB - Pipeline configuration
  metadata: PipelineMetadata; // JSONB - Progress and cost tracking
  createdAt?: string;   // ISO8601 timestamp (optional in server response)
  updatedAt?: string;   // ISO8601 timestamp (optional in server response)
}

// Legacy Pipeline interface for backward compatibility
export interface Pipeline {
  uuid: string;
  title: string;
  version: string;
  config: PipelineConfig;
  metadata: PipelineMetadata;
  created_at: string;
  updated_at: string;
}

export interface VideoProductionNode {
  uuid: string;         // UUID primary key (from server response)
  pipeline_uuid: string; // Foreign key to pipeline (from server response)  
  title: string;        // Human-readable node title
  
  // Structure (Next.js writes these fields)
  type: NodeType;       // Node type
  inputs: NodeInputs;   // JSONB - Input slot definitions
  config: NodeConfig;   // JSONB - Node configuration
  asset?: NodeAsset;    // JSONB - Asset data for asset nodes
  
  // Execution state (Rails writes these fields)
  status: NodeStatus;   // Execution status
  metadata?: NodeMetadata; // JSONB - Process tracking and external API data
  output?: NodeOutput;  // JSONB - Execution results
  
  // Validation state (Rails writes these fields)
  is_valid: boolean;    // Whether node passes validation (from server response)
  validation_errors: ValidationErrors; // JSONB - Validation error details (from server response)
  
  created_at?: string;  // ISO8601 timestamp (optional in server response)
  updated_at?: string;  // ISO8601 timestamp (optional in server response)
}

// Legacy Node interface for backward compatibility
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

export interface VideoProductionPipelineWithNodes extends VideoProductionPipeline {
  nodes: VideoProductionNode[];
}

// Legacy interface for backward compatibility
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
 * GET /v1/admin/video_production/pipelines/:uuid/nodes
 */
export async function getPipeline(uuid: string): Promise<{ pipeline: VideoProductionPipeline; nodes: VideoProductionNode[] }> {
  // Fetch pipeline and nodes separately (following video-production pattern)
  const [pipelineResponse, nodesResponse] = await Promise.all([
    api.get<{ pipeline: VideoProductionPipeline }>(`/admin/video_production/pipelines/${uuid}`),
    api.get<{ nodes: VideoProductionNode[] }>(`/admin/video_production/pipelines/${uuid}/nodes`)
  ]);

  return {
    pipeline: pipelineResponse.data.pipeline,
    nodes: nodesResponse.data.nodes
  };
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

/**
 * Connect two nodes by updating target node's inputs
 * PATCH /v1/admin/video_production/pipelines/:pipeline_uuid/nodes/:target_uuid
 */
export async function connectNodes(
  pipelineUuid: string,
  sourceNodeUuid: string,
  targetNodeUuid: string,
  inputKey: string
): Promise<void> {
  // First fetch the target node to get its current inputs
  const nodeResponse = await api.get(`/admin/video_production/pipelines/${pipelineUuid}/nodes/${targetNodeUuid}`);
  const node = nodeResponse.data.node;

  // Update the inputs - check if it's an array or single value
  const currentValue = node.inputs[inputKey];
  let newInputs: Record<string, unknown>;

  if (Array.isArray(currentValue)) {
    // Append to array if not already present
    if (!currentValue.includes(sourceNodeUuid)) {
      newInputs = {
        ...node.inputs,
        [inputKey]: [...currentValue, sourceNodeUuid]
      };
    } else {
      // Already connected
      return;
    }
  } else {
    // Set as single value
    newInputs = {
      ...node.inputs,
      [inputKey]: sourceNodeUuid
    };
  }

  // PATCH the node with updated inputs
  await api.patch(`/admin/video_production/pipelines/${pipelineUuid}/nodes/${targetNodeUuid}`, {
    node: { inputs: newInputs }
  });
}

/**
 * Delete a node from a pipeline
 * DELETE /v1/admin/video_production/pipelines/:pipeline_uuid/nodes/:uuid
 */
export async function deleteNode(pipelineUuid: string, nodeUuid: string): Promise<void> {
  await api.delete(`/admin/video_production/pipelines/${pipelineUuid}/nodes/${nodeUuid}`);
}

/**
 * Create a new node in a pipeline
 * POST /v1/admin/video_production/pipelines/:pipeline_uuid/nodes
 */
export async function createNode(
  pipelineUuid: string,
  nodeData: {
    id: string;
    type: string;
    title: string;
    inputs: Record<string, unknown>;
    config: Record<string, unknown>;
    asset?: Record<string, unknown>;
  }
): Promise<VideoProductionNode> {
  const response = await api.post(`/admin/video_production/pipelines/${pipelineUuid}/nodes`, {
    node: nodeData
  });
  return response.data.node;
}

/**
 * Update a node's configuration
 * PATCH /v1/admin/video_production/pipelines/:pipeline_uuid/nodes/:uuid
 */
export async function updateNode(
  pipelineUuid: string,
  nodeUuid: string,
  updates: Partial<VideoProductionNode>
): Promise<VideoProductionNode> {
  const response = await api.patch(`/admin/video_production/pipelines/${pipelineUuid}/nodes/${nodeUuid}`, {
    node: updates
  });
  return response.data.node;
}

/**
 * Reorder inputs array for a node
 * PATCH /v1/admin/video_production/pipelines/:pipeline_uuid/nodes/:uuid
 */
export async function reorderNodeInputs(
  pipelineUuid: string,
  nodeUuid: string,
  inputKey: string,
  newOrder: string[]
): Promise<void> {
  // First fetch the target node to get its current inputs
  const nodeResponse = await api.get(`/admin/video_production/pipelines/${pipelineUuid}/nodes/${nodeUuid}`);
  const node = nodeResponse.data.node;

  // Update the inputs with new order
  const newInputs = {
    ...node.inputs,
    [inputKey]: newOrder
  };

  // PATCH the node with updated inputs
  await api.patch(`/admin/video_production/pipelines/${pipelineUuid}/nodes/${nodeUuid}`, {
    node: { inputs: newInputs }
  });
}

// Detailed Node Type Interfaces

// Asset Node
export interface AssetNode extends VideoProductionNode {
  type: "asset";
  inputs: Record<string, never>; // Asset nodes have no inputs
  config: Record<string, never>;
  asset: NodeAsset; // Required for asset nodes
}

// Generate Voiceover Node
export interface GenerateVoiceoverNode extends VideoProductionNode {
  type: "generate-voiceover";
  inputs: {
    script?: string; // Optional reference to asset node with script
  };
  config: {
    provider: "elevenlabs";
    voiceId?: string;        // ElevenLabs voice ID
    stability?: number;      // Voice stability (0-1)
    similarityBoost?: number; // Voice similarity boost (0-1)
    style?: number;          // Voice style (0-1)
    useSpeakerBoost?: boolean; // Enable speaker boost
  };
}

// Generate Talking Head Node
export interface GenerateTalkingHeadNode extends VideoProductionNode {
  type: "generate-talking-head";
  inputs: {
    audio: string;      // Required reference to audio node
    background?: string; // Optional reference to image asset
  };
  config: {
    provider: "heygen";
    avatarId: string;   // HeyGen avatar ID (e.g., "Monica_inSleeveless_20220819")
    width?: number;     // Video width in pixels (default: 1280)
    height?: number;    // Video height in pixels (default: 720)
    test?: boolean;     // Use test mode (free but watermarked)
  };
}

// Generate Animation Node
export interface GenerateAnimationNode extends VideoProductionNode {
  type: "generate-animation";
  inputs: {
    prompt?: string;    // Reference to asset node with animation prompt
    image?: string;     // Reference to image asset for image-to-video
  };
  config: {
    provider: "veo3";
    duration?: number;  // Animation duration in seconds
    aspectRatio?: "16:9" | "9:16" | "1:1";
    style?: string;     // Animation style prompt
  };
}

// Code Configuration for Render Code Node
export interface CodeConfig {
  language: string;     // Programming language
  theme: string;        // Syntax highlighting theme
  title?: string;       // Code block title
  code: string;         // Source code content
  highlights?: Array<{
    line: number;       // Line number to highlight
    description: string; // Explanation of the highlighted line
  }>;
}

// Render Code Node
export interface RenderCodeNode extends VideoProductionNode {
  type: "render-code";
  inputs: {
    config: string;     // Required reference to asset node with code config
  };
  config: {
    provider: "remotion";
    duration?: number;  // Animation duration in seconds
    width?: number;     // Video width in pixels
    height?: number;    // Video height in pixels
  };
}

// Mix Audio Node
export interface MixAudioNode extends VideoProductionNode {
  type: "mix-audio";
  inputs: {
    video: string;      // Required reference to video node
    audio: string;      // Required reference to audio node
  };
  config: {
    provider: "ffmpeg";
    audioVolume?: number; // Audio volume (0-1, default: 1)
    fadeIn?: number;     // Fade in duration in seconds
    fadeOut?: number;    // Fade out duration in seconds
  };
}

// Merge Videos Node
export interface MergeVideosNode extends VideoProductionNode {
  type: "merge-videos";
  inputs: {
    segments: string[]; // Array of video node references (min 2, no max)
  };
  config: {
    provider: "ffmpeg";
    transition?: "none" | "fade" | "crossfade"; // Transition between segments
    transitionDuration?: number; // Transition duration in seconds
  };
}

// Compose Video Node
export interface ComposeVideoNode extends VideoProductionNode {
  type: "compose-video";
  inputs: {
    background: string; // Required reference to background video
    overlay: string;    // Required reference to overlay video
  };
  config: {
    provider: "ffmpeg";
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
    opacity?: number;   // Overlay opacity (0-1, default: 1)
    scale?: number;     // Overlay scale (default: 1)
    offsetX?: number;   // Horizontal offset in pixels
    offsetY?: number;   // Vertical offset in pixels
  };
}