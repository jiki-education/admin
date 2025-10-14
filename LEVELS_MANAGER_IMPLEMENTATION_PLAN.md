# Levels Manager Implementation Plan

This document outlines the step-by-step implementation plan for building a comprehensive Level Manager for the Jiki Admin UI. The implementation follows existing patterns from User Management and Email Templates Management.

## Project Overview

**Goal**: Create a Level Manager that allows admins to:
- View and search levels with filtering
- Navigate into individual levels to see detailed information
- View and manage lessons within levels (reorder, edit)
- Edit lesson details including title, description, type dropdown, and JSON data editor

**Pattern**: Follow the existing User Management (`app/dashboard/users/`) and Email Templates Management (`app/dashboard/email-templates/`) patterns.

## Backend API Reference

Based on analysis of `/api/app/controllers/v1/admin/levels_controller.rb` and `/api/app/controllers/v1/admin/levels/lessons_controller.rb`:

### Level Management APIs
- **GET** `/v1/admin/levels` - List levels with search/pagination (title, slug, page, per)
- **PATCH** `/v1/admin/levels/:id` - Update level (title, description, position, slug)

### Lesson Management APIs
- **GET** `/v1/admin/levels/:level_id/lessons` - Get lessons for a level
- **PATCH** `/v1/admin/levels/:level_id/lessons/:id` - Update lesson (title, description, type, position, data)

## Implementation Phases

### Phase 1: Core Infrastructure & Level Listing
**Estimated Time**: 2-3 hours

#### 1.1 Create Directory Structure
```
app/dashboard/levels/
├── page.tsx                 # Main levels listing page
├── types/
│   └── index.ts            # TypeScript interfaces
├── components/
│   ├── LevelTable.tsx      # Levels table component
│   ├── LevelFilters.tsx    # Search/filter component
│   └── LevelPagination.tsx # Pagination component
└── [id]/
    └── page.tsx            # Individual level detail page
```

#### 1.2 Define TypeScript Types
Create `app/dashboard/levels/types/index.ts`:
```typescript
export interface Level {
  id: number;
  slug: string;
  title: string;
  description: string;
  position: number;
}

export interface LevelFilters {
  title?: string;
  slug?: string;
  page?: number;
  per?: number;
}

export interface LevelsResponse {
  collection: Level[];
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
}

export interface Lesson {
  id: number;
  slug: string;
  title: string;
  description: string;
  type: string;
  position: number;
  data: Record<string, any>;
}
```

#### 1.3 Create API Service
Create `lib/api/levels.ts`:
```typescript
import { api } from "@/lib/api";
import type { LevelFilters, LevelsResponse, Level, Lesson } from "@/app/dashboard/levels/types";

export async function getAdminLevels(filters?: LevelFilters): Promise<LevelsResponse> {
  const params: Record<string, string> = {
    ...(filters?.title && { title: filters.title }),
    ...(filters?.slug && { slug: filters.slug }),
    ...(filters?.page && { page: filters.page.toString() }),
    ...(filters?.per && { per: filters.per.toString() })
  };

  const response = await api.get<LevelsResponse>("/admin/levels", { params });
  return response.data;
}

export async function updateLevel(id: number, data: Partial<Level>): Promise<Level> {
  const response = await api.patch<{ level: Level }>(`/admin/levels/${id}`, { level: data });
  return response.data.level;
}

export async function getLevelLessons(levelId: number): Promise<Lesson[]> {
  const response = await api.get<{ lessons: Lesson[] }>(`/admin/levels/${levelId}/lessons`);
  return response.data.lessons;
}

export async function updateLesson(levelId: number, lessonId: number, data: Partial<Lesson>): Promise<Lesson> {
  const response = await api.patch<{ lesson: Lesson }>(`/admin/levels/${levelId}/lessons/${lessonId}`, { lesson: data });
  return response.data.lesson;
}
```

#### 1.4 Build Level Listing Components
- **LevelFilters.tsx**: Search by title/slug, similar to UserFilters
- **LevelTable.tsx**: Display levels in table format with actions
- **LevelPagination.tsx**: Pagination controls
- **Main page.tsx**: Combine components like users/page.tsx

### Phase 2: Level Detail View & Lesson Management
**Estimated Time**: 3-4 hours

#### 2.1 Create Level Detail Page
Create `app/dashboard/levels/[id]/page.tsx`:
- Fetch level details and associated lessons
- Display level information in readable format
- Show lessons list with current order
- Follow pattern from `email-templates/edit/[id]/page.tsx`

#### 2.2 Build Lesson Components
Create lesson management components:

**LessonTable.tsx**:
- Display lessons in order by position
- Show lesson type, title, description
- Reorder buttons (up/down arrows or drag-and-drop)
- Edit button for each lesson

**LessonReorderControls.tsx**:
- Move up/down functionality
- Call API to update lesson position
- Optimistic UI updates

### Phase 3: Lesson Editing Interface
**Estimated Time**: 4-5 hours

#### 3.1 Create Lesson Edit Modal/Form
Create `components/LessonEditForm.tsx`:
- Form fields: title (text), description (textarea)
- Type dropdown with options (exercise, tutorial, video, etc.)
- JSON editor for the `data` field with validation
- Save/cancel buttons

#### 3.2 Implement JSON Editor
Options for JSON editing:
- **Monaco Editor**: Rich code editor with JSON validation
- **react-json-editor-ajrm**: Lightweight JSON editor
- **Simple textarea**: With manual JSON.parse validation

Recommendation: Start with Monaco Editor for best UX.

