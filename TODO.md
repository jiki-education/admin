# TODO - Jiki Admin Dashboard

## Immediate Tasks (Ready for Implementation)

### Email Templates Testing

- [ ] **E2E tests for tab functionality** (from EMAIL_TEMPLATES_SUMMARY_PLAN.md)
- [ ] **API integration tests** (from EMAIL_TEMPLATES_SUMMARY_PLAN.md)

### Backend Integration - Phase 2

- [x] **Implement lesson creation endpoint** ✅ **COMPLETED**
  - ✅ Backend endpoint exists: `POST /v1/admin/levels/:level_id/lessons`
  - ✅ Frontend integration completed with `createLesson` API function
  - ✅ Lesson creation form and flow fully functional
  - ✅ Unit tests and E2E tests passing

### Video Pipeline Editor Migration

- [ ] **Install required dependencies**
  ```bash
  pnpm add @xyflow/react dagre @dnd-kit/core @dnd-kit/modifiers @dnd-kit/sortable @dnd-kit/utilities
  pnpm add -D @types/dagre
  ```
- [ ] **Copy pipeline editor from ../video-production**
  - Create `app/video-pipelines/[uuid]/components/` directory structure
  - Copy all React Flow editor components
  - Copy all 8 node types and shared components
  - Copy supporting libraries (layout.ts, nodes/)
- [ ] **Implement missing API functions in lib/api/video-pipelines.ts**
  - `getNodes(pipelineUuid)` - List nodes for a pipeline
  - `getNode(pipelineUuid, nodeUuid)` - Get single node details
  - `createNode(pipelineUuid, nodeData)` - Create new node in pipeline
  - `updateNode(pipelineUuid, nodeUuid, updates)` - Update node configuration
  - `deleteNode(pipelineUuid, nodeUuid)` - Delete a node from pipeline
  - `connectNodes()` - Connect two nodes by updating inputs
  - `reorderNodeInputs()` - Reorder inputs array
- [ ] **Update all import paths and type definitions**
  - Replace video-production types with admin types
  - Update API client integration
  - Ensure proper route parameters (id -> uuid)
- [ ] **Test complete pipeline editor integration**
  - Verify all node types render correctly
  - Test node connections and deletions
  - Verify API interactions work properly

## Advanced Features (Future Implementation)

### Video Pipeline Enhancements

- [ ] **Edit pipeline functionality**
- [ ] **Advanced filtering/search for pipelines**
- [ ] **Visual pipeline node editor improvements**
- [ ] **Real-time progress updates**
- [ ] **Pipeline duplication**
- [ ] **Bulk operations**

### Remotion Code Editor Integration

- [ ] **Phase 1: Core Remotion Integration (3-4 days)**
  - Add Remotion dependencies (@remotion/bundler, @remotion/cli, etc.)
  - Create Remotion infrastructure (lib/remotion/, components/remotion/)
  - Migrate AnimatedCode.tsx and CodeScene.tsx from video-production
  - Create scene management API client
- [ ] **Phase 2: Code Editor UI (2-3 days)**
  - Create scene management pages (list, new, edit, preview)
  - Build editor components (SceneEditor, ActionEditor, CodePreview)
  - Integrate Remotion Studio for development
- [ ] **Phase 3: Advanced Features (2-3 days)**
  - Embed Remotion Player in admin UI
  - Implement render management and progress tracking
  - Create scene library with templates
- [ ] **Phase 4: Pipeline Integration (1-2 days)**
  - Add "Generate Code Screen" node type to pipeline editor
  - Integrate rendered code screens as pipeline assets

### User Management Enhancements

- [ ] User detail view (`/dashboard/users/[id]/page.tsx`)
- [ ] User status change modal
- [ ] Bulk operations (status changes, export)

### Level Management Enhancements

- [ ] Drag & drop lesson reordering
- [ ] Bulk lesson operations
- [ ] Advanced search & filtering by lesson type
- [ ] Performance optimizations for large lesson lists

### Email Templates

- [ ] Syntax highlighting for MJML editor (optional)
- [ ] Template preview with sample data
- [ ] Template versioning system
- [ ] Email template testing (send test emails)

### Testing Infrastructure Improvements

- [ ] Authentication flow tests (signin/signup) with actual auth
- [ ] Form interaction tests with authenticated sessions
- [ ] Component testing utilities for complex UI components
- [ ] Test coverage reporting integration
- [ ] Visual regression testing with Playwright
- [ ] Performance testing with Lighthouse CI
- [ ] Accessibility testing with axe-core

## Backend Dependencies

### Ready to Implement (Backend Available)

- ✅ **User Deletion** - Backend ready, frontend implemented
- ✅ **Level Creation** - Backend ready, frontend implemented
- ✅ **Lesson Creation** - Backend ready, frontend implemented

### Blocked (Waiting for Backend)

- ❌ **Code Scene Management** - Backend missing scene storage endpoints:
  - `GET /api/code-scenes` - List scenes
  - `POST /api/code-scenes` - Create scene
  - `GET /api/code-scenes/:id` - Get scene
  - `PUT /api/code-scenes/:id` - Update scene
  - `DELETE /api/code-scenes/:id` - Delete scene
  - `POST /api/code-scenes/:id/render` - Trigger render

## Completed Features ✅

### Email Templates

- ✅ **Tab infrastructure** - TabNavigation component with Templates/Summary tabs
- ✅ **Summary API integration** - getEmailTemplatesSummary() with proper error handling
- ✅ **Summary view components** - SummaryTable, LocaleStatusBadge, filtering
- ✅ **Responsive design** - Mobile-first with Tailwind
- ✅ **Type safety** - Complete TypeScript integration

### Backend Integration - Phase 1

- ✅ **User deletion integration** - DELETE /v1/admin/users/:id fully integrated
- ✅ **Level creation integration** - POST /v1/admin/levels fully integrated

### Video Pipeline Dashboard

- ✅ **API client layer** - Complete TypeScript client with all CRUD operations
- ✅ **Navigation integration** - Added to AppSidebar under Content section
- ✅ **Core pages** - List, detail, and create pages implemented
- ✅ **Table component** - PipelineTable with actions, pagination, progress bars
- ✅ **Testing** - Both unit tests (API client) and E2E tests (full workflow)

### User Management Features

- ✅ **Admin status toggle filter** - Added admin filter to UserFilters component
- ✅ **Items per page selector for pagination** - Enhanced UserPagination component
- ✅ **Delete user functionality** - Fully integrated with backend

### Testing Infrastructure

- ✅ **Unit testing infrastructure** - Jest + React Testing Library configured
- ✅ **E2E test coverage** - 55 E2E tests + 57 unit tests passing
- ✅ **API client test coverage** - Comprehensive test coverage for all API functions

## Notes

- **Priority**: Focus on video pipeline editor migration as it's the most complex remaining task
- **Backend coordination**: Lesson creation and code scene management require backend team involvement
- **Testing**: All new features need comprehensive unit and E2E test coverage
- **Video Pipeline Backend**: Comprehensive backend system is ready with 8 node types and full CRUD API (see VIDEO_PIPELINE_ADMIN_INTEGRATION.md for complete API documentation)
