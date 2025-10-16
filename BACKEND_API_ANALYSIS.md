# Backend API Analysis: Create Endpoints for Levels and Lessons

## Current State Assessment

### Missing Endpoints ❌
The Rails backend API is **missing the create endpoints** needed for the admin interface:
- ❌ `POST /v1/admin/levels` - Create new level
- ❌ `POST /v1/admin/levels/:levelId/lessons` - Create new lesson

### Current Implementation ✅

#### Routes (`config/routes.rb:58-60`)
```ruby
namespace :admin do
  resources :levels, only: %i[index update]        # Missing :create
  resources :lessons, only: %i[index update]       # Missing :create
end
```

#### Controllers
**`V1::Admin::LevelsController`** - Has `index` and `update` actions:
```ruby
def update
  level = Level::Update.(@level, level_params)
  render json: { level: SerializeAdminLevel.(level) }
end

private
def level_params
  params.require(:level).permit(:title, :description, :position, :slug)
end
```

**`V1::Admin::Levels::LessonsController`** - Has `index` and `update` actions:
```ruby
def update
  lesson = Lesson::Update.(@lesson, lesson_params)
  render json: { lesson: SerializeAdminLesson.(lesson) }
end

private
def lesson_params
  params.require(:lesson).permit(:title, :description, :type, :position, data: {})
end
```

#### Models - Perfect for Auto-Position Assignment ✅
**`Level` model** (`app/models/level.rb`):
```ruby
class Level < ApplicationRecord
  validates :slug, presence: true, uniqueness: true
  validates :title, presence: true
  validates :description, presence: true
  validates :position, presence: true, uniqueness: true

  before_validation :set_position, on: :create

  private
  def set_position
    return if position.present?
    self.position = (self.class.maximum(:position) || 0) + 1
  end
end
```

**`Lesson` model** (`app/models/lesson.rb`):
```ruby
class Lesson < ApplicationRecord
  belongs_to :level
  serialize :data, coder: JSONWithIndifferentAccess

  validates :slug, presence: true, uniqueness: true
  validates :title, presence: true
  validates :description, presence: true
  validates :type, presence: true
  validates :position, presence: true, uniqueness: { scope: :level_id }

  before_validation :set_position, on: :create

  private
  def set_position
    return if position.present?
    self.position = (level.lessons.maximum(:position) || 0) + 1 if level
  end
end
```

#### Service Classes
**Existing:**
- ✅ `Level::Update` - Simple update pattern
- ✅ `Lesson::Update` - Simple update pattern

**Missing:**
- ❌ `Level::Create` - Needs to be created
- ❌ `Lesson::Create` - Needs to be created

#### Serializers - Ready ✅
- ✅ `SerializeAdminLevel` - Returns `{ id, slug, title, description, position }`
- ✅ `SerializeAdminLesson` - Returns `{ id, slug, title, description, type, position, data }`

## Required Backend Implementation

### 1. Update Routes
```ruby
# config/routes.rb
namespace :admin do
  resources :levels, only: %i[index create update]
  resources :lessons, only: %i[index create update]
end
```

### 2. Add Controller Actions

**`V1::Admin::LevelsController`**:
```ruby
def create
  level = Level::Create.(level_params)
  render json: { level: SerializeAdminLevel.(level) }, status: :created
rescue ActiveRecord::RecordInvalid => e
  render json: {
    error: {
      type: "validation_error",
      message: e.message
    }
  }, status: :unprocessable_entity
end
```

**`V1::Admin::Levels::LessonsController`**:
```ruby
def create
  lesson = Lesson::Create.(@level, lesson_params)
  render json: { lesson: SerializeAdminLesson.(lesson) }, status: :created
rescue ActiveRecord::RecordInvalid => e
  render json: {
    error: {
      type: "validation_error", 
      message: e.message
    }
  }, status: :unprocessable_entity
end
```

### 3. Create Service Classes

**`app/commands/level/create.rb`**:
```ruby
class Level::Create
  include Mandate

  initialize_with :attributes

  def call
    Level.create!(attributes)
  end
end
```

**`app/commands/lesson/create.rb`**:
```ruby
class Lesson::Create
  include Mandate

  initialize_with :level, :attributes

  def call
    level.lessons.create!(attributes)
  end
end
```

## Expected API Contracts

### Create Level
```http
POST /v1/admin/levels
Content-Type: application/json

{
  "level": {
    "title": "Introduction to Programming",
    "slug": "intro-to-programming", 
    "description": "Learn the basics of programming"
  }
}

Response (201 Created):
{
  "level": {
    "id": 123,
    "title": "Introduction to Programming",
    "slug": "intro-to-programming",
    "description": "Learn the basics of programming", 
    "position": 5
  }
}
```

### Create Lesson
```http
POST /v1/admin/levels/123/lessons
Content-Type: application/json

{
  "lesson": {
    "title": "Variables and Data Types",
    "slug": "variables-and-types",
    "description": "Understanding variables and basic data types",
    "type": "exercise",
    "data": {
      "difficulty": "beginner",
      "estimatedTime": 30
    }
  }
}

Response (201 Created):
{
  "lesson": {
    "id": 456,
    "title": "Variables and Data Types", 
    "slug": "variables-and-types",
    "description": "Understanding variables and basic data types",
    "type": "exercise",
    "position": 3,
    "data": {
      "difficulty": "beginner",
      "estimatedTime": 30
    }
  }
}
```

## Key Features Already Handled

### Auto-Position Assignment ✅
- Levels: `position = (Level.maximum(:position) || 0) + 1`
- Lessons: `position = (level.lessons.maximum(:position) || 0) + 1`

### Validation ✅
- Both models have comprehensive validation
- Unique slugs enforced
- Required fields enforced
- Position uniqueness enforced (scoped for lessons)

### Error Handling Pattern ✅
- Controllers already follow consistent error handling pattern
- Returns proper HTTP status codes
- Structured error responses

### Serialization ✅
- Existing serializers work perfectly for create responses
- Consistent data format with existing endpoints

## Implementation Priority

1. **High Priority**: Add routes and controller actions (quick wins)
2. **Medium Priority**: Create service classes (follows existing patterns)
3. **Low Priority**: Add tests (if needed)

## Notes for Backend Developer

- Models are already perfectly set up with auto-position assignment
- Follow existing `Update` patterns for `Create` service classes
- Controller error handling already established
- No database migrations needed - tables already exist
- Serializers already handle all required fields

## Frontend Compatibility

The frontend is already implemented expecting these exact API contracts:
- `createLevel(data: CreateLevelData): Promise<AdminLevel>`
- `createLesson(levelId: number, data: CreateLessonData): Promise<AdminLesson>`

Once backend endpoints are added, frontend will work immediately without changes.