#### 3.3 Form Validation & Error Handling
- Validate JSON format before submission
- Handle API errors gracefully
- Show success/error messages
- Follow patterns from EmailTemplateForm.tsx

### Phase 4: Enhanced Features & Polish
**Estimated Time**: 2-3 hours

#### 4.1 Drag & Drop Reordering
Implement drag-and-drop for lesson reordering:
- Use `@dnd-kit/core` or `react-beautiful-dnd`
- Update positions in batch
- Visual feedback during drag

#### 4.2 Bulk Operations
- Select multiple lessons
- Bulk reorder, delete, or edit operations
- Confirmation dialogs

#### 4.3 Advanced Search & Filtering
- Filter by lesson type
- Search within lessons
- Sort by different criteria

#### 4.4 UI Polish
- Loading states and skeletons
- Proper error boundaries
- Responsive design
- Accessibility improvements

## Technical Implementation Details

### Navigation Integration
Update main navigation to include Levels:
```typescript
// In main layout navigation
{
  name: "Levels",
  href: "/dashboard/levels",
  icon: BookOpenIcon
}
```

### State Management
Use React Query pattern like existing pages:
```typescript
const { data: levels, loading, error } = useQuery({
  queryKey: ['admin-levels', filters],
  queryFn: () => getAdminLevels(filters)
});
```

### Lesson Reordering Logic
```typescript
const reorderLesson = useMutation({
  mutationFn: ({ levelId, lessonId, newPosition }) => 
    updateLesson(levelId, lessonId, { position: newPosition }),
  onSuccess: () => {
    queryClient.invalidateQueries(['level-lessons', levelId]);
  }
});
```

### JSON Editor Implementation
```typescript
import Editor from '@monaco-editor/react';

const JSONEditor = ({ value, onChange, onValidation }) => {
  const handleEditorChange = (value) => {
    try {
      JSON.parse(value);
      onValidation(null); // Valid JSON
      onChange(value);
    } catch (error) {
      onValidation(error.message); // Invalid JSON
    }
  };

  return (
    <Editor
      height="300px"
      language="json"
      value={value}
      onChange={handleEditorChange}
      options={{
        minimap: { enabled: false },
        formatOnPaste: true,
        formatOnType: true
      }}
    />
  );
};
```

## File Checklist

### Phase 1 Files
- [ ] `app/dashboard/levels/page.tsx`
- [ ] `app/dashboard/levels/types/index.ts`
- [ ] `app/dashboard/levels/components/LevelTable.tsx`
- [ ] `app/dashboard/levels/components/LevelFilters.tsx`
- [ ] `app/dashboard/levels/components/LevelPagination.tsx`
- [ ] `lib/api/levels.ts`

### Phase 2 Files
- [ ] `app/dashboard/levels/[id]/page.tsx`
- [ ] `app/dashboard/levels/components/LessonTable.tsx`
- [ ] `app/dashboard/levels/components/LessonReorderControls.tsx`

### Phase 3 Files
- [ ] `app/dashboard/levels/components/LessonEditForm.tsx`
- [ ] `app/dashboard/levels/components/JSONEditor.tsx`
- [ ] `app/dashboard/levels/components/LessonEditModal.tsx`

### Phase 4 Files
- [ ] Enhanced drag & drop functionality
- [ ] Bulk operation components
- [ ] Additional filtering components

## Testing Strategy

### E2E Tests (following existing pattern)
Create `tests/e2e/levels.test.ts`:
```typescript
describe('Levels Management', () => {
  it('should display levels list', async () => {
    // Test level listing
  });
  
  it('should allow level detail navigation', async () => {
    // Test clicking into level details
  });
  
  it('should allow lesson reordering', async () => {
    // Test lesson position changes
  });
  
  it('should allow lesson editing', async () => {
    // Test lesson form submission
  });
});
```

## Dependencies

### Required packages (likely already installed):
- `@monaco-editor/react` - For JSON editor
- `@dnd-kit/core` & `@dnd-kit/sortable` - For drag & drop (Phase 4)

### Optional enhancements:
- `react-hook-form` - Better form handling
- `zod` - Schema validation for lesson data

## Success Criteria

### Phase 1 Success Criteria:
- [ ] Levels list page loads and displays data
- [ ] Search and filtering works
- [ ] Pagination functions correctly
- [ ] Level clicking navigates to detail view

### Phase 2 Success Criteria:
- [ ] Level detail page shows level information
- [ ] Lessons are displayed in correct order
- [ ] Reorder buttons update lesson positions
- [ ] API calls for reordering work correctly

### Phase 3 Success Criteria:
- [ ] Lesson edit form opens and displays current data
- [ ] Title and description editing works
- [ ] Type dropdown functions
- [ ] JSON editor validates and saves data
- [ ] Changes persist after save

### Phase 4 Success Criteria:
- [ ] Drag & drop reordering is smooth
- [ ] UI feels polished and responsive
- [ ] Error states are handled gracefully
- [ ] Loading states provide good UX

## Risk Mitigation

### Potential Challenges:
1. **JSON Editor Complexity**: Start with simple textarea, enhance later
2. **Reordering Logic**: Test thoroughly with edge cases
3. **Performance**: Optimize for large lesson lists
4. **Data Validation**: Ensure JSON schema validation

### Mitigation Strategies:
1. Implement in phases to catch issues early
2. Use existing patterns from email templates
3. Add proper error boundaries and loading states
4. Test with realistic data volumes

This plan provides a comprehensive roadmap for implementing the Levels Manager while following established patterns and ensuring maintainable, scalable code.