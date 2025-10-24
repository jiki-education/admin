"use client";
import { useState } from "react";
import JSONEditor from "./JSONEditor";
import { useFormValidation } from "../hooks/useFormValidation";
import { useFormSubmission } from "../hooks/useFormSubmission";
import { LESSON_VALIDATION_RULES, LESSON_TYPES } from "../constants/validationRules";
import { parseValidationErrors } from "../utils/errorParsing";
import RequiredFieldsNotice from "./shared/RequiredFieldsNotice";
import FormErrorSummary from "./shared/FormErrorSummary";
import FormField from "./shared/FormField";
import FormActions from "./shared/FormActions";
import type { AdminLesson, CreateLessonData } from "../types";

interface LessonFormProps {
  initialData?: Partial<AdminLesson>;
  onSave: (data: CreateLessonData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  mode: 'create' | 'edit';
  levelId: number;
}

export default function LessonForm({ initialData, onSave, onCancel, loading = false, mode }: LessonFormProps) {
  const { formData, errors, handleInputChange, handleSlugChange, validateForm, setFieldErrors } = useFormValidation({
    initialData,
    fields: ['title', 'slug', 'description', 'type', 'data'],
    validationRules: LESSON_VALIDATION_RULES
  });

  const [jsonError, setJsonError] = useState<string | null>(null);

  const { saving, handleSubmit } = useFormSubmission({
    onSave,
    formData,
    validateForm,
    setFieldErrors,
    errorParser: parseValidationErrors,
    dataTransform: (data) => ({
      title: data.title.trim(),
      slug: data.slug.trim(),
      description: data.description.trim(),
      type: data.type,
      data: data.data.trim() ? JSON.parse(data.data) : {}
    })
  });

  const handleJSONChange = (value: string) => handleInputChange("data", value);
  
  const handleJSONValidation = (error: string | null) => {
    setJsonError(error);
  };

  const isFormValid = () => {
    const hasRequiredFields = (
      formData.title.trim().length > 0 &&
      formData.slug.trim().length > 0 &&
      formData.description.trim().length > 0 &&
      formData.type.length > 0 &&
      formData.data.trim().length > 0
    );
    
    return hasRequiredFields && !jsonError && Object.keys(errors).length === 0;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <RequiredFieldsNotice />
      <FormErrorSummary errors={errors} />
      
      <FormField type="text" name="title" label="Title" value={formData.title} onChange={handleInputChange} error={errors.title} placeholder="Enter lesson title" required />
      <FormField type="text" name="slug" label="Slug" value={formData.slug} onChange={(_, value) => handleSlugChange(value)} error={errors.slug} placeholder="lesson-slug" className="font-mono text-sm" helpText="URL-friendly identifier. Auto-generated from title." required />
      <FormField type="textarea" name="description" label="Description" value={formData.description} onChange={handleInputChange} error={errors.description} placeholder="Enter lesson description" rows={3} required />
      <FormField type="select" name="type" label="Type" value={formData.type} onChange={handleInputChange} error={errors.type} options={LESSON_TYPES} required />
      
      <FormField
        type="custom"
        name="data"
        label="Lesson Data (JSON)"
        error={errors.data}
        helpText="Required JSON data for lesson-specific configuration and content."
        required
      >
        <JSONEditor
          value={formData.data}
          onChange={handleJSONChange}
          onValidation={handleJSONValidation}
          placeholder="Enter lesson data as valid JSON..."
        />
      </FormField>
      
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