/**
 * Node Default Configuration Generator
 *
 * Provides sensible default configurations for each node type when creating new nodes.
 * Includes default titles, empty inputs, and provider-specific configurations.
 */

import type { NodeType, Node } from "./types";
import type { NodeAsset, NodeConfig } from "@/lib/api/video-pipelines";
import { getNodeInputConfig } from "./metadata";

/**
 * Generate a unique title for a new node
 */
export function generateNodeTitle(nodeType: NodeType, existingNodes: Node[]): string {
  const baseNames: Record<NodeType, string> = {
    asset: "Asset",
    "generate-talking-head": "Talking Head",
    "generate-animation": "Animation",
    "generate-voiceover": "Voiceover",
    "render-code": "Code Screen",
    "mix-audio": "Audio Mix",
    "merge-videos": "Video Merge",
    "compose-video": "Video Compose"
  };

  const baseName = baseNames[nodeType];

  // Find existing nodes of the same type
  const sameTypeNodes = existingNodes.filter((node) => node.type === nodeType);

  if (sameTypeNodes.length === 0) {
    return baseName;
  }

  // Find the highest number suffix
  let maxNumber = 0;
  const numberRegex = new RegExp(`^${baseName}(?: (\\d+))?$`);

  for (const node of sameTypeNodes) {
    const match = node.title.match(numberRegex);
    if (match) {
      const number = match[1] ? parseInt(match[1], 10) : 1;
      maxNumber = Math.max(maxNumber, number);
    }
  }

  return `${baseName} ${maxNumber + 1}`;
}

/**
 * Generate default inputs structure for a node type
 */
export function generateDefaultInputs(nodeType: NodeType): Record<string, unknown> {
  const inputConfig = getNodeInputConfig(nodeType);
  const inputs: Record<string, unknown> = {};

  for (const [inputKey, config] of Object.entries(inputConfig)) {
    // Initialize arrays for multi-connection inputs, empty strings for single connections
    if (config.maxConnections === -1 || config.maxConnections > 1) {
      inputs[inputKey] = [];
    } else {
      inputs[inputKey] = "";
    }
  }

  return inputs;
}

/**
 * Generate default configuration for each node type
 */
export function generateDefaultConfig(nodeType: NodeType): NodeConfig {
  switch (nodeType) {
    case "asset":
      return {};

    case "generate-talking-head":
      return {
        provider: "heygen",
        avatarId: "Monica_inSleeveless_20220819", // Default HeyGen avatar
        width: 1280,
        height: 720,
        test: true // Start with test mode
      };

    case "generate-animation":
      return {
        provider: "veo3",
        duration: 5,
        aspectRatio: "16:9",
        style: "cinematic"
      };

    case "generate-voiceover":
      return {
        provider: "elevenlabs",
        voiceId: "21m00Tcm4TlvDq8ikWAM", // Default ElevenLabs voice (Rachel)
        stability: 0.75,
        similarityBoost: 0.75,
        style: 0.0,
        useSpeakerBoost: true
      };

    case "render-code":
      return {
        provider: "remotion",
        sceneId: "CodeScene",
        duration: 10,
        width: 1920,
        height: 1080
      };

    case "mix-audio":
      return {
        provider: "ffmpeg",
        audioVolume: 1.0,
        fadeIn: 0.0,
        fadeOut: 0.0
      };

    case "merge-videos":
      return {
        provider: "ffmpeg",
        transition: "none",
        transitionDuration: 0.5
      };

    case "compose-video":
      return {
        provider: "ffmpeg",
        position: "bottom-right",
        opacity: 1.0,
        scale: 0.3,
        offsetX: 0,
        offsetY: 0
      };

    default:
      return {};
  }
}

/**
 * Generate default asset for asset nodes
 */
export function generateDefaultAsset(assetType: "text" | "image" | "audio" | "video" | "json"): NodeAsset {
  switch (assetType) {
    case "text":
      return {
        type: "text",
        content: "Enter your text content here..."
      };

    case "json":
      return {
        type: "json",
        content: {
          // Example structure for code config
          language: "javascript",
          theme: "vscode-dark",
          title: "Example Code",
          code: "console.log('Hello, World!');",
          highlights: []
        }
      };

    case "image":
      return {
        type: "image",
        source: "" // User will need to upload or provide URL
      };

    case "audio":
      return {
        type: "audio",
        source: "" // User will need to upload or provide URL
      };

    case "video":
      return {
        type: "video",
        source: "" // User will need to upload or provide URL
      };

    default:
      return {
        type: "text",
        content: ""
      };
  }
}

