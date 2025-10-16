# Admin Dashboard TODO

## Backend Endpoints

### User Management
- [ ] **DELETE /v1/admin/users/:id** (High Priority)
  - Delete user functionality (frontend complete, backend missing)
  - Requires: authorization, data cleanup, audit logging
  - File: `lib/api/users.ts` needs `deleteUser` function
  - Current placeholder: `app/dashboard/users/page.tsx:99-105`

### Level and Lesson Management
- [ ] **POST /v1/admin/levels** (High Priority)
  - Create new level functionality (frontend complete, backend missing)
  - Expected request: `{ level: { title, slug, description } }`
  - Expected response: `{ level: AdminLevel }`
  - Auto-position assignment handled by Level model

- [ ] **POST /v1/admin/levels/:levelId/lessons** (High Priority)
  - Create new lesson functionality (frontend complete, backend missing)
  - Expected request: `{ lesson: { title, slug, description, type, data } }`
  - Expected response: `{ lesson: AdminLesson }`
  - Auto-position assignment handled by Lesson model

## Testing

### E2E Test Coverage Expansion
- [ ] Authentication flow tests (signin/signup)
- [ ] Dashboard navigation tests
- [ ] User management E2E tests
- [ ] Level management E2E tests
- [ ] Email template E2E tests
- [ ] Form interaction tests

### Unit Testing Setup
- [ ] Setup Vitest + React Testing Library
- [ ] Component testing utilities
- [ ] Mock implementations (router, stores, API)
- [ ] Test coverage reporting

## User Management Enhancements
- [ ] Admin status toggle filter
- [ ] Items per page selector for pagination
- [ ] User detail view (`/dashboard/users/[id]/page.tsx`)
- [ ] User status change modal
- [ ] Bulk operations (status changes, export)

## Level Management Enhancements
- [ ] Drag & drop lesson reordering
- [ ] Bulk lesson operations
- [ ] Advanced search & filtering by lesson type
- [ ] Performance optimizations for large lesson lists

## Email Templates
- [ ] Syntax highlighting for MJML editor (optional)
- [ ] Template preview with sample data
- [ ] Template versioning system
- [ ] Email template testing (send test emails)

## Testing Infrastructure Improvements
- [ ] Visual regression testing with Playwright
- [ ] Performance testing with Lighthouse CI
- [ ] Accessibility testing with axe-core

## Documentation
- [ ] Update CLAUDE.md with new features
- [ ] API documentation for new endpoints
- [ ] Testing best practices guide

## Priority Notes

**Immediate (Required for basic functionality):**
1. Backend endpoints for level/lesson creation
2. User deletion endpoint
3. Basic E2E test coverage

**Short term (Enhance UX):**
4. Unit testing setup
5. User management enhancements
6. Extended E2E coverage

**Long term (Polish):**
7. Advanced features and optimizations
8. Comprehensive testing suite
9. Performance and accessibility improvements