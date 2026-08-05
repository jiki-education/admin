"use client";
import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/button/Button";
import { isValidSlug } from "@/lib/utils/slug";
import type { AdminProject } from "../types";

interface ProjectFormProps {
  initialData?: Partial<AdminProject>;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  mode: "create" | "edit";
}

export default function ProjectForm({ initialData, onSave, onCancel, mode }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    slug: initialData?.slug || "",
    exercise_slug: initialData?.exercise_slug || ""
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value ?? "" }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [errors]
  );

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.exercise_slug.trim()) {
      newErrors.exercise_slug = "Exercise slug is required";
    } else if (formData.exercise_slug.trim().length < 3) {
      newErrors.exercise_slug = "Exercise slug must be at least 3 characters long";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    }

    // Slug format validation
    if (formData.slug && !isValidSlug(formData.slug)) {
      newErrors.slug =
        "Slug must contain only lowercase letters, numbers, and hyphens. Cannot start or end with hyphens.";
    }

    // Exercise slug format validation (should follow kebab-case pattern)
    if (formData.exercise_slug && !isValidSlug(formData.exercise_slug)) {
      newErrors.exercise_slug =
        "Exercise slug must contain only lowercase letters, numbers, and hyphens. Cannot start or end with hyphens.";
    }

    // Check for common exercise slug patterns
    if (formData.exercise_slug && formData.exercise_slug.includes("_")) {
      newErrors.exercise_slug = "Exercise slug should use hyphens (-) instead of underscores (_)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        toast.error("Please fix the form errors before submitting");
        return;
      }

      try {
        setLoading(true);

        // Prepare data based on mode
        const data = {
          slug: formData.slug.trim(),
          exercise_slug: formData.exercise_slug.trim()
        };

        await onSave(data);

        // Success toast will be shown by the parent component after navigation
        toast.success(mode === "create" ? "Project created successfully!" : "Project updated successfully!");
      } catch (error) {
        console.error("Form submission error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to save project";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [formData, mode, onSave, validateForm]
  );

  const isFormValid = () => {
    return Boolean(formData.slug.trim() && formData.exercise_slug.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Required Fields Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-700 dark:text-blue-400">
          Fields marked with <span className="text-red-500">*</span> are required.
        </p>
      </div>

      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">Please fix the following errors:</h3>
          <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Slug */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Slug <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            placeholder="project-slug"
            className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 font-mono ${
              errors.slug
                ? "border-red-300 focus:border-red-300 focus:ring-red-500/10 dark:border-red-800"
                : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800"
            }`}
          />
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">URL-friendly identifier for this project.</p>
        {errors.slug && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.slug}</p>}
      </div>

      {/* Exercise Slug */}
      <div>
        <label htmlFor="exercise_slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Exercise Slug <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            id="exercise_slug"
            name="exercise_slug"
            value={formData.exercise_slug}
            onChange={handleInputChange}
            placeholder="calculator-project"
            className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 font-mono ${
              errors.exercise_slug
                ? "border-red-300 focus:border-red-300 focus:ring-red-500/10 dark:border-red-800"
                : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800"
            }`}
          />
          {formData.exercise_slug && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span
                className={`text-xs ${
                  formData.exercise_slug.length >= 3 && formData.exercise_slug.length <= 50
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-400"
                }`}
              >
                {formData.exercise_slug.length}/50
              </span>
            </div>
          )}
        </div>
        <div className="mt-1 space-y-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            The slug of the exercise that this project represents. This should match the exercise slug in the exercise
            repository.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              Use lowercase letters, numbers, and hyphens only
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              Examples: calculator-project, tic-tac-toe, word-search
            </span>
          </div>
          {formData.exercise_slug && formData.exercise_slug.includes("_") && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              💡 Tip: Consider using hyphens (-) instead of underscores (_) for better URL compatibility
            </p>
          )}
        </div>
        {errors.exercise_slug && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.exercise_slug}</p>}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={!isFormValid() || loading}>
          {loading ? "Saving..." : mode === "create" ? "Create Project" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
