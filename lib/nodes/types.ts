/**
 * Type-Safe Node Discriminated Unions
 *
 * These types represent the domain model for pipeline nodes.
 * These types use the admin codebase's comprehensive video pipeline types.
 */

import type {
  NodeStatus,
  NodeMetadata,
  NodeOutput,
  NodeAsset,
  NodeInputs,
  NodeConfig,
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
 * Node types that match the admin's comprehensive video pipeline types
 * These are direct aliases to maintain compatibility with the video production editor
 */
export type AssetNode = AdminAssetNode;
export type GenerateTalkingHeadNode = AdminGenerateTalkingHeadNode;
export type GenerateAnimationNode = AdminGenerateAnimationNode;
export type GenerateVoiceoverNode = AdminGenerateVoiceoverNode;
export type RenderCodeNode = AdminRenderCodeNode;
export type MixAudioNode = AdminMixAudioNode;
export type MergeVideosNode = AdminMergeVideosNode;
export type ComposeVideoNode = AdminComposeVideoNode;

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
