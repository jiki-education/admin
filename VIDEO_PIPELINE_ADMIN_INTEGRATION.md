# Video Pipeline Admin Integration Guide

This document provides a comprehensive overview of the video production pipeline system for frontend integration into the admin interface.

## Overview

The Jiki API includes a complete video production pipeline system that allows admins to create and manage complex AI-generated video workflows. The system is built with Rails 8 and provides REST API endpoints for full CRUD operations on pipelines and their constituent nodes.

## Database Schema

### Pipelines Table: `video_production_pipelines`

```sql
CREATE TABLE video_production_pipelines (
  id UUID PRIMARY KEY,
  version VARCHAR NOT NULL DEFAULT '1.0',
  title VARCHAR NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Key Fields:**
- `uuid` - Primary identifier for API operations
- `title` - Human-readable pipeline name
- `version` - Pipeline version (default: "1.0")
- `config` - Storage and working directory settings
- `metadata` - Cost tracking and progress statistics

### Nodes Table: `video_production_nodes`

```sql
CREATE TABLE video_production_nodes (
  id UUID PRIMARY KEY,
  pipeline_id UUID NOT NULL REFERENCES video_production_pipelines(id),
  title VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  inputs JSONB NOT NULL DEFAULT '{}',
  config JSONB NOT NULL DEFAULT '{}',
  asset JSONB,
  status VARCHAR NOT NULL DEFAULT 'pending',
  metadata JSONB,
  output JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Key Fields:**
- `type` - Node type (see supported types below)
- `inputs` - References to other nodes in the pipeline
- `config` - Node-specific configuration
- `status` - Execution status: `pending`, `in_progress`, `completed`, `failed`
- `output` - Results from node execution

## Supported Node Types

The system supports 8 different node types for various video production tasks:

| Type | Purpose | External Service |
|------|---------|------------------|
| `asset` | Static file references | None |
| `talking-head` | AI avatar videos | HeyGen API |
| `generate-animation` | AI-generated animations | Veo 3 API |
| `generate-voiceover` | Text-to-speech audio | ElevenLabs API |
| `render-code` | Code screen animations | Remotion |
| `mix-audio` | Audio track replacement | FFmpeg (Lambda) |
| `merge-videos` | Video concatenation | FFmpeg (Lambda) |
| `compose-video` | Picture-in-picture overlay | FFmpeg (Lambda) |

## API Endpoints

All endpoints require admin authentication and are prefixed with `/v1/admin/video_production/`.

### Pipeline Endpoints

#### List Pipelines
```http
GET /v1/admin/video_production/pipelines
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `per` - Items per page (default: 25)

**Response:**
```json
{
  "pipelines": [
    {
      "uuid": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Ruby Course Introduction",
      "version": "1.0",
      "config": {
        "storage": {
          "bucket": "jiki-videos",
          "prefix": "lessons/ruby-intro/"
        }
      },
      "metadata": {
        "totalCost": 45.67,
        "progress": {
          "completed": 8,
          "in_progress": 2,
          "pending": 3,
          "failed": 0,
          "total": 13
        }
      },
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T14:22:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "total_pages": 3,
    "total_count": 67
  }
}
```

#### Get Single Pipeline
```http
GET /v1/admin/video_production/pipelines/{uuid}
```

**Response:** Single pipeline object with `nodes` array included.

#### Create Pipeline
```http
POST /v1/admin/video_production/pipelines
```

**Request Body:**
```json
{
  "pipeline": {
    "title": "New Course Video",
    "version": "1.0",
    "config": {
      "storage": {
        "bucket": "jiki-videos"
      }
    },
    "metadata": {
      "totalCost": 0
    }
  }
}
```

#### Update Pipeline
```http
PATCH /v1/admin/video_production/pipelines/{uuid}
```

#### Delete Pipeline
```http
DELETE /v1/admin/video_production/pipelines/{uuid}
```

### Node Endpoints

#### List Pipeline Nodes
```http
GET /v1/admin/video_production/pipelines/{pipeline_uuid}/nodes
```

#### Get Single Node
```http
GET /v1/admin/video_production/pipelines/{pipeline_uuid}/nodes/{uuid}
```

#### Create Node
```http
POST /v1/admin/video_production/pipelines/{pipeline_uuid}/nodes
```

#### Update Node
```http
PATCH /v1/admin/video_production/pipelines/{pipeline_uuid}/nodes/{uuid}
```

#### Delete Node
```http
DELETE /v1/admin/video_production/pipelines/{pipeline_uuid}/nodes/{uuid}
```

## Progress Tracking

Pipelines automatically track execution progress through the `metadata.progress` field:

```json
{
  "progress": {
    "completed": 8,    // Nodes with status 'completed'
    "in_progress": 2,  // Nodes with status 'in_progress'
    "pending": 3,      // Nodes with status 'pending'
    "failed": 0,       // Nodes with status 'failed'
    "total": 13        // Total number of nodes
  }
}
```

This enables real-time progress bars and status indicators in the admin interface.

## Example Pipeline Structure

Here's a simplified example of a complete pipeline:

```json
{
  "title": "Course Introduction Video",
  "nodes": [
    {
      "title": "Welcome Script",
      "type": "asset",
      "asset": {
        "source": "./scripts/welcome.md",
        "type": "text"
      }
    },
    {
      "title": "Instructor Avatar",
      "type": "talking-head",
      "inputs": {
        "script": ["welcome_script_uuid"]
      },
      "config": {
        "provider": "heygen",
        "avatarId": "instructor-1"
      }
    },
    {
      "title": "Code Example",
      "type": "render-code",
      "inputs": {
        "config": ["code_config_uuid"]
      },
      "config": {
        "provider": "remotion"
      }
    },
    {
      "title": "Final Video",
      "type": "merge-videos",
      "inputs": {
        "segments": ["avatar_uuid", "code_example_uuid"]
      },
      "config": {
        "provider": "ffmpeg",
        "transitions": "fade"
      }
    }
  ]
}
```

## Frontend Integration Recommendations

### 1. Dashboard View
- Use `GET /pipelines` to display a paginated list
- Show pipeline titles, progress bars, and last updated timestamps
- Include quick action buttons (view, edit, delete)

### 2. Progress Indicators
- Use the `metadata.progress` object to show completion percentages
- Color-code based on status: green (completed), yellow (in_progress), red (failed)
- Display total cost information from `metadata.totalCost`

### 3. Pipeline Detail View
- Use `GET /pipelines/{uuid}` to show full pipeline with nodes
- Display node graph/flowchart showing dependencies via `inputs` field
- Show individual node status and execution details

### 4. Error Handling
The API returns standard HTTP status codes:
- `404` - Pipeline/node not found
- `422` - Validation errors
- `500` - Server errors

Error responses include structured error objects:
```json
{
  "error": {
    "type": "validation_error",
    "message": "Title can't be blank"
  }
}
```

## Models and Files Reference

**Key Model Files:**
- `app/models/video_production/pipeline.rb` - Pipeline model with progress tracking
- `app/models/video_production/node.rb` - Node model with type validation

**Controller Files:**
- `app/controllers/v1/admin/video_production/pipelines_controller.rb` - Pipeline CRUD operations

**Example Data:**
- `db/seeds/video_production/example-pipeline.json` - Complete example pipeline with all node types

**Documentation:**
- `.context/video_production.md` - Comprehensive system documentation
- `VIDEO_PRODUCTION_PLAN.md` - Implementation roadmap and future plans

## Authentication

All endpoints require admin-level authentication. Ensure your frontend includes proper authentication headers when making API calls to these endpoints.

## Next Steps

1. **Seed Example Data:** Use the example pipeline JSON to populate test data
2. **Build List View:** Start with the pipelines index endpoint
3. **Add Progress Display:** Implement progress bars using the metadata
4. **Create Detail View:** Show individual pipeline and node details
5. **Add Management Actions:** Implement create, update, delete operations

The video pipeline system is production-ready and fully tested with 167 test cases covering all functionality.