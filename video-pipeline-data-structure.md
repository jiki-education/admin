# Video Pipeline Data Structure Documentation

## Overview

The Jiki Video Production Pipeline is a comprehensive system for orchestrating AI-generated video content through a visual pipeline editor. This document outlines the complete data structure for pipelines, nodes, and all their components.

## Architecture Components

```
┌─────────────────────────────────────────────────┐
│          Next.js Visual Editor                  │
│     (code-videos repo - UI only)                │
│  • React Flow pipeline designer                 │
│  • Read-only database access                    │
│  • Calls Rails API for execution                │
└─────────────────┬───────────────────────────────┘
                  │
                  │ POST /v1/admin/video_production/.../nodes
                  │ GET  /v1/admin/video_production/...
                  ↓
┌─────────────────────────────────────────────────┐
│           Rails API (this repo)                 │
│  • CRUD operations for pipelines/nodes          │
│  • Input validation                             │
│  • Database writes (status, metadata, output)   │
│  • Sidekiq executors & polling jobs             │
└─────────────────┬───────────────────────────────┘
                  │
         ┌────────┼────────┬────────┬──────────┐
         ↓        ↓        ↓        ↓          ↓
    ┌────────┐ ┌─────┐ ┌──────┐ ┌────────┐ ┌────┐
    │ Lambda │ │HeyGen│ │ Veo3 │ │Eleven  │ │ S3 │
    │(FFmpeg)│ │ API  │ │ API  │ │Labs API│ │    │
    └────────┘ └─────┘ └──────┘ └────────┘ └────┘
```

## Database Schema

### Pipeline Structure

**Table:** `video_production_pipelines`

```typescript
interface VideoProductionPipeline {
  id: string;           // UUID primary key
  version: string;      // Pipeline version (default: "1.0")
  title: string;        // Human-readable pipeline title
  config: {             // JSONB - Pipeline configuration
    storage?: {
      bucket: string;        // S3 bucket name
      prefix: string;        // S3 key prefix for outputs
    };
    workingDirectory?: string; // Local working directory path
  };
  metadata: {           // JSONB - Progress and cost tracking
    totalCost?: number;        // Actual total cost incurred
    estimatedTotalCost?: number; // Estimated cost for entire pipeline
    progress?: {               // Node progress summary
      pending: number;
      inProgress: number;
      completed: number;
      failed: number;
    };
  };
  createdAt: string;    // ISO8601 timestamp
  updatedAt: string;    // ISO8601 timestamp
}
```

### Node Structure

**Table:** `video_production_nodes`

```typescript
interface VideoProductionNode {
  id: string;           // UUID primary key
  pipelineId: string;   // Foreign key to pipeline
  title: string;        // Human-readable node title
  
  // Structure (Next.js writes these fields)
  type: NodeType;       // Node type (see NodeType enum below)
  inputs: NodeInputs;   // JSONB - Input slot definitions
  config: NodeConfig;   // JSONB - Node configuration
  asset?: NodeAsset;    // JSONB - Asset data for asset nodes
  
  // Execution state (Rails writes these fields)
  status: NodeStatus;   // Execution status
  metadata?: NodeMetadata; // JSONB - Process tracking and external API data
  output?: NodeOutput;  // JSONB - Execution results
  
  // Validation state (Rails writes these fields)
  isValid: boolean;     // Whether node passes validation
  validationErrors: ValidationErrors; // JSONB - Validation error details
  
  createdAt: string;    // ISO8601 timestamp
  updatedAt: string;    // ISO8601 timestamp
}
```

## Node Types and Schemas

```typescript
type NodeType = 
  | "asset"                  // Static file references
  | "generate-talking-head"  // HeyGen talking head videos
  | "generate-animation"     // Veo 3 / Runway animations
  | "generate-voiceover"     // ElevenLabs text-to-speech
  | "render-code"           // Remotion code screen animations
  | "mix-audio"             // FFmpeg audio replacement
  | "merge-videos"          // FFmpeg video concatenation
  | "compose-video";        // FFmpeg picture-in-picture overlays
```

```typescript
type NodeStatus = "pending" | "in_progress" | "completed" | "failed";
```

