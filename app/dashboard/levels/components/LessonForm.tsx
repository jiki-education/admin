"use client";
import { useState, useEffect } from "react";
import JSONEditor from "./JSONEditor";
import { useFormValidation } from "../hooks/useFormValidation";
import { useFormSubmission } from "../hooks/useFormSubmission";
import { LESSON_VALIDATION_RULES, LESSON_TYPES } from "../constants/validationRules";
import { parseValidationErrors } from "../utils/errorParsing";
import RequiredFieldsNotice from "./shared/RequiredFieldsNotice";
import FormErrorSummary from "./shared/FormErrorSummary";
import FormField from "./shared/FormField";
import FormActions from "./shared/FormActions";
import { isValidSlug } from "@/lib/utils/slug";
import type { AdminLesson, CreateLessonData } from "../types";

interface LessonFormProps {
  initialData?: Partial<AdminLesson>;
  onSave: (data: CreateLessonData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  mode: 'create' | 'edit';
  levelId: number;
}

export default function LessonForm({
  initialData,
  onSave,
  onCancel,
  loading = false,
  mode,
  levelId: _levelId
}: LessonFormProps) {
  const { formData, errors, handleInputChange, handleSlugChange, validateForm, setFieldErrors } = useFormValidation({
    initialData,
    fields: ['title', 'slug', 'description', 'type', 'data'],
    validationRules: LESSON_VALIDATION_RULES
  });

  const [jsonError, setJsonError] = useState<string | null>(null);

  // Initialize JSON validation on mount and ensure type has a default value
  useEffect(() => {
    try {
      JSON.parse(formData.data || '{}');
      setJsonError(null);
    } catch {
      setJsonError("Invalid JSON format");
    }
    
    // Ensure type field has a default value
    if (!formData.type) {
      handleInputChange('type', 'exercise');
    }
  }, [formData.data, formData.type, handleInputChange]);

  const { saving, handleSubmit } = useFormSubmission({
    onSave,
    formData,
    validateForm,
    setFieldErrors,
    errorParser: parseValidationErrors,
    dataTransform: (data) => {
      let parsedData = {};
      if (data.data.trim()) {
        try {
          parsedData = JSON.parse(data.data);
        } catch {
          throw new Error("Invalid JSON format. Please check your JSON data.");
        }
      }
      
      return {
        title: data.title.trim(),
        slug: data.slug.trim(),
        description: data.description.trim(),
        type: data.type,
        data: parsedData
      };
    }
  });

  const handleJSONChange = (value: string) => {
    handleInputChange("data", value);
  };

  const handleJSONValidation = (error: string | null) => {
    setJsonError(error);
    // Also update the form validation errors
    if (error) {
      setFieldErrors({ ...errors, data: error });
    } else {
      const { data: _data, ...restErrors } = errors;
      setFieldErrors(restErrors);
    }
  };

  const handleSlugInputChange = (_field: string, value: string) => {
    handleSlugChange(value);
  };

  const isFormValid = () => {
    const titleOk = formData.title.trim().length > 0;
    const slugOk = formData.slug.trim().length > 0;
    const descriptionOk = formData.description.trim().length > 0;
    const typeOk = formData.type.length > 0;
    const dataOk = formData.data.trim().length > 0;
    const slugValidOk = isValidSlug(formData.slug);
    
    const hasRequiredFields = (
      titleOk &&
      slugOk &&
      descriptionOk &&
      typeOk &&
      dataOk &&
      slugValidOk
    );
    
    const hasClientErrors = jsonError !== null;
    
    // Debug logging
    console.log('LessonForm validation debug:', {
      formData,
      titleOk,
      slugOk,
      descriptionOk,
      typeOk,
      dataOk,
      slugValidOk,
      jsonError,
      hasRequiredFields,
      hasClientErrors,
      errors,
      finalValid: hasRequiredFields && !hasClientErrors
    });
    
    return hasRequiredFields && !hasClientErrors;
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
        placeholder="Enter lesson title"
        required
      />
      
      <FormField
        type="text"
        name="slug"
        label="Slug"
        value={formData.slug}
        onChange={handleSlugInputChange}
        error={errors.slug}
        placeholder="lesson-slug"
        className="font-mono text-sm"
        helpText="URL-friendly identifier. Auto-generated from title, but you can customize it."
        required
      />
      
      <FormField
        type="textarea"
        name="description"
        label="Description"
        value={formData.description}
        onChange={handleInputChange}
        error={errors.description}
        placeholder="Enter lesson description"
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