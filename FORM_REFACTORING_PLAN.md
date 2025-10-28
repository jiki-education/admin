# LevelForm & LessonForm Refactoring Plan

## Overview

Refactor LevelForm (231 lines) and LessonForm (460 lines) to be uniform, maintainable, and under 100 lines each by extracting shared components and utilities.

## Current Analysis

### LevelForm (231 lines)

- **Fields**: title, slug, description
- **Features**: Auto-slug generation, basic validation, error handling
- **Structure**: Simple form with basic error display

### LessonForm (460 lines)

- **Fields**: title, slug, description, type, data (JSON)
- **Features**: Auto-slug generation, JSON validation, advanced error parsing, error summary box, required field indicators
- **Structure**: Complex form with error summary, field-specific errors, JSON editor

## Refactoring Strategy

### Phase 1: Extract Shared Utilities

#### 1.1 Create `useFormValidation` Hook

**File**: `app/dashboard/levels/hooks/useFormValidation.ts`

- Handle form state management
- Auto-slug generation logic
- Basic validation rules
- Error state management

#### 1.2 Create `useFormSubmission` Hook

**File**: `app/dashboard/levels/hooks/useFormSubmission.ts`

- Handle form submission logic
- Loading states
- Error handling (basic + API errors)
- Success callbacks

#### 1.3 Create Error Parsing Utility

**File**: `app/dashboard/levels/utils/errorParsing.ts`

- Move `parseValidationErrors` function
- Add generic error formatting utilities
- Handle different error types (422, network, etc.)

### Phase 2: Extract Shared Components

#### 2.1 Create `FormErrorSummary` Component

**File**: `app/dashboard/levels/components/shared/FormErrorSummary.tsx`

- Reusable error summary box with icon
- Support for field-specific errors with asterisks
- Consistent styling and layout

#### 2.2 Create `FormField` Component

**File**: `app/dashboard/levels/components/shared/FormField.tsx`

- Unified field component (input, textarea, select)
- Built-in error display with styled boxes
- Required field indicator support
- Consistent styling

#### 2.3 Create `FormActions` Component

**File**: `app/dashboard/levels/components/shared/FormActions.tsx`

- Reusable cancel/submit button group
- Consistent styling and spacing
- Loading state handling

#### 2.4 Create `RequiredFieldsNotice` Component

**File**: `app/dashboard/levels/components/shared/RequiredFieldsNotice.tsx`

- "Fields marked with \* are required" notice
- Consistent styling

### Phase 3: Refactor Forms

#### 3.1 Refactor LevelForm (Target: ~80 lines)

```typescript
export default function LevelForm({ initialData, onSave, onCancel, loading, mode }: LevelFormProps) {
  const { formData, errors, handleInputChange, handleSlugChange, validateForm } = useFormValidation({
    initialData,
    fields: ['title', 'slug', 'description'],
    validationRules: LEVEL_VALIDATION_RULES
  });

  const { saving, handleSubmit } = useFormSubmission({
    onSave,
    formData,
    validateForm,
    dataTransform: (data) => ({ title: data.title.trim(), slug: data.slug.trim(), description: data.description.trim() })
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <RequiredFieldsNotice />
      <FormErrorSummary errors={errors} />

      <FormField
        type="text"
        name="title"
        label="Title"
        value={formData.title}
        onChange={handleInputChange}
        error={errors.title}
        required
      />

      <FormField
        type="text"
        name="slug"
        label="Slug"
        value={formData.slug}
        onChange={handleSlugChange}
        error={errors.slug}
        className="font-mono text-sm"
        required
      />

      <FormField
        type="textarea"
        name="description"
        label="Description"
        value={formData.description}
        onChange={handleInputChange}
        error={errors.description}
        rows={3}
        required
      />

      <FormActions
        onCancel={onCancel}
        onSubmit={handleSubmit}
        submitLabel={mode === 'create' ? 'Create Level' : 'Save Changes'}
        loading={saving || loading}
        disabled={!isFormValid()}
      />
    </form>
  );
}
```

#### 3.2 Refactor LessonForm (Target: ~95 lines)