### Input Types and Structure

```typescript
interface NodeInputs {
  [slotName: string]: NodeInputSlot;
}

interface NodeInputSlot {
  type: "single" | "multiple";
  required: boolean;
  description: string;
  minCount?: number;    // For multiple inputs
  maxCount?: number;    // For multiple inputs (null = unlimited)
}

// Example input values in node data:
interface NodeInputValues {
  [slotName: string]: string | string[]; // UUID references to other nodes
}
```

### Configuration Structure

```typescript
interface NodeConfig {
  provider?: "heygen" | "elevenlabs" | "veo3" | "remotion" | "ffmpeg";
  [key: string]: any; // Additional provider-specific config
}
```

### Asset Data Structure

```typescript
interface NodeAsset {
  type: "text" | "image" | "audio" | "video" | "json";
  content?: string | object;  // Inline content for text/json assets
  source?: string;            // S3 URI or external URL for media assets
}
```

### Metadata Structure

```typescript
interface NodeMetadata {
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
```

### Output Structure

```typescript
interface NodeOutput {
  s3Key?: string;          // S3 object key for output file
  duration?: number;       // Duration in seconds (for audio/video)
  size?: number;           // File size in bytes
  width?: number;          // Video width in pixels
  height?: number;         // Video height in pixels
  format?: string;         // File format (mp4, mp3, etc.)
  url?: string;            // Temporary or permanent URL to output
}
```

### Validation Errors Structure

```typescript
interface ValidationErrors {
  inputs?: {
    [slotName: string]: string[]; // Array of error messages per input slot
  };
  config?: {
    [fieldName: string]: string[]; // Array of error messages per config field
  };
}
```

## Detailed Node Type Schemas

### Asset Node

```typescript
interface AssetNode extends VideoProductionNode {
  type: "asset";
  inputs: {}; // Asset nodes have no inputs
  config: {};
  asset: NodeAsset; // Required for asset nodes
}
```

### Generate Voiceover Node

```typescript
interface GenerateVoiceoverNode extends VideoProductionNode {
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
```

### Generate Talking Head Node

```typescript
interface GenerateTalkingHeadNode extends VideoProductionNode {
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
```

### Generate Animation Node

```typescript
interface GenerateAnimationNode extends VideoProductionNode {
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
```

### Render Code Node

```typescript
interface RenderCodeNode extends VideoProductionNode {
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

// Code config asset structure:
interface CodeConfig {
  language: string;     // Programming language
  theme: string;        // Syntax highlighting theme
  title?: string;       // Code block title
  code: string;         // Source code content
  highlights?: Array<{
    line: number;       // Line number to highlight
    description: string; // Explanation of the highlighted line
  }>;
}
```

### Mix Audio Node

```typescript
interface MixAudioNode extends VideoProductionNode {
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
```

### Merge Videos Node

```typescript
interface MergeVideosNode extends VideoProductionNode {
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
```

### Compose Video Node

```typescript
interface ComposeVideoNode extends VideoProductionNode {
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
```

## API Endpoints

### Pipeline Endpoints

```
GET    /v1/admin/video_production/pipelines           # List pipelines (paginated)
GET    /v1/admin/video_production/pipelines/:uuid     # Get pipeline details
POST   /v1/admin/video_production/pipelines           # Create pipeline
PATCH  /v1/admin/video_production/pipelines/:uuid     # Update pipeline
DELETE /v1/admin/video_production/pipelines/:uuid     # Delete pipeline
```

### Node Endpoints (Nested under pipelines)

```
GET    /v1/admin/video_production/pipelines/:pipeline_uuid/nodes           # List nodes
GET    /v1/admin/video_production/pipelines/:pipeline_uuid/nodes/:uuid     # Get node
POST   /v1/admin/video_production/pipelines/:pipeline_uuid/nodes           # Create node
PATCH  /v1/admin/video_production/pipelines/:pipeline_uuid/nodes/:uuid     # Update node
DELETE /v1/admin/video_production/pipelines/:pipeline_uuid/nodes/:uuid     # Delete node
```

## Execution Flow

