/**
 * Type-Safe Node Discriminated Unions
 *
 * These types represent the domain model for pipeline nodes.
 * These types use the admin codebase's comprehensive video pipeline types.
 */

import type {
  NodeStatus as _NodeStatus,
  NodeMetadata as _NodeMetadata,
  NodeOutput as _NodeOutput,
  NodeAsset as _NodeAsset,
  NodeInputs as _NodeInputs,
  NodeConfig as _NodeConfig,
  VideoProductionNode,
  AssetNode as AdminAssetNode,
  GenerateTalkingHeadNode as AdminGenerateTalkingHeadNode,
  GenerateAnimationNode as AdminGenerateAnimationNode,
  GenerateVoiceoverNode as AdminGenerateVoiceoverNode,
  RenderCodeNode as AdminRenderCodeNode,
  MixAudioNode as AdminMixAudioNode,
  MergeVideosNode as AdminMergeVideosNode,
  ComposeVideoNode as AdminComposeVideoNode
} from "@/lib/api/video-pipelines";

// ============================================================================
// Node Type Aliases for Video Production Editor
// ============================================================================

/**
 * Base interface that adapts admin VideoProductionNode to editor expectations
 * Maps 'id' -> 'uuid' and 'pipelineId' -> 'pipeline_uuid' for compatibility
 */
interface EditorNodeBase {
  uuid: string;          // Mapped from VideoProductionNode.id
  pipeline_uuid: string; // Mapped from VideoProductionNode.pipelineId
}

/**
 * Node types that adapt admin's video pipeline types for editor compatibility
 * These maintain the interface expected by the video production editor components
 */
export type AssetNode = Omit<AdminAssetNode, 'id' | 'pipelineId'> & EditorNodeBase;
export type GenerateTalkingHeadNode = Omit<AdminGenerateTalkingHeadNode, 'id' | 'pipelineId'> & EditorNodeBase;
export type GenerateAnimationNode = Omit<AdminGenerateAnimationNode, 'id' | 'pipelineId'> & EditorNodeBase;
export type GenerateVoiceoverNode = Omit<AdminGenerateVoiceoverNode, 'id' | 'pipelineId'> & EditorNodeBase;
export type RenderCodeNode = Omit<AdminRenderCodeNode, 'id' | 'pipelineId'> & EditorNodeBase;
export type MixAudioNode = Omit<AdminMixAudioNode, 'id' | 'pipelineId'> & EditorNodeBase;
export type MergeVideosNode = Omit<AdminMergeVideosNode, 'id' | 'pipelineId'> & EditorNodeBase;
export type ComposeVideoNode = Omit<AdminComposeVideoNode, 'id' | 'pipelineId'> & EditorNodeBase;

/**
 * Converts VideoProductionNode to editor-compatible Node
 */
export function toEditorNode(adminNode: VideoProductionNode): Node {
  // Server response already has uuid and pipeline_uuid fields, so just cast
  return adminNode as unknown as Node;
}

/**
 * Converts editor Node back to VideoProductionNode format
 */
export function toAdminNode(editorNode: Node): VideoProductionNode {
  // Fields are already compatible, just cast
  return editorNode as unknown as VideoProductionNode;
}

// ============================================================================
// Discriminated Union
// ============================================================================

/**
 * Node is a discriminated union of all node types.
 * TypeScript can narrow the type based on the `type` field.
 *
 * Example:
 *   function handleNode(node: Node) {
 *     if (node.type === 'generate-talking-head') {
 *       // TypeScript knows node is GenerateTalkingHeadNode here
 *       console.log(node.config);
 *     }
 *   }
 */
export type Node =
  | AssetNode
  | GenerateTalkingHeadNode
  | GenerateAnimationNode
  | GenerateVoiceoverNode
  | RenderCodeNode
  | MixAudioNode
  | MergeVideosNode
  | ComposeVideoNode;

/**
 * Extract the type field from all node types
 */
export type NodeType = Node["type"];

/**
 * Alias for VideoProductionNode for compatibility
 */
export type { VideoProductionNode };

// ============================================================================
// Type Guards
// ============================================================================

export function isAssetNode(node: Node): node is AssetNode {
  return node.type === "asset";
}

export function isGenerateTalkingHeadNode(node: Node): node is GenerateTalkingHeadNode {
  return node.type === "generate-talking-head";
}

export function isGenerateAnimationNode(node: Node): node is GenerateAnimationNode {
  return node.type === "generate-animation";
}

export function isGenerateVoiceoverNode(node: Node): node is GenerateVoiceoverNode {
  return node.type === "generate-voiceover";
}

export function isRenderCodeNode(node: Node): node is RenderCodeNode {
  return node.type === "render-code";
}

export function isMixAudioNode(node: Node): node is MixAudioNode {
  return node.type === "mix-audio";
}

export function isMergeVideosNode(node: Node): node is MergeVideosNode {
  return node.type === "merge-videos";
}

export function isComposeVideoNode(node: Node): node is ComposeVideoNode {
  return node.type === "compose-video";
}
