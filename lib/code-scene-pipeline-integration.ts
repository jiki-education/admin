/**
 * Code Scene Pipeline Integration Utilities
 * 
 * Functions for integrating code scenes with video pipeline workflow,
 * including asset management and render job tracking.
 */

import type { SceneConfig } from "@/lib/remotion/types";
import type { CodeScene } from "@/lib/types/code-scenes";

export interface CodeSceneRenderJob {
  id: string;
  sceneId: string;
  pipelineId: string;
  nodeId: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  progress?: number;
  outputUrl?: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export interface CodeSceneAsset {
  id: string;
  sceneId: string;
  pipelineId: string;
  nodeId: string;
  videoUrl: string;
  duration: number;
  resolution: string;
  fileSize: number;
  createdAt: string;
}

/**
 * Generate a render job for a code scene in a pipeline node
 */
export function createRenderJob(
  sceneId: string,
  pipelineId: string,
  nodeId: string
): Omit<CodeSceneRenderJob, "id" | "createdAt"> {
  return {
    sceneId,
    pipelineId,
    nodeId,
    status: "pending"
  };
}

/**
 * Get estimated render duration for a scene configuration
 */
export function estimateRenderDuration(config: SceneConfig): number {
  const fps = 30;
  let totalFrames = 0;

  for (const action of config.actions) {
    if (action.type === "type") {
      // Estimate typing duration based on code length and speed
      const charCount = action.code.length;
      const speeds = { slow: 10, normal: 15, fast: 25 };
      const speed = Array.isArray(action.speed) ? action.speed[0] : action.speed;
      const charsPerSecond = speeds[speed] || 15;
      const seconds = charCount / charsPerSecond;
      totalFrames += Math.ceil(seconds * fps);
    } else if (action.type === "pause") {
      totalFrames += Math.ceil(action.duration * fps);
    }
  }

  // Add buffer for fade in/out and transitions
  totalFrames += fps; // 1 second buffer
  
  return Math.round(totalFrames / fps * 100) / 100; // Round to 2 decimal places
}

/**
 * Generate video file name for a code scene
 */
export function generateVideoFileName(scene: CodeScene): string {
  const sanitizedTitle = scene.title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, "");
  
  return `code_scene_${sanitizedTitle}_${timestamp}.mp4`;
}

/**
 * Validate that a scene configuration is ready for rendering
 */
export function validateSceneForRendering(config: SceneConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.title || config.title.trim().length === 0) {
    errors.push("Scene title is required");
  }

  if (!config.actions || config.actions.length === 0) {
    errors.push("At least one action is required");
  }

  for (let i = 0; i < config.actions.length; i++) {
    const action = config.actions[i];
    
    if (action.type === "type") {
      if (!action.code || action.code.trim().length === 0) {
        errors.push(`Type action at position ${i + 1} has no code content`);
      }
      if (!action.speed) {
        errors.push(`Type action at position ${i + 1} has no speed setting`);
      }
    } else if (action.type === "pause") {
      if (typeof action.duration !== "number" || action.duration <= 0) {
        errors.push(`Pause action at position ${i + 1} has invalid duration`);
      }
    } else {
      errors.push(`Unknown action type at position ${i + 1}: ${action.type}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Calculate total actions and complexity score for a scene
 */
export function analyzeSceneComplexity(config: SceneConfig): {
  totalActions: number;
  typeActions: number;
  pauseActions: number;
  totalCharacters: number;
  estimatedDuration: number;
  complexityScore: "simple" | "moderate" | "complex";
} {
  const totalActions = config.actions.length;
  let typeActions = 0;
  let pauseActions = 0;
  let totalCharacters = 0;

  for (const action of config.actions) {
    if (action.type === "type") {
      typeActions++;
      totalCharacters += action.code.length;
    } else if (action.type === "pause") {
      pauseActions++;
    }
  }

  const estimatedDuration = estimateRenderDuration(config);
  
  // Determine complexity based on various factors
  let complexityScore: "simple" | "moderate" | "complex" = "simple";
  
  if (totalActions >= 10 || totalCharacters >= 500 || estimatedDuration >= 60) {
    complexityScore = "complex";
  } else if (totalActions >= 5 || totalCharacters >= 200 || estimatedDuration >= 30) {
    complexityScore = "moderate";
  }

  return {
    totalActions,
    typeActions,
    pauseActions,
    totalCharacters,
    estimatedDuration,
    complexityScore
  };
}

/**
 * API functions that would be implemented once backend is available
 */

export function startSceneRender(
  _pipelineId: string,
  _nodeId: string,
  _sceneId: string
): Promise<{ jobId: string }> {
  // TODO: Implement when backend API is available
  throw new Error("Scene rendering will be implemented when the Rails API is available");
}

export function getRenderJobStatus(_jobId: string): Promise<CodeSceneRenderJob> {
  // TODO: Implement when backend API is available
  throw new Error("Render job status will be implemented when the Rails API is available");
}

export function updateNodeSceneConfiguration(
  _pipelineId: string,
  _nodeId: string,
  _sceneId: string
): Promise<void> {
  // TODO: Implement when backend API is available
  throw new Error("Node configuration update will be implemented when the Rails API is available");
}

export function getSceneAssets(_sceneId: string): Promise<CodeSceneAsset[]> {
  // TODO: Implement when backend API is available
  throw new Error("Scene assets will be implemented when the Rails API is available");
}