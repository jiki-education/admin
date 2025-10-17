# Admin Dashboard TODO

## Backend Endpoints

### User Management
- [x] **DELETE /v1/admin/users/:id** ✅ **COMPLETED**
  - ✅ Backend implemented via PR #48
  - ✅ Frontend integration completed (Phase 1)
  - ✅ Added `deleteUser` function in `lib/api/users.ts`
  - ✅ Removed placeholder from `app/dashboard/users/page.tsx`
  - ✅ Added comprehensive unit tests

### Level and Lesson Management
- [x] **POST /v1/admin/levels** ✅ **COMPLETED**
  - ✅ Backend implemented via PR #50 with comprehensive validation
  - ✅ Frontend integration completed (Phase 1)
  - ✅ Auto-position assignment working
  - ✅ All tests passing

- [ ] **POST /v1/admin/levels/:levelId/lessons** ❌ **BLOCKED - BACKEND MISSING**
  - Frontend integration ready but **backend endpoint not implemented**
  - Routes still only include: `resources :lessons, only: %i[index update]`
  - Missing `Lesson::Create` command (only `Lesson::Update` exists)
  - **Requires backend team to implement following PR #50 pattern**
  - Expected request: `{ lesson: { title, slug, description, type, data } }`
  - Expected response: `{ lesson: AdminLesson }`
  - Auto-position assignment needed

## Testing

### E2E Test Coverage Expansion
- [x] **Enhanced E2E test coverage** ✅ **COMPLETED**
  - ✅ Added comprehensive app structure tests (`tests/e2e/app-structure.test.ts`)
  - ✅ Enhanced existing user and level tests with better error handling
  - ✅ Added navigation and routing verification tests
  - ✅ 55 E2E tests passing (up from 47)
- [ ] Authentication flow tests (signin/signup) with actual auth
- [ ] Form interaction tests with authenticated sessions

### Unit Testing Setup
- [x] **Unit testing infrastructure** ✅ **COMPLETED**
  - ✅ Jest + React Testing Library fully configured
  - ✅ API client functions have comprehensive test coverage
  - ✅ Mock implementations for API testing
  - ✅ 57 unit tests passing
- [ ] Component testing utilities for complex UI components
- [ ] Test coverage reporting integration

## User Management Enhancements
- [x] **Admin status toggle filter** ✅ **COMPLETED**
  - ✅ Added admin filter to UserFilters type and API client  
  - ✅ Added admin status dropdown to UserFilters component
  - ✅ Comprehensive unit tests for admin filtering
- [x] **Items per page selector for pagination** ✅ **COMPLETED**
  - ✅ Enhanced UserPagination component with items per page selector
  - ✅ Added state management for items per page (10, 25, 50, 100)
  - ✅ Auto-resets to page 1 when changing items per page
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

**✅ COMPLETED (Phase 1 Integration):**
1. ✅ User deletion endpoint - Fully integrated and tested
2. ✅ Level creation endpoint - Fully integrated and tested  
3. ✅ Basic E2E test coverage - All tests passing (47 E2E + 57 unit tests)

**🔄 IMMEDIATE (Backend Action Required):**
1. **Lesson creation backend endpoint** - Blocking Phase 2 frontend integration
   - Backend team needs to implement `POST /v1/admin/levels/:levelId/lessons`
   - Follow Level::Create pattern from PR #50

**Short term (Enhance UX):**
2. Complete lesson creation frontend integration (after backend ready)
3. User management enhancements  
4. Extended E2E coverage for authenticated flows

**Long term (Polish):**
5. Advanced features and optimizations
6. Comprehensive testing suite
7. Performance and accessibility improvements