/**
 * Generate complete default node configuration
 */
export function generateDefaultNodeConfig(
  nodeType: NodeType,
  existingNodes: Node[],
  assetType?: "text" | "image" | "audio" | "video" | "json"
): {
  title: string;
  inputs: Record<string, unknown>;
  config: NodeConfig;
  asset?: NodeAsset;
} {
  const title = generateNodeTitle(nodeType, existingNodes);
  const inputs = generateDefaultInputs(nodeType);
  const config = generateDefaultConfig(nodeType);

  // Only asset nodes have asset data
  const asset = nodeType === "asset" && assetType ? generateDefaultAsset(assetType) : undefined;

  return {
    title,
    inputs,
    config,
    asset
  };
}

/**
 * Node type descriptions for UI
 */
export const NODE_TYPE_DESCRIPTIONS: Record<NodeType, string> = {
  asset: "Static files (text, images, audio, video) used as inputs for other nodes",
  "generate-talking-head": "Generate AI talking head videos from audio using HeyGen",
  "generate-animation": "Create AI-generated animations from text prompts using Veo 3",
  "generate-voiceover": "Convert text to speech using ElevenLabs AI voices",
  "render-code": "Create animated code screens with syntax highlighting using Remotion",
  "mix-audio": "Replace or mix audio tracks in videos using FFmpeg",
  "merge-videos": "Concatenate multiple video segments into one video using FFmpeg",
  "compose-video": "Overlay videos with picture-in-picture effects using FFmpeg"
};

/**
 * Node type categories for organization
 */
export const NODE_CATEGORIES: Record<string, NodeType[]> = {
  "Content Generation": ["generate-talking-head", "generate-animation", "generate-voiceover", "render-code"],
  "Media Processing": ["mix-audio", "merge-videos", "compose-video"],
  Assets: ["asset"]
};

/**
 * Get category for a node type
 */
export function getNodeCategory(nodeType: NodeType): string {
  for (const [category, types] of Object.entries(NODE_CATEGORIES)) {
    if (types.includes(nodeType)) {
      return category;
    }
  }
  return "Other";
}

/**
 * Get all node types in a category
 */
export function getNodeTypesInCategory(category: string): NodeType[] {
  return NODE_CATEGORIES[category] || [];
}

/**
 * Check if a node type requires immediate configuration
 */
export function requiresImmediateConfiguration(nodeType: NodeType): boolean {
  // Asset nodes need to specify what type of asset they are
  // Some nodes may benefit from immediate configuration
  switch (nodeType) {
    case "asset":
      return true; // Need to specify asset type and content

    case "generate-voiceover":
      return false; // Can use default voice

    case "generate-talking-head":
      return false; // Can use default avatar

    case "render-code":
      return true; // Need to configure code content

    default:
      return false;
  }
}

/**
 * Get configuration hints for a node type
 */
export function getConfigurationHints(nodeType: NodeType): string[] {
  const hints: Record<NodeType, string[]> = {
    asset: ["Choose the type of asset (text, image, audio, video, JSON)", "Provide content or upload a file"],
    "generate-talking-head": [
      "Select an avatar from HeyGen's library",
      "Connect an audio input or generate voiceover first",
      "Adjust video dimensions if needed"
    ],
    "generate-animation": [
      "Write a detailed animation prompt",
      "Optionally provide a reference image",
      "Set duration and aspect ratio"
    ],
    "generate-voiceover": [
      "Connect a text asset with your script",
      "Choose from ElevenLabs voices",
      "Adjust voice settings for desired tone"
    ],
    "render-code": [
      "Create a JSON asset with code configuration",
      "Choose programming language and theme",
      "Add highlights for important lines"
    ],
    "mix-audio": [
      "Connect a video and audio input",
      "Adjust audio volume and fade settings",
      "Preview to ensure audio sync"
    ],
    "merge-videos": [
      "Connect multiple video inputs in desired order",
      "Choose transition type between segments",
      "Order matters - drag to reorder"
    ],
    "compose-video": [
      "Connect background and overlay videos",
      "Position the overlay (PiP effect)",
      "Adjust opacity and scale as needed"
    ]
  };

  return hints[nodeType] || [];
}
