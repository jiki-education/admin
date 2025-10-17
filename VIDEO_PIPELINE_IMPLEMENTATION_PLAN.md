# Video Pipeline Admin Dashboard Implementation Plan

## Overview
Implementation plan for adding video production pipeline management to the Jiki Admin dashboard. This will provide a complete CRUD interface for managing AI-generated video workflows.

## Phase 1: Foundation Setup

### 1.1 API Client Layer
- [x] **File**: `lib/api/video-pipelines.ts`
- [x] **Purpose**: TypeScript API client for all pipeline endpoints
- [x] **Key Functions**:
  - [x] `getPipelines()` - List with pagination/filtering
  - [x] `getPipeline(uuid)` - Single pipeline with nodes
  - [x] `createPipeline()` - Create new pipeline
  - [x] `updatePipeline()` - Update existing pipeline
  - [x] `deletePipeline()` - Delete pipeline
- [x] **Types**: Pipeline, Node, PipelineProgress, PipelineMetadata interfaces

### 1.2 Navigation Integration
- [x] **File**: `layout/AppSidebar.tsx`
- [x] **Changes**: Add "Video Production" section to navigation
- [x] **Structure**: 
  ```
  Content
  ├── Levels
  └── Video Pipelines (new)
  ```

## Phase 2: Core Pages

### 2.1 Pipelines List Page
- [x] **File**: `app/dashboard/video-pipelines/page.tsx`
- [x] **Features**:
  - [x] Data table with columns: Title, Version, Progress Bar, Cost, Last Updated, Actions
  - [x] Pagination (25 items per page default)
  - [x] Loading states and error handling
  - [x] Delete confirmation modal
  - [x] "Create New Pipeline" button

### 2.2 Pipeline Detail/Editor Page
- [x] **File**: `app/dashboard/video-pipelines/[uuid]/page.tsx`
- [x] **Features**:
  - [x] Pipeline metadata display
  - [x] Progress tracking visualization
  - [x] Node listing (future: visual pipeline editor)
  - [x] Placeholder: "Pipeline Editor will be implemented here"

### 2.3 Create Pipeline Page
- [x] **File**: `app/dashboard/video-pipelines/new/page.tsx`
- [x] **Features**:
  - [x] Form: Title, Version, Storage Configuration
  - [x] Validation and error handling
  - [x] Redirect to detail page on success

## Phase 3: Components

### 3.1 Reusable Components
- [x] **PipelineTable**: Main data table with actions
- **PipelineFilters**: Search and filter controls (future)
- [x] **PipelinePagination**: Page navigation controls
- [x] **DeletePipelineModal**: Confirmation dialog
- **ProgressBar**: Visual progress indicator (integrated in table)
- **PipelineForm**: Create/edit form component (integrated in pages)

### 3.2 Type Definitions
- [x] **File**: `app/dashboard/video-pipelines/types/index.ts`
- [x] **Exports**: All pipeline-related TypeScript interfaces

## Phase 4: Testing

### 4.1 Unit Tests
- [x] **File**: `__tests__/lib/api/video-pipelines.test.ts`
- [x] **Coverage**: All API client functions (getPipelines, getPipeline, createPipeline, updatePipeline, deletePipeline)
- [x] **Patterns**: Follow existing `users.test.ts` patterns
- [x] **Test Coverage**: API request formatting, response handling, error handling, edge cases

### 4.2 E2E Tests
- [x] **File**: `tests/e2e/video-pipelines.test.ts`
- [x] **Scenarios**:
  - [x] Navigate to pipelines list
  - [x] Create new pipeline form
  - [x] View pipeline details with editor placeholder
  - [x] Table structure and pagination
  - [x] Navigation integration
  - [x] Authentication redirects

## Implementation Order

1. **API Client** (`lib/api/video-pipelines.ts`)
2. **Navigation** (Update `AppSidebar.tsx`)
3. **List Page** (`app/dashboard/video-pipelines/page.tsx`)
4. **Table Component** (`components/PipelineTable.tsx`)
5. **Detail Page** (`app/dashboard/video-pipelines/[uuid]/page.tsx`)
6. **Create Page** (`app/dashboard/video-pipelines/new/page.tsx`)
7. **Delete Modal** (`components/DeletePipelineModal.tsx`)
8. **Unit Tests** (API client coverage)
9. **E2E Tests** (Full workflow coverage)

## Key Features by Priority

### Must Have (MVP)
- ✅ List all pipelines with pagination
- ✅ View pipeline details
- ✅ Create new pipeline
- ✅ Delete pipeline with confirmation
- ✅ Progress bars showing completion status
- ✅ Cost tracking display

### Nice to Have (Future)
- 🔄 Edit pipeline functionality
- 🔄 Advanced filtering/search
- 🔄 Visual pipeline node editor
- 🔄 Real-time progress updates
- 🔄 Pipeline duplication
- 🔄 Bulk operations

## Technical Considerations

### Styling
- Follow existing TailAdmin patterns
- Use consistent spacing and colors
- Mobile-responsive design
- Dark mode support

### Error Handling
- Network error boundaries
- Validation error display
- Loading states for all async operations
- User-friendly error messages

### Performance
- Pagination for large datasets
- Lazy loading for detail views
- Optimistic updates where appropriate
- Efficient re-rendering with React patterns

## Backend Integration

### Endpoints Used
- `GET /v1/admin/video_production/pipelines` - List with pagination
- `GET /v1/admin/video_production/pipelines/:uuid` - Single pipeline + nodes
- `POST /v1/admin/video_production/pipelines` - Create pipeline
- `PATCH /v1/admin/video_production/pipelines/:uuid` - Update pipeline
- `DELETE /v1/admin/video_production/pipelines/:uuid` - Delete pipeline

### Authentication
- All endpoints require admin authentication
- Reuse existing auth patterns from users/levels

## File Structure
```
app/dashboard/video-pipelines/
├── page.tsx                    # List page
├── new/
│   └── page.tsx               # Create page
├── [uuid]/
│   └── page.tsx               # Detail/editor page
├── components/
│   ├── PipelineTable.tsx
│   ├── PipelineFilters.tsx
│   ├── PipelinePagination.tsx
│   ├── DeletePipelineModal.tsx
│   ├── ProgressBar.tsx
│   └── PipelineForm.tsx
└── types/
    └── index.ts               # Type definitions

lib/api/
└── video-pipelines.ts         # API client

tests/e2e/
└── video-pipelines.test.ts    # E2E tests

__tests__/lib/api/
└── video-pipelines.test.ts    # Unit tests
```

## Success Criteria
- ✅ Admin can view all pipelines in a paginated table
- ✅ Admin can see progress and cost for each pipeline
- ✅ Admin can create new pipelines with proper validation
- ✅ Admin can view detailed pipeline information
- ✅ Admin can delete pipelines with confirmation
- ✅ All functionality is tested (unit + E2E)
- ✅ UI follows existing admin dashboard patterns
- ✅ Mobile responsive and accessible