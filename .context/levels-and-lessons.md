# Levels and Lessons Architecture

## Overview

The Jiki Admin application provides comprehensive management of the platform's learning content through a hierarchical structure of **Levels** and **Lessons**. This document outlines how these entities are constructed, managed, and interact within the admin interface.

## Core Data Structures

### AdminLevel

Represents a learning level with basic metadata:

```typescript
interface AdminLevel {
  id: number;           // Unique identifier
  slug: string;         // URL-friendly identifier
  title: string;        // Display name
  description: string;  // Level description
  position: number;     // Ordering position
}
```

### AdminLesson

Represents individual lessons within a level:

```typescript
interface AdminLesson {
  id: number;                    // Unique identifier
  slug: string;                  // URL-friendly identifier
  title: string;                 // Display name
  description: string;           // Lesson description
  type: string;                  // Lesson type (see types below)
  position: number;              // Ordering within level
  data: Record<string, any>;     // Flexible JSON data structure
}
```

### Lesson Types

Supported lesson types with their semantics:

- **`exercise`** - Interactive coding exercises
- **`tutorial`** - Step-by-step guided tutorials
- **`video`** - Video content (e.g., Mux-hosted videos)
- **`reading`** - Text-based reading material
- **`quiz`** - Assessment quizzes
- **`project`** - Larger project-based assignments
- **`assessment`** - Formal assessments

## Directory Structure

```
app/dashboard/levels/
├── page.tsx                    # Main levels listing page
├── types/index.ts              # Core type definitions
├── components/                 # Reusable UI components
│   ├── LevelTable.tsx         # Level data table
│   ├── LevelFilters.tsx       # Level filtering UI
│   ├── LevelPagination.tsx    # Pagination controls
│   ├── LessonTable.tsx        # Lesson data table
│   ├── LessonCard.tsx         # Individual lesson display
│   ├── LessonEditForm.tsx     # Lesson editing form
│   ├── LessonFilters.tsx      # Lesson filtering UI
│   ├── JSONEditor.tsx         # JSON data editor
│   ├── BulkEditModal.tsx      # Bulk operations modal
│   └── ErrorDisplay.tsx       # Error handling component
└── [id]/                      # Dynamic level routes
    ├── page.tsx               # Level detail/lesson management
    └── lessons/[lessonId]/
        └── edit/page.tsx      # Individual lesson editor
```

## API Integration

### Endpoints

All level and lesson management uses RESTful admin endpoints:

- **`GET /admin/levels`** - List levels with filtering/pagination
- **`PATCH /admin/levels/:id`** - Update level metadata
- **`GET /admin/levels/:id/lessons`** - Get lessons for a level
- **`PATCH /admin/levels/:levelId/lessons/:lessonId`** - Update lesson

### API Client Functions

Located in `lib/api/levels.ts`:

```typescript
// Level management
getAdminLevels(filters?: AdminLevelFilters): Promise<AdminLevelsResponse>
updateLevel(id: number, data: Partial<AdminLevel>): Promise<AdminLevel>

// Lesson management
getLevelLessons(levelId: number): Promise<AdminLesson[]>
updateLesson(levelId: number, lessonId: number, data: Partial<AdminLesson>): Promise<AdminLesson>
```

## Key Features

### Level Management
- **Filterable listing** with title/slug search
- **Pagination** for large datasets
- **Direct navigation** to lesson management

### Lesson Management
- **Position-based ordering** with drag/reorder controls
- **Bulk editing** for multiple lessons simultaneously
- **Type-specific handling** based on lesson type
- **JSON data editor** for flexible lesson content
- **Real-time filtering** by type, title, or content

### Lesson Data Structure

The `data` field in `AdminLesson` supports flexible JSON content based on lesson type:

#### Video Lessons
```typescript
{
  sources: Array<{
    host: string;  // e.g., "mux"
    id: string;    // Video playback ID
  }>;
}
```

#### Exercise Lessons
```typescript
{
  // Exercise-specific configuration
  // Structure depends on exercise type
}
```

### Navigation Patterns

1. **`/dashboard/levels`** - Main level listing
2. **`/dashboard/levels/[id]`** - Level detail with lesson management
3. **`/dashboard/levels/[id]/lessons/[lessonId]/edit`** - Individual lesson editor

### User Experience Features

- **Loading states** with skeleton components
- **Error boundaries** for graceful error handling  
- **Optimistic updates** for reordering operations
- **Form validation** with real-time feedback
- **Responsive design** for various screen sizes

## State Management

### Level Listing (`/dashboard/levels`)
- Manages level list with filtering and pagination
- Uses URL query parameters for stateful filters
- Implements loading/error states

### Level Detail (`/dashboard/levels/[id]`)
- Manages lesson collection for a specific level
- Handles lesson reordering through position updates
- Supports bulk operations on selected lessons
- Implements filtered views of lessons

### Lesson Editor (`/dashboard/levels/[id]/lessons/[lessonId]/edit`)
- Form state management for lesson properties
- JSON validation for lesson data
- Save/cancel operations with navigation

## Error Handling

- **`ErrorDisplay`** component for consistent error UI
- **`LessonErrorBoundary`** for catching render errors
- **API error handling** with user-friendly messages
- **Form validation** with field-level error display

## Performance Considerations

- **Skeleton loading** components for better perceived performance
- **Optimistic updates** for immediate UI feedback
- **Efficient filtering** without server round-trips where possible
- **Pagination** to handle large lesson collections

## Security Notes

- All admin operations require authentication
- API endpoints use admin-specific routes (`/admin/*`)
- Input validation on both client and server sides
- XSS protection in JSON editor and text fields