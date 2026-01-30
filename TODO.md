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

## Advanced Features (Future Implementation)

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

### User Management Features

- ✅ **Admin status toggle filter** - Added admin filter to UserFilters component
- ✅ **Items per page selector for pagination** - Enhanced UserPagination component
- ✅ **Delete user functionality** - Fully integrated with backend

### Testing Infrastructure

- ✅ **Unit testing infrastructure** - Jest + React Testing Library configured
- ✅ **E2E test coverage** - 55 E2E tests + 57 unit tests passing
- ✅ **API client test coverage** - Comprehensive test coverage for all API functions

## Notes

- **Backend coordination**: Lesson creation and code scene management require backend team involvement
- **Testing**: All new features need comprehensive unit and E2E test coverage
