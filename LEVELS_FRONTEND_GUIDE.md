# Levels Functionality - Frontend Implementation Overview

Based on analysis of the Jiki API codebase, here's comprehensive information about the levels system for frontend implementation:

## Core Data Models

### Level Model (`/app/models/level.rb:1`)

```ruby
# Key attributes:
- slug: unique identifier (string)
- title: display name (string)
- description: level description (string)
- position: ordering (integer, auto-generated)

# Relationships:
- has_many :lessons (ordered by position)
- has_many :user_levels
- has_many :users (through user_levels)
```

### UserLevel Model (`/app/models/user_level.rb:1`)

```ruby
# Key attributes:
- user_id, level_id (unique together)
- started_at: when user began level (required)
- completed_at: when user finished level (optional)
- current_user_lesson_id: tracks current lesson in level

# Relationships:
- belongs_to :user, :level
- belongs_to :current_user_lesson (optional)
```

### Lesson Model (`/app/models/lesson.rb:1`)

```ruby
# Key attributes:
- slug: unique identifier (string)
- title: display name (string)
- description: lesson description (string)
- type: lesson type ("exercise", "tutorial", etc.)
- position: ordering within level (integer, auto-generated)
- data: flexible JSON data field for lesson-specific content

# Relationships:
- belongs_to :level
- has_many :user_lessons
- has_many :users (through user_lessons)
```

### UserLesson Model (`/app/models/user_lesson.rb:1`)

```ruby
# Key attributes:
- user_id, lesson_id (unique together)
- started_at: when user began lesson (required)
- completed_at: when user finished lesson (optional)

# Relationships:
- belongs_to :user, :lesson
- has_many :exercise_submissions (for exercise-type lessons)
```

## API Endpoints

### 1. Public Level Listing

**GET `/v1/levels`** - Get all available levels with lessons

**Response Format:**

```json
{
  "levels": [
    {
      "slug": "basics",
      "lessons": [
        { "slug": "lesson-1", "type": "exercise" },
        { "slug": "lesson-2", "type": "tutorial" }
      ]
    }
  ]
}
```

**Frontend Usage:**

- Display available learning paths
- Show level structure and lesson types
- Build navigation/course overview

### 2. User Progress Tracking

**GET `/v1/user_levels`** - Get current user's level progress

**Response Format:**

```json
{
  "user_levels": [
    {
      "level_slug": "basics",
      "user_lessons": [
        { "lesson_slug": "lesson-1", "status": "completed" },
        { "lesson_slug": "lesson-2", "status": "started" }
      ]
    }
  ]
}
```

**Frontend Usage:**

- Show progress indicators
- Unlock/lock level access
- Track completion status

### 3. Individual Lesson Details

**GET `/v1/lessons/:lesson_slug`** - Get specific lesson content

**Response Format:**

```json
{
  "lesson": {
    "slug": "lesson-1",
    "type": "exercise",
    "data": {
      "slug": "hello-world",
      "instructions": "Write a program that outputs 'Hello, World!'"
    }
  }
}
```

**Frontend Usage:**

- Display lesson content and instructions
- Load exercise data for interactive coding
- Show tutorial content

### 4. User Lesson Progress

**GET `/v1/user_lessons/:lesson_slug`** - Get user's progress on specific lesson

**Response Format:**

```json
{
  "user_lesson": {
    "lesson_slug": "lesson-1",
    "status": "completed",
    "data": {
      "last_submission": {
        "uuid": "abc123",
        "files": [
          {
            "filename": "hello_world.py",
            "content": "print('Hello, World!')"
          }
        ]
      }
    }
  }
}
```

**POST `/v1/user_lessons/:lesson_slug/start`** - Start a lesson

**PATCH `/v1/user_lessons/:lesson_slug/complete`** - Mark lesson as complete

**Frontend Usage:**

- Track individual lesson progress
- Resume from last submission (for exercises)
- Start/complete lesson actions

### 5. Exercise Submissions

**POST `/v1/lessons/:lesson_slug/exercise_submissions`** - Submit exercise solution

**Request Format:**

```json
{
  "exercise_submission": {
    "files": [
      {
        "filename": "hello_world.py",
        "content": "print('Hello, World!')"
      }
    ]
  }
}
```

**Frontend Usage:**

- Submit code solutions for exercises
- Save progress automatically
- Handle multiple file submissions

### 6. Admin Level Management (Admin Only)

**GET `/v1/admin/levels`** - Search/paginate levels with filters

**Query Parameters:**

- `title`: filter by title (partial match)
- `slug`: filter by slug (partial match)
- `page`: page number (default: 1)
- `per`: items per page (default: 24)

**Response Format:**

```json
{
  "collection": [
    {
      "id": 1,
      "slug": "basics",
      "title": "Programming Basics",
      "description": "Learn the fundamentals",
      "position": 1
    }
  ],
  "meta": {
    "current_page": 1,
    "total_pages": 5,
    "total_count": 120,
    "per_page": 24
  }
}
```

**PATCH `/v1/admin/levels/:id`** - Update level details

