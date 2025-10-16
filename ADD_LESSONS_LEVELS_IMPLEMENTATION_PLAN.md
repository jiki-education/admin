# Implementation Plan: Add New Lessons and Levels

## Overview

This document outlines the implementation plan for adding functionality to create new lessons and levels in the Jiki Admin application. The goal is to make adding content simple and intuitive with dedicated pages (not modals) for form entry.

## Current State Analysis

### Existing Data Structures
- **AdminLevel**: `{ id, slug, title, description, position }`
- **AdminLesson**: `{ id, slug, title, description, type, position, data }`
- **Lesson Types**: exercise, tutorial, video, reading, quiz, project, assessment

### Current API Endpoints
- `GET /admin/levels` - List levels
- `PATCH /admin/levels/:id` - Update level
- `GET /admin/levels/:id/lessons` - Get lessons for level
- `PATCH /admin/levels/:levelId/lessons/:lessonId` - Update lesson

### Missing API Endpoints (Need to be created)
- `POST /admin/levels` - Create new level
- `POST /admin/levels/:levelId/lessons` - Create new lesson

## User Experience Design

### Add New Level Flow
1. **Entry Point**: "Add New Level" button on `/dashboard/levels` page
2. **Destination**: Navigate to `/dashboard/levels/new` (dedicated page)
3. **Form Fields**: title, slug, description (position auto-assigned)
4. **Success**: Redirect to the new level's detail page

### Add New Lesson Flow
1. **Entry Point**: "Add New Lesson" button on `/dashboard/levels/[id]` page
2. **Destination**: Navigate to `/dashboard/levels/[id]/lessons/new` (dedicated page)
3. **Form Fields**: title, slug, description, type, data (position auto-assigned)
4. **Success**: Redirect back to level detail page

## Implementation Phases

### Phase 1: API Extensions
**Files to create/modify:**
- `lib/api/levels.ts` - Add `createLevel()` and `createLesson()` functions

**API Functions to Implement:**
```typescript
// Create new level
async function createLevel(data: Omit<AdminLevel, 'id' | 'position'>): Promise<AdminLevel>

// Create new lesson
async function createLesson(levelId: number, data: Omit<AdminLesson, 'id' | 'position'>): Promise<AdminLesson>
```

**Expected API Contracts:**
```typescript
// POST /admin/levels
Request: { level: { title, slug, description } }
Response: { level: AdminLevel }

// POST /admin/levels/:levelId/lessons  
Request: { lesson: { title, slug, description, type, data } }
Response: { lesson: AdminLesson }
```

### Phase 2: Form Components
**Files to create:**
- `app/dashboard/levels/components/LevelForm.tsx` - Reusable level form
- `app/dashboard/levels/components/LessonForm.tsx` - Reusable lesson form (extend existing LessonEditForm)

**Form Requirements:**
- **Level Form**: title (required), slug (auto-generated from title, editable), description (optional)
- **Lesson Form**: title (required), slug (auto-generated from title, editable), description (optional), type (dropdown, required), data (JSON editor, optional)
- **Validation**: Real-time validation with error display
- **Auto-slug generation**: Convert title to URL-friendly slug
- **Form state**: Save/Cancel actions with proper navigation

### Phase 3: New Level Page
**Files to create:**
- `app/dashboard/levels/new/page.tsx` - New level creation page

**Page Structure:**
```
/dashboard/levels/new
├── PageBreadcrumb (Levels > New Level)
├── Header with "Create New Level" title
├── LevelForm component
└── Form actions (Save/Cancel)
```

**Features:**
- Form validation with error handling
- Auto-position assignment (next available position)
- Breadcrumb navigation
- Cancel redirects to `/dashboard/levels`
- Success redirects to `/dashboard/levels/[newId]`

### Phase 4: New Lesson Page
**Files to create:**
- `app/dashboard/levels/[id]/lessons/new/page.tsx` - New lesson creation page

**Page Structure:**
```
/dashboard/levels/[id]/lessons/new
├── PageBreadcrumb (Levels > Level [id] > New Lesson)
├── Header with "Add New Lesson to [Level Title]" 
├── LessonForm component (enhanced from LessonEditForm)
└── Form actions (Save/Cancel)
```