### 1. Node Lifecycle States

```
pending → in_progress → completed/failed
```

### 2. Execution Protection

- **Process UUID**: Each execution gets a unique `processUuid` to prevent race conditions
- **Database Locks**: All execution commands use `with_lock` for atomicity
- **Status Verification**: Commands verify node is still in correct state before proceeding

### 3. External API Pattern

1. **Generate** command submits job to external API
2. **CheckForResult** polling job checks status every 10 seconds (max 60 attempts)
3. **ProcessResult** downloads output and uploads to S3

### 4. Lambda Integration

- Synchronous invocation for FFmpeg operations
- Video merger Lambda handles concatenation with Node.js 20 runtime

## Example Pipeline Structure

Here's a complete example showing a typical educational video pipeline:

```json
{
  "uuid": "tutorial-pipeline-uuid",
  "title": "JavaScript Animation Tutorial",
  "version": "1.0",
  "config": {
    "storage": {
      "bucket": "jiki-videos",
      "prefix": "lessons/javascript-animation/"
    },
    "workingDirectory": "./output/js-animation"
  },
  "nodes": [
    {
      "uuid": "script-asset-uuid",
      "title": "Introduction Script",
      "type": "asset",
      "inputs": {},
      "config": {},
      "asset": {
        "type": "text",
        "content": "Welcome to JavaScript Animation! Today we'll learn..."
      }
    },
    {
      "uuid": "voiceover-uuid",
      "title": "Introduction Voiceover",
      "type": "generate-voiceover",
      "inputs": {
        "script": "script-asset-uuid"
      },
      "config": {
        "provider": "elevenlabs"
      }
    },
    {
      "uuid": "background-asset-uuid",
      "title": "Code Editor Background",
      "type": "asset",
      "inputs": {},
      "config": {},
      "asset": {
        "type": "image",
        "source": "s3://jiki-videos/backgrounds/code-editor-dark.jpg"
      }
    },
    {
      "uuid": "talking-head-uuid",
      "title": "JavaScript Instructor",
      "type": "generate-talking-head",
      "inputs": {
        "audio": "voiceover-uuid",
        "background": "background-asset-uuid"
      },
      "config": {
        "provider": "heygen",
        "avatarId": "instructor-tech-casual",
        "width": 1920,
        "height": 1080
      }
    },
    {
      "uuid": "code-config-uuid",
      "title": "Animation Code Config",
      "type": "asset",
      "inputs": {},
      "config": {},
      "asset": {
        "type": "json",
        "content": {
          "language": "javascript",
          "theme": "dark",
          "code": "const element = document.querySelector('.box');\nelement.style.transform = 'translateX(100px)';",
          "highlights": [
            { "line": 2, "description": "Transform to move element" }
          ]
        }
      }
    },
    {
      "uuid": "code-render-uuid",
      "title": "Code Animation Render",
      "type": "render-code",
      "inputs": {
        "config": "code-config-uuid"
      },
      "config": {
        "provider": "remotion"
      }
    },
    {
      "uuid": "final-video-uuid",
      "title": "Complete Tutorial",
      "type": "merge-videos",
      "inputs": {
        "segments": [
          "talking-head-uuid",
          "code-render-uuid"
        ]
      },
      "config": {
        "provider": "ffmpeg"
      }
    }
  ]
}
```

## Key Features

### Input Dependencies
- Nodes can reference other nodes as inputs using UUIDs
- Input validation ensures referenced nodes exist and are completed
- Single inputs accept one node reference, multiple inputs accept arrays

### Automatic Validation
- Schema validation runs on node create/update
- Validates input slots and configuration fields
- Results stored in `isValid` and `validationErrors` columns

### Race Condition Protection
- Process UUID system prevents concurrent execution conflicts
- Database locks ensure atomic operations
- Stale jobs silently exit on UUID mismatch

### Column Ownership
- **Next.js writes**: `type`, `inputs`, `config`, `asset`, `title`
- **Rails writes**: `status`, `metadata`, `output`, `isValid`, `validationErrors`

This structure enables complex video production workflows while maintaining data integrity and preventing conflicts between the visual editor and execution system.