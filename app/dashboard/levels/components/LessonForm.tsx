"use client";
import { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import JSONEditor from "./JSONEditor";
import { generateSlug, isValidSlug } from "@/lib/utils/slug";
import { ApiError } from "@/lib/api/client";
import type { AdminLesson, CreateLessonData } from "../types";

interface LessonFormProps {
  initialData?: Partial<AdminLesson>;
  onSave: (data: CreateLessonData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  mode: 'create' | 'edit';
  levelId: number;
}

const LESSON_TYPES = [
  { value: "exercise", label: "Exercise" },
  { value: "tutorial", label: "Tutorial" },
  { value: "video", label: "Video" },
  { value: "reading", label: "Reading" },
  { value: "quiz", label: "Quiz" },
  { value: "project", label: "Project" },
  { value: "assessment", label: "Assessment" }
];

/**
 * Parse Rails validation error messages into field-specific errors
 * Example: "Validation failed: Title can't be blank, Slug has already been taken"
 */
function parseValidationErrors(message: string): Record<string, string> {
  const errors: Record<string, string> = {};
  
  // Remove "Validation failed: " prefix if present
  const cleanMessage = message.replace(/^Validation failed:\s*/, "");
  
  // Split by comma and process each error
  const errorParts = cleanMessage.split(", ");
  
  for (const part of errorParts) {
    // Match patterns like "Title can't be blank" or "Slug has already been taken"
    const match = part.match(/^([A-Za-z_]+)\s+(.+)$/);
    
    if (match) {
      const [, field, error] = match;
      const fieldKey = field.toLowerCase();
      errors[fieldKey] = `${field} ${error}`;
    } else {
      // If we can't parse the field, add to general errors
      errors.general = part;
    }
  }
  
  // If no field-specific errors were found, treat the whole message as general
  if (Object.keys(errors).length === 0) {
    errors.general = message;
  }
  
  return errors;
}

export default function LessonForm({
  initialData,
  onSave,
  onCancel,
  loading = false,
  mode,
  levelId: _levelId
}: LessonFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    type: initialData?.type || "exercise",
    data: JSON.stringify(initialData?.data || {}, null, 2)
  });
  
  const [slugTouched, setSlugTouched] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        type: initialData.type || "exercise",
        data: JSON.stringify(initialData.data || {}, null, 2)
      });
    }
  }, [initialData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from title if slug hasn't been manually edited
    if (field === "title" && !slugTouched) {
      const autoSlug = generateSlug(value);
      setFormData(prev => ({
        ...prev,
        slug: autoSlug
      }));
    }

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    handleInputChange("slug", value);
  };

  const handleJSONChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      data: value
    }));
  };

  const handleJSONValidation = (error: string | null) => {
    setJsonError(error);
    if (error) {
      setErrors(prev => ({ ...prev, data: error }));
    } else {
      setErrors(prev => {
        const { data: _data, ...rest } = prev;
        return rest;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    } else if (!isValidSlug(formData.slug)) {
      newErrors.slug = "Slug must contain only lowercase letters, numbers, and hyphens";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.type) {
      newErrors.type = "Lesson type is required";
    }

    if (!formData.data.trim()) {
      newErrors.data = "Lesson data is required";
    } else if (jsonError) {
      newErrors.data = jsonError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      
      let parsedData = {};
      if (formData.data.trim()) {
        try {
          parsedData = JSON.parse(formData.data);
        } catch {
          setErrors({ data: "Invalid JSON format. Please check your JSON data." });
          return;
        }
      }

      const lessonData: CreateLessonData = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        type: formData.type,
        data: parsedData
      };

      await onSave(lessonData);
    } catch (error) {
      console.error("Failed to save lesson:", error);
      
      // Handle API validation errors
      if (error instanceof ApiError && error.status === 422) {
        // Parse backend validation errors
        const errorData = error.data as { error?: { message?: string } };
        const errorMessage = errorData?.error?.message;
        
        if (errorMessage) {
          // Parse Rails validation error messages
          const fieldErrors = parseValidationErrors(errorMessage);
          setErrors(fieldErrors);
        } else {
          setErrors({ general: "Validation failed. Please check your input." });
        }
      } else if (error instanceof ApiError) {
        setErrors({ general: `API Error: ${error.status} ${error.statusText}` });
      } else if (error instanceof Error) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: "Failed to save lesson. Please try again." });
      }
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = () => {
    // Check basic form requirements
    const hasRequiredFields = (
      formData.title.trim().length > 0 &&
      formData.slug.trim().length > 0 &&
      formData.description.trim().length > 0 &&
      formData.type.length > 0 &&
      formData.data.trim().length > 0 &&
      isValidSlug(formData.slug)
    );
    
    // Check for client-side validation errors (but not server-side errors)
    const hasClientErrors = jsonError !== null;
    
    return hasRequiredFields && !hasClientErrors;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Required Fields Notice */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 pb-2">
        <span>Fields marked with</span>
        <span className="text-red-500 font-bold">*</span>
        <span>are required</span>
      </div>

      {/* Error Summary Box */}
      {Object.keys(errors).length > 0 && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-700">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-400 dark:text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                Please fix the following {Object.keys(errors).length === 1 ? 'error' : 'errors'}:
              </h3>
              <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
                {errors.general && (
                  <li className="flex items-start space-x-2">
                    <span className="font-medium">•</span>
                    <span>{errors.general}</span>
                  </li>
                )}
                {errors.title && (
                  <li className="flex items-start space-x-2">
                    <span className="font-medium">•</span>
                    <span><strong>Title <span className="text-red-600">*</span>:</strong> {errors.title.replace(/^Title\s+/i, '')}</span>
                  </li>
                )}
                {errors.slug && (
                  <li className="flex items-start space-x-2">
                    <span className="font-medium">•</span>
                    <span><strong>Slug <span className="text-red-600">*</span>:</strong> {errors.slug.replace(/^Slug\s+/i, '')}</span>
                  </li>
                )}
                {errors.description && (
                  <li className="flex items-start space-x-2">
                    <span className="font-medium">•</span>
                    <span><strong>Description <span className="text-red-600">*</span>:</strong> {errors.description.replace(/^Description\s+/i, '')}</span>
                  </li>
                )}
                {errors.type && (
                  <li className="flex items-start space-x-2">
                    <span className="font-medium">•</span>
                    <span><strong>Type <span className="text-red-600">*</span>:</strong> {errors.type.replace(/^Type\s+/i, '')}</span>
                  </li>
                )}
                {errors.data && (
                  <li className="flex items-start space-x-2">
                    <span className="font-medium">•</span>
                    <span><strong>Lesson Data (JSON) <span className="text-red-600">*</span>:</strong> {errors.data.replace(/^Data\s+/i, '')}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Title Field */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title <span className="text-red-500 font-bold">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          className={`w-full p-3 border rounded-lg focus:ring-blue-200 dark:bg-gray-800 dark:text-white ${
            errors.title 
              ? "border-red-300 focus:border-red-500 dark:border-red-600" 
              : "border-gray-300 focus:border-blue-500 dark:border-gray-600 dark:focus:border-blue-400"
          }`}
          placeholder="Enter lesson title"
          required
        />
        {errors.title && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-700">
            <p className="text-sm text-red-700 dark:text-red-300">{errors.title}</p>
          </div>
        )}
      </div>

      {/* Slug Field */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Slug <span className="text-red-500 font-bold">*</span>
        </label>
        <input
          type="text"
          id="slug"
          value={formData.slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          className={`w-full p-3 border rounded-lg focus:ring-blue-200 dark:bg-gray-800 dark:text-white font-mono text-sm ${
            errors.slug 
              ? "border-red-300 focus:border-red-500 dark:border-red-600" 
              : "border-gray-300 focus:border-blue-500 dark:border-gray-600 dark:focus:border-blue-400"
          }`}
          placeholder="lesson-slug"
          required
        />
        {errors.slug && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-700">
            <p className="text-sm text-red-700 dark:text-red-300">{errors.slug}</p>
          </div>
        )}
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          URL-friendly identifier. Auto-generated from title, but you can customize it.
        </p>
      </div>

      {/* Description Field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description <span className="text-red-500 font-bold">*</span>
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          rows={3}
          className={`w-full p-3 border rounded-lg focus:ring-blue-200 dark:bg-gray-800 dark:text-white ${
            errors.description 
              ? "border-red-300 focus:border-red-500 dark:border-red-600" 
              : "border-gray-300 focus:border-blue-500 dark:border-gray-600 dark:focus:border-blue-400"
          }`}
          placeholder="Enter lesson description"
          required
        />
        {errors.description && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-700">
            <p className="text-sm text-red-700 dark:text-red-300">{errors.description}</p>
          </div>
        )}
      </div>

      {/* Type Dropdown */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Type <span className="text-red-500 font-bold">*</span>
        </label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) => handleInputChange("type", e.target.value)}
          className={`w-full p-3 border rounded-lg focus:ring-blue-200 dark:bg-gray-800 dark:text-white ${
            errors.type 
              ? "border-red-300 focus:border-red-500 dark:border-red-600" 
              : "border-gray-300 focus:border-blue-500 dark:border-gray-600 dark:focus:border-blue-400"
          }`}
          required
        >
          {LESSON_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {errors.type && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-700">
            <p className="text-sm text-red-700 dark:text-red-300">{errors.type}</p>
          </div>
        )}
      </div>

      {/* JSON Data Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Lesson Data (JSON) <span className="text-red-500 font-bold">*</span>
        </label>
        <JSONEditor
          value={formData.data}
          onChange={handleJSONChange}
          onValidation={handleJSONValidation}
          placeholder="Enter lesson data as valid JSON..."
        />
        {errors.data && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-700">
            <p className="text-sm text-red-700 dark:text-red-300">{errors.data}</p>
          </div>
        )}
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Required JSON data for lesson-specific configuration and content.
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!isFormValid() || saving || loading}
        >
          {saving ? "Saving..." : mode === 'create' ? "Create Lesson" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}