```typescript
export default function LessonForm({ initialData, onSave, onCancel, loading, mode, levelId }: LessonFormProps) {
  const { formData, errors, handleInputChange, handleSlugChange, validateForm } = useFormValidation({
    initialData,
    fields: ['title', 'slug', 'description', 'type', 'data'],
    validationRules: LESSON_VALIDATION_RULES
  });

  const [jsonError, setJsonError] = useState<string | null>(null);

  const { saving, handleSubmit } = useFormSubmission({
    onSave,
    formData,
    validateForm,
    errorParser: parseValidationErrors,
    dataTransform: (data) => ({
      title: data.title.trim(),
      slug: data.slug.trim(),
      description: data.description.trim(),
      type: data.type,
      data: JSON.parse(data.data || '{}')
    })
  });

  const handleJSONChange = (value: string) => {
    handleInputChange('data', value);
  };

  const handleJSONValidation = (error: string | null) => {
    setJsonError(error);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <RequiredFieldsNotice />
      <FormErrorSummary errors={errors} />

      <FormField
        type="text"
        name="title"
        label="Title"
        value={formData.title}
        onChange={handleInputChange}
        error={errors.title}
        required
      />

      <FormField
        type="text"
        name="slug"
        label="Slug"
        value={formData.slug}
        onChange={handleSlugChange}
        error={errors.slug}
        className="font-mono text-sm"
        required
      />

      <FormField
        type="textarea"
        name="description"
        label="Description"
        value={formData.description}
        onChange={handleInputChange}
        error={errors.description}
        rows={3}
        required
      />

      <FormField
        type="select"
        name="type"
        label="Type"
        value={formData.type}
        onChange={handleInputChange}
        error={errors.type}
        options={LESSON_TYPES}
        required
      />

      <div>
        <FormField
          type="custom"
          name="data"
          label="Lesson Data (JSON)"
          error={errors.data}
          required
        >
          <JSONEditor
            value={formData.data}
            onChange={handleJSONChange}
            onValidation={handleJSONValidation}
            placeholder="Enter lesson data as valid JSON..."
          />
        </FormField>
      </div>

      <FormActions
        onCancel={onCancel}
        onSubmit={handleSubmit}
        submitLabel={mode === 'create' ? 'Create Lesson' : 'Save Changes'}
        loading={saving || loading}
        disabled={!isFormValid()}
      />
    </form>
  );
}
```

## Implementation Order

### Day 1: Foundation

1. Create `useFormValidation` hook
2. Create `useFormSubmission` hook
3. Create `errorParsing` utility
4. Create validation rules constants

### Day 2: Shared Components

1. Create `RequiredFieldsNotice` component
2. Create `FormErrorSummary` component
3. Create `FormField` component
4. Create `FormActions` component

### Day 3: Form Refactoring

1. Refactor `LevelForm` using new utilities/components
2. Update LevelForm tests
3. Refactor `LessonForm` using new utilities/components
4. Update LessonForm tests

### Day 4: Cleanup & Testing

1. Remove duplicate code
2. Update imports across codebase
3. Run full test suite
4. Fix any integration issues

## File Structure After Refactoring

```
app/dashboard/levels/
├── components/
│   ├── shared/
│   │   ├── FormErrorSummary.tsx      (~30 lines)
│   │   ├── FormField.tsx             (~60 lines)
│   │   ├── FormActions.tsx           (~25 lines)
│   │   └── RequiredFieldsNotice.tsx  (~10 lines)
│   ├── LevelForm.tsx                 (~80 lines)
│   ├── LessonForm.tsx                (~95 lines)
│   └── JSONEditor.tsx                (unchanged)
├── hooks/
│   ├── useFormValidation.ts          (~80 lines)
│   └── useFormSubmission.ts          (~60 lines)
├── utils/
│   └── errorParsing.ts               (~40 lines)
└── constants/
    └── validationRules.ts            (~30 lines)
```

## Benefits

### Code Reduction

- **LevelForm**: 231 → 80 lines (-65%)
- **LessonForm**: 460 → 95 lines (-79%)
- **Total reduction**: ~516 lines while adding ~335 lines of reusable code

### Maintainability

- ✅ Consistent error handling across all forms
- ✅ Shared validation logic
- ✅ Reusable form components
- ✅ Single source of truth for form patterns
- ✅ Easier to add new forms in the future

### Features Preserved

- ✅ Auto-slug generation
- ✅ Field validation with error display
- ✅ JSON editor integration
- ✅ Advanced error parsing for API responses
- ✅ Required field indicators
- ✅ Error summary boxes
- ✅ Form submission handling
- ✅ Loading states

## Testing Strategy

### Unit Tests

- Test each hook independently
- Test shared components in isolation
- Update existing form tests to use new structure

### Integration Tests

- Verify form submission flows
- Test error handling scenarios
- Ensure backward compatibility

### Visual Tests

- Verify UI consistency between forms
- Test responsive behavior
- Check dark mode compatibility

## Migration Path

1. **Gradual Migration**: Create new components alongside existing ones
2. **Feature Flag**: Use feature flag to switch between old/new implementations
3. **A/B Testing**: Test new implementation with subset of users
4. **Full Rollout**: Replace old forms once testing is complete

## Success Criteria

- ✅ Both forms under 100 lines
- ✅ All existing functionality preserved
- ✅ All tests passing
- ✅ Consistent UI/UX between forms
- ✅ Reusable components for future forms
- ✅ No performance regressions
- ✅ Improved maintainability and developer experience
