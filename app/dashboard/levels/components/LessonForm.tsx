"use client";
import { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import JSONEditor from "./JSONEditor";
import { generateSlug, isValidSlug } from "@/lib/utils/slug";
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

    if (jsonError) {
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
      // Handle API errors - could be duplicate slug, etc.
      if (error instanceof Error) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: "Failed to save lesson. Please try again." });
      }
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.title.trim().length > 0 &&
      formData.slug.trim().length > 0 &&
      formData.description.trim().length > 0 &&
      formData.type.length > 0 &&
      isValidSlug(formData.slug) &&
      !jsonError &&
      Object.keys(errors).length === 0
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Error */}
      {errors.general && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
          <p className="text-red-700 dark:text-red-400">{errors.general}</p>
        </div>
      )}

      {/* Title Field */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title *
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
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
        )}
      </div>

      {/* Slug Field */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Slug *
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
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.slug}</p>
        )}
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          URL-friendly identifier. Auto-generated from title, but you can customize it.
        </p>
      </div>

      {/* Description Field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description *
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
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
        )}
      </div>

      {/* Type Dropdown */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Type *
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
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.type}</p>
        )}
      </div>

      {/* JSON Data Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Lesson Data (JSON)
        </label>
        <JSONEditor
          value={formData.data}
          onChange={handleJSONChange}
          onValidation={handleJSONValidation}
          placeholder="Enter lesson data as valid JSON..."
        />
        {errors.data && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.data}</p>
        )}
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Optional JSON data for lesson-specific configuration and content.
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