**Request Format:**

```json
{
  "level": {
    "title": "Updated Title",
    "description": "Updated description",
    "position": 2,
    "slug": "updated-slug"
  }
}
```

### 7. Admin Lesson Management (Admin Only)

**GET `/v1/admin/levels/:level_id/lessons`** - Get lessons for a level

**Response Format:**

```json
{
  "lessons": [
    {
      "id": 1,
      "slug": "lesson-1",
      "title": "Hello World",
      "description": "Your first program",
      "type": "exercise",
      "position": 1,
      "data": { "slug": "hello-world" }
    }
  ]
}
```

**PATCH `/v1/admin/levels/:level_id/lessons/:id`** - Update lesson details

**Request Format:**

```json
{
  "lesson": {
    "title": "Updated Lesson",
    "description": "Updated description",
    "type": "tutorial",
    "position": 2,
    "data": { "instructions": "New instructions" }
  }
}
```

## Key Business Logic

### Level Progression (`/app/commands/user_level/complete.rb:1`)

When a user completes a level:

1. **Mark as Complete**: `completed_at` is set
2. **Auto-unlock Next**: Next level is automatically unlocked
3. **Email Notification**: Completion email sent if template exists
4. **Sequential Access**: Levels must be completed in order

### Lesson Progression (`/app/commands/user_lesson/complete.rb:1`)

When a user completes a lesson:

1. **Mark as Complete**: `completed_at` is set
2. **Clear Current Lesson**: User's current lesson pointer is cleared
3. **Update Level Progress**: UserLevel tracks overall progress

### Lesson Start Logic (`/app/commands/user_lesson/find_or_create.rb:1`)

When a user starts a lesson:

1. **Create UserLesson**: Record created with `started_at` timestamp
2. **Update Current Pointers**: User's current lesson and level are updated
3. **Auto-create UserLevel**: Level record created if doesn't exist

### Access Rules

- **Linear Progression**: Users progress through levels sequentially
- **Position-based Ordering**: Levels and lessons ordered by `position` field
- **Auto-creation**: UserLevel/UserLesson records created when user starts
- **Current Tracking**: System tracks user's current level and lesson

## Frontend Implementation Guide

### 1. Level Overview/Dashboard

```javascript
// Fetch all available levels
const { data: levels } = useQuery({
  queryKey: ['levels'],
  queryFn: () => api.get('/v1/levels')
});

// Fetch user progress
const { data: userProgress } = useQuery({
  queryKey: ['user-levels'],
  queryFn: () => api.get('/v1/user_levels')
});

// Merge data for complete picture
const levelsWithProgress = levels?.map(level => ({
  ...level,
  progress: userProgress?.find(p => p.level_slug === level.slug),
  isUnlocked: /* logic to determine if level is accessible */,
  completionPercentage: /* calculate from user_lessons status */
}));
```

### 2. Individual Lesson Interface

```javascript
// Fetch lesson content
const { data: lesson } = useQuery({
  queryKey: ["lesson", lessonSlug],
  queryFn: () => api.get(`/v1/lessons/${lessonSlug}`)
});

// Fetch user's progress on this lesson
const { data: userLesson } = useQuery({
  queryKey: ["user-lesson", lessonSlug],
  queryFn: () => api.get(`/v1/user_lessons/${lessonSlug}`),
  enabled: !!lessonSlug
});

// Start lesson action
const startLesson = useMutation({
  mutationFn: (lessonSlug) => api.post(`/v1/user_lessons/${lessonSlug}/start`),
  onSuccess: () => {
    queryClient.invalidateQueries(["user-lesson", lessonSlug]);
    queryClient.invalidateQueries(["user-levels"]);
  }
});

// Complete lesson action
const completeLesson = useMutation({
  mutationFn: (lessonSlug) => api.patch(`/v1/user_lessons/${lessonSlug}/complete`),
  onSuccess: () => {
    queryClient.invalidateQueries(["user-lesson", lessonSlug]);
    queryClient.invalidateQueries(["user-levels"]);
  }
});
```

### 3. Exercise Submission Interface

```javascript
// Submit exercise solution
const submitExercise = useMutation({
  mutationFn: ({ lessonSlug, files }) =>
    api.post(`/v1/lessons/${lessonSlug}/exercise_submissions`, {
      exercise_submission: { files }
    }),
  onSuccess: () => {
    queryClient.invalidateQueries(["user-lesson", lessonSlug]);
  }
});

// Example usage
const handleSubmit = () => {
  submitExercise.mutate({
    lessonSlug: "hello-world",
    files: [
      {
        filename: "hello_world.py",
        content: codeEditorValue
      }
    ]
  });
};
```

### 4. Progress Tracking Components

```javascript
// Level progress indicator
const LevelProgress = ({ level, userProgress }) => {
  const completedLessons = userProgress?.user_lessons?.filter((lesson) => lesson.status === "completed").length || 0;

  const totalLessons = level.lessons.length;
  const percentage = (completedLessons / totalLessons) * 100;

  return (
    <div className="level-progress">
      <ProgressBar value={percentage} />
      <span>
        {completedLessons}/{totalLessons} lessons completed
      </span>
    </div>
  );
};
```

### 5. Level Navigation

```javascript
// Determine level accessibility
const isLevelUnlocked = (levelSlug, userLevels) => {
  const levelIndex = allLevels.findIndex((l) => l.slug === levelSlug);
  if (levelIndex === 0) return true; // First level always unlocked

  const previousLevel = allLevels[levelIndex - 1];
  const previousProgress = userLevels.find((ul) => ul.level_slug === previousLevel.slug);

  return previousProgress?.user_lessons?.every((lesson) => lesson.status === "completed");
};
```

### 6. Lesson Navigation Components

```javascript
// Lesson status indicator
const LessonStatus = ({ userLesson, lesson }) => {
  if (!userLesson) {
    return <Badge variant="gray">Not Started</Badge>;
  }

  if (userLesson.status === "completed") {
    return <Badge variant="green">Completed</Badge>;
  }

  return <Badge variant="blue">In Progress</Badge>;
};

// Lesson list with progress
const LessonList = ({ level, userProgress }) => {
  return (
    <div className="lesson-list">
      {level.lessons.map((lesson, index) => {
        const userLesson = userProgress?.user_lessons?.find((ul) => ul.lesson_slug === lesson.slug);

        return (
          <div key={lesson.slug} className="lesson-item">
            <div className="lesson-info">
              <h3>{lesson.title}</h3>
              <span className="lesson-type">{lesson.type}</span>
            </div>
            <LessonStatus userLesson={userLesson} lesson={lesson} />
          </div>
        );
      })}
    </div>
  );
};
```

### 7. Admin Level Management

```javascript
// Admin level search/filter
const AdminLevels = () => {
  const [filters, setFilters] = useState({ title: "", slug: "", page: 1 });

  const { data: levels } = useQuery({
    queryKey: ["admin-levels", filters],
    queryFn: () => api.get("/v1/admin/levels", { params: filters })
  });

  const updateLevel = useMutation({
    mutationFn: ({ id, data }) => api.patch(`/v1/admin/levels/${id}`, { level: data })
  });
};
```

## UI Components Needed

### 1. Student Interface

- **Level Grid/List**: Overview of all levels with progress
- **Level Detail**: Individual level with lesson breakdown
- **Lesson Viewer**: Individual lesson content and instructions
- **Code Editor**: Interactive editor for exercise lessons
- **Progress Indicators**: Visual progress bars and completion status
- **Navigation**: Next/previous level/lesson navigation with lock states
- **Submission History**: View past exercise submissions

### 2. Admin Interface

- **Level Search**: Filter by title/slug with pagination
- **Level Editor**: Form to update title, description, position, slug
- **Level Ordering**: Drag-and-drop or input for position changes
- **Lesson Management**: CRUD operations for lessons within levels
- **Lesson Editor**: Form to update lesson content, type, and data
- **Bulk Actions**: Multi-select level/lesson operations

## State Management Recommendations

```javascript
// Zustand store example
const useLevelStore = create((set, get) => ({
  levels: [],
  userProgress: [],
  currentLevel: null,
  currentLesson: null,

  fetchLevels: async () => {
    const levels = await api.get("/v1/levels");
    set({ levels: levels.data.levels });
  },

  fetchUserProgress: async () => {
    const progress = await api.get("/v1/user_levels");
    set({ userProgress: progress.data.user_levels });
  },

  getLevelProgress: (levelSlug) => {
    return get().userProgress.find((p) => p.level_slug === levelSlug);
  },

  getLessonProgress: (levelSlug, lessonSlug) => {
    const levelProgress = get().getLevelProgress(levelSlug);
    return levelProgress?.user_lessons?.find((ul) => ul.lesson_slug === lessonSlug);
  },

  isLevelUnlocked: (levelSlug) => {
    // Implementation based on sequential progression logic
  },

  isLessonUnlocked: (levelSlug, lessonSlug) => {
    const level = get().levels.find((l) => l.slug === levelSlug);
    const lessonIndex = level?.lessons.findIndex((l) => l.slug === lessonSlug);

    if (lessonIndex === 0) return true; // First lesson always unlocked

    const previousLesson = level.lessons[lessonIndex - 1];
    const previousProgress = get().getLessonProgress(levelSlug, previousLesson.slug);

    return previousProgress?.status === "completed";
  }
}));
```

## Security & Auth Requirements

- **Authentication Required**: All endpoints require valid JWT token
- **Admin Endpoints**: Admin management requires `admin: true` user role
- **User Isolation**: User progress endpoints filter by `current_user` automatically

## Performance Considerations

- **Optimized Queries**: Serializers use optimized database queries with includes
- **Pagination**: Admin endpoints support pagination for large datasets
- **Caching**: Consider caching level structure (changes infrequently)
- **Real-time Updates**: Progress updates may need WebSocket or polling for live updates

The system provides a robust foundation for building comprehensive level-based learning progression with both student and admin interfaces.
