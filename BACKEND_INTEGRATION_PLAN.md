# Backend Integration Plan

## Overview
Analysis of backend API endpoints versus admin frontend requirements, based on recent backend PRs and current TODO.md status.

## Backend Endpoint Status

### ✅ Implemented Endpoints
These endpoints were listed as "backend missing" in TODO.md but have now been implemented:

#### User Management
- **DELETE /v1/admin/users/:id** ✅ Implemented
  - Location: `../api/app/controllers/v1/admin/users_controller.rb:38-41`
  - Implementation: `User::Destroy.(@user)` service call
  - Response: 204 No Content
  - **Ready for frontend integration**

#### Level Management  
- **POST /v1/admin/levels** ✅ Implemented (PR #50)
  - Location: `../api/app/controllers/v1/admin/levels_controller.rb:18-30`
  - Implementation: `Level::Create.(level_params)` service call using command pattern
  - Expected request: `{ level: { slug, title, description, position? } }`
  - Expected response: `{ level: AdminLevel }` with 201 status
  - **Features:**
    - Auto-position assignment if not provided (assigns next available position)
    - Comprehensive validation for all required fields (slug, title, description)
    - Proper error handling with 422 responses for validation errors
    - Admin authorization via V1::Admin::BaseController
    - SerializeAdminLevel for consistent response format
  - **Testing:** ✅ 12 command tests + 11 controller tests, all passing
  - **Ready for frontend integration**

- **PUT/PATCH /v1/admin/levels/:id** ✅ Implemented
  - Location: `../api/app/controllers/v1/admin/levels_controller.rb:32-44`
  - Implementation: `Level::Update.(@level, level_params)` service call
  - **Ready for frontend integration**

### ❌ Missing Endpoint
#### Lesson Management
- **POST /v1/admin/levels/:levelId/lessons** ❌ Still missing
  - Current routes only include: `index` and `update` for lessons
  - Route config: `resources :lessons, only: %i[index update], controller: "levels/lessons"`
  - Existing: `Lesson::Update` command exists, but no `Lesson::Create` command
  - **Needs backend implementation before frontend integration**
  - **Required for admin to create new lessons within levels**

## Integration Plan by Priority

### Phase 1: Immediate Integration (Backend Ready)

#### 1.1 User Deletion Integration
**Target**: Remove placeholder in `app/dashboard/users/page.tsx:99-105`

**Frontend Changes Required**:
- Update `lib/api/users.ts` to implement `deleteUser` function
- Remove placeholder toast and implement actual API call
- Add proper error handling for 404/403 responses
- Test user deletion flow end-to-end

**Implementation Steps**:
1. ✅ Backend endpoint available: `DELETE /v1/admin/users/:id`
2. 🔄 Update frontend API client
3. 🔄 Remove placeholder implementation
4. 🔄 Add error handling
5. 🔄 Write E2E tests

#### 1.2 Level Creation Integration
**Target**: Remove placeholder functionality

**Frontend Changes Required**:
- Update level creation form to use real API endpoint
- Handle comprehensive validation errors from backend (slug, title, description)
- Handle auto-position assignment (position field optional)
- Update level list after successful creation
- Add proper loading states and error handling

**Backend Details** (PR #50):
- Endpoint: `POST /v1/admin/levels`
- Request format: `{ level: { slug, title, description, position? } }`
- Response: `{ level: AdminLevel }` (201) or `{ error: { type, message } }` (422)
- Auto-assigns position if not provided
- Validates all required fields with detailed error messages

**Implementation Steps**:
1. ✅ Backend endpoint available: `POST /v1/admin/levels`
2. 🔄 Update frontend API client to match exact request/response format
3. 🔄 Connect form to real endpoint with proper error handling
4. 🔄 Handle backend validation errors (422 responses)
5. 🔄 Add success/error notifications
6. 🔄 Write E2E tests matching backend behavior

### Phase 2: Pending Backend Implementation

#### 2.1 Lesson Creation Integration
**Target**: Connect lesson creation form to backend

**Backend Requirements** (Following PR #50 pattern):
- Add `create` action to `V1::Admin::Levels::LessonsController`
- Update routes: `resources :lessons, only: %i[index create update], controller: "levels/lessons"`
- Implement `Lesson::Create` service class (following `Level::Create` pattern)
- Add comprehensive parameter validation (title, slug, description, type, data)
- Add auto-position assignment within level
- Add proper error handling and response format consistency

**Frontend Integration** (after backend is ready):
- Update lesson creation form to use real API endpoint
- Handle validation errors and success responses
- Refresh lesson list after creation
- Add proper loading and error states

**Implementation Steps**:
1. ❌ Backend implementation required first
2. 🔄 After backend: Update frontend API client
3. 🔄 After backend: Connect form to real endpoint
4. 🔄 After backend: Add error handling
5. 🔄 After backend: Write E2E tests

## Frontend Files Requiring Updates

### API Client Updates
- `lib/api/users.ts` - Add `deleteUser` implementation
- `lib/api/levels.ts` - Connect level creation to real endpoint
- `lib/api/lessons.ts` - Add lesson creation (after backend ready)

### Component Updates
- `app/dashboard/users/page.tsx:99-105` - Remove delete placeholder
- Level creation form components - Connect to real API
- Lesson creation form components - Connect to real API (after backend)

### Testing Updates
- Add E2E tests for user deletion flow
- Add E2E tests for level creation flow
- Add E2E tests for lesson creation (after backend ready)

## Implementation Status

### ✅ Phase 1: COMPLETED
**All Phase 1 integrations have been successfully implemented:**

1. **✅ User Deletion Integration** - COMPLETED
   - ✅ Added `deleteUser` function to `lib/api/users.ts`
   - ✅ Removed placeholder code from `app/dashboard/users/page.tsx`
   - ✅ Added comprehensive unit tests
   - ✅ All tests passing (57 unit tests, 47 E2E tests)

2. **✅ Level Creation Integration** - COMPLETED  
   - ✅ Already properly implemented and functional
   - ✅ Matches backend API specification from PR #50
   - ✅ All tests passing

### ❌ Phase 2: BLOCKED - Backend Implementation Required

**Lesson Creation Integration** - Cannot proceed (as of latest backend check)
- ❌ Backend endpoint still missing: `POST /v1/admin/levels/:levelId/lessons`
- ❌ Routes still only include: `resources :lessons, only: %i[index update]`
- ❌ No `Lesson::Create` command exists (only `Lesson::Update`)

## Recommended Next Steps

### Immediate (Ready for Production)
1. ✅ **Deploy Phase 1 integrations** - User deletion and level creation are production ready
2. ✅ **Update TODO.md** to reflect completed Phase 1 integrations

### Backend Team Action Required
3. **🔄 Implement lesson creation endpoint** following PR #50 pattern:
   - Add `create` action to `V1::Admin::Levels::LessonsController`
   - Update routes: `resources :lessons, only: %i[index create update]`
   - Implement `Lesson::Create` command class
   - Add comprehensive tests and validation
   - Follow same patterns as `Level::Create` implementation

### After Backend Implementation
4. **🔄 Phase 2 Frontend Integration** (blocked until backend ready):
   - Connect lesson creation form to real API endpoint
   - Update error handling for lesson creation
   - Add comprehensive tests
   - Remove any remaining lesson creation placeholders

## Notes
- All implemented endpoints follow consistent error handling patterns
- Backend uses service classes (User::Destroy, Level::Create, etc.)
- Frontend should maintain existing UI patterns and error handling approaches
- Authentication and authorization handled by BaseController