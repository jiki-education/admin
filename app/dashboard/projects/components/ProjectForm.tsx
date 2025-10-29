"use client";
import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/button/Button";
import { generateSlug, isValidSlug } from "@/lib/utils/slug";
import type { AdminProject } from "../types";

interface ProjectFormProps {
  initialData?: Partial<AdminProject>;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  mode: "create" | "edit";
}

export default function ProjectForm({ initialData, onSave, onCancel, mode }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    exercise_slug: initialData?.exercise_slug || ""
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugTouched, setSlugTouched] = useState(mode === "edit" || Boolean(initialData?.slug));

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value ?? "" }));
    
    // Auto-generate slug from title if slug hasn't been manually edited
    if (name === "title" && !slugTouched && mode === "create") {
      const autoSlug = generateSlug(value);
      setFormData(prev => ({ ...prev, slug: autoSlug }));
    }
    
    // Mark slug as manually edited if user types in slug field
    if (name === "slug") {
      setSlugTouched(true);
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  }, [errors, slugTouched, mode]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.exercise_slug.trim()) {
      newErrors.exercise_slug = "Exercise slug is required";
    }
    if (mode === "edit" && !formData.slug.trim()) {
      newErrors.slug = "Slug is required for updates";
    }

    // Slug format validation
    if (formData.slug && !isValidSlug(formData.slug)) {
      newErrors.slug = "Slug must be a valid URL-friendly format (lowercase letters, numbers, and hyphens only)";
    }

    // Exercise slug format validation (should follow kebab-case pattern)
    if (formData.exercise_slug && !isValidSlug(formData.exercise_slug)) {
      newErrors.exercise_slug = "Exercise slug must be a valid URL-friendly format (lowercase letters, numbers, and hyphens only)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, mode]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    try {
      setLoading(true);
      
      // Prepare data based on mode
      const data = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        exercise_slug: formData.exercise_slug.trim(),
        ...(mode === "edit" && { slug: formData.slug.trim() }),
        ...(mode === "create" && formData.slug.trim() && { slug: formData.slug.trim() })
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
  }, [formData, mode, onSave, validateForm]);

  const isFormValid = () => {
    return (
      formData.title.trim() &&
      formData.description.trim() &&
      formData.exercise_slug.trim() &&
      (mode === "create" || formData.slug.trim())
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Enter project title"
          className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
            errors.title
              ? "border-red-300 focus:border-red-300 focus:ring-red-500/10 dark:border-red-800"
              : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800"
          }`}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>}
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Slug {mode === "edit" && <span className="text-red-500">*</span>}
        </label>
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
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {mode === "create" 
            ? "URL-friendly identifier. Auto-generated from title, but you can customize it."
            : "URL-friendly identifier. Required for updates."
          }
        </p>
        {errors.slug && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.slug}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter a brief description (a couple of sentences)"
          rows={3}
          className={`w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
            errors.description
              ? "border-red-300 focus:border-red-300 focus:ring-red-500/10 dark:border-red-800"
              : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800"
          }`}
        />
        {errors.description && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>}
      </div>

      {/* Exercise Slug */}
      <div>
        <label htmlFor="exercise_slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Exercise Slug <span className="text-red-500">*</span>
        </label>
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
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          The slug of the exercise that this project represents. This should match the exercise slug in the exercise repository.
        </p>
        {errors.exercise_slug && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.exercise_slug}</p>}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!isFormValid() || loading}
        >
          {loading ? "Saving..." : (mode === "create" ? "Create Project" : "Save Changes")}
        </Button>
      </div>
    </form>
  );
}