**Features:**
- Level context display (show which level we're adding to)
- Auto-position assignment (next available position within level)
- Type-specific form handling
- JSON data editor for flexible content
- Cancel redirects to `/dashboard/levels/[id]`
- Success redirects to `/dashboard/levels/[id]`

### Phase 5: Navigation Integration
**Files to modify:**
- `app/dashboard/levels/page.tsx` - Add "Add New Level" button
- `app/dashboard/levels/[id]/page.tsx` - Add "Add New Lesson" button

**Button Placement:**
- **Levels page**: "Add New Level" button in top-right of Level Management section
- **Level detail**: "Add New Lesson" button in Lessons section header

### Phase 6: Form Enhancements
**Features to implement:**
- **Auto-slug generation**: Convert title to slug on blur/change
- **Position management**: Auto-assign next available position
- **Validation**: Client-side validation with server validation fallback
- **Loading states**: Disable form during submission
- **Error handling**: Display API errors in form context

## Component Reusability

### LevelForm.tsx
```typescript
interface LevelFormProps {
  initialData?: Partial<AdminLevel>;
  onSave: (data: Omit<AdminLevel, 'id' | 'position'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  mode: 'create' | 'edit';
}
```

### LessonForm.tsx (Enhanced LessonEditForm)
```typescript
interface LessonFormProps {
  initialData?: Partial<AdminLesson>;
  onSave: (data: Omit<AdminLesson, 'id' | 'position'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  mode: 'create' | 'edit';
  levelId: number;
}
```

## Auto-Slug Generation Logic

```typescript
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with single
    .replace(/^-|-$/g, '');   // Remove leading/trailing hyphens
}
```

## Error Handling Strategy

### Client-Side Validation
- Required field validation
- Slug format validation (URL-safe characters)
- JSON validation for lesson data
- Duplicate slug detection (via API call)

### Server-Side Error Handling
- Display API errors in form context
- Handle validation errors returned from server
- Handle network errors gracefully
- Provide retry mechanisms for failed operations

## Testing Strategy

### Unit Tests
- Form validation logic
- Auto-slug generation
- API client functions

### E2E Tests
- Complete level creation flow
- Complete lesson creation flow  
- Form validation scenarios
- Navigation flows
- Error handling scenarios

## Implementation Order

1. **Phase 1**: API client functions (backend dependent)
2. **Phase 2**: Form components (can be developed/tested in isolation)
3. **Phase 3**: New level page
4. **Phase 4**: New lesson page  
5. **Phase 5**: Navigation integration
6. **Phase 6**: Form enhancements and polish

## Dependencies

### External Dependencies
- Backend API endpoints need to be implemented first
- No new frontend dependencies required

### Internal Dependencies
- Reuse existing components: Button, PageBreadcrumb, JSONEditor
- Extend existing patterns from LessonEditForm
- Follow existing routing conventions

## Success Criteria

### Functional Requirements
- ✅ Users can create new levels from the levels list page
- ✅ Users can create new lessons from a level detail page
- ✅ Forms include all necessary fields with proper validation
- ✅ Auto-slug generation works correctly
- ✅ Position assignment is automatic and correct
- ✅ Navigation flows work as expected

### Non-Functional Requirements
- ✅ Forms are responsive and accessible
- ✅ Loading states provide clear feedback
- ✅ Error messages are helpful and actionable
- ✅ Performance is acceptable for form interactions
- ✅ Code follows existing patterns and conventions

## Notes for Implementation

### Key Patterns to Follow
- Use existing `LessonEditForm` as template for `LessonForm`
- Follow authentication patterns from existing pages
- Use consistent error handling approach
- Maintain existing TypeScript strict typing
- Follow existing file/folder organization

### Potential Challenges
- **Position calculation**: Ensure new items get correct position values
- **Slug uniqueness**: May need server-side validation for duplicate slugs
- **Form state management**: Handle unsaved changes on navigation
- **Type safety**: Ensure proper typing for form data throughout

### Future Enhancements (Out of Scope)
- Drag-and-drop lesson creation
- Bulk lesson creation
- Level templates
- Lesson duplication
- Advanced validation rules