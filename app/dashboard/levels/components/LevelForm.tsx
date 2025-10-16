"use client";
import { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import { generateSlug, isValidSlug } from "@/lib/utils/slug";
import type { AdminLevel, CreateLevelData } from "../types";

interface LevelFormProps {
  initialData?: Partial<AdminLevel>;
  onSave: (data: CreateLevelData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  mode: 'create' | 'edit';
}

export default function LevelForm({
  initialData,
  onSave,
  onCancel,
  loading = false,
  mode
}: LevelFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    description: initialData?.description || ""
  });
  
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        slug: initialData.slug || "",
        description: initialData.description || ""
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
      
      const levelData: CreateLevelData = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim()
      };

      await onSave(levelData);
    } catch (error) {
      console.error("Failed to save level:", error);
      // Handle API errors - could be duplicate slug, etc.
      if (error instanceof Error) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: "Failed to save level. Please try again." });
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
      isValidSlug(formData.slug) &&
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
          placeholder="Enter level title"
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
          placeholder="level-slug"
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
          rows={4}
          className={`w-full p-3 border rounded-lg focus:ring-blue-200 dark:bg-gray-800 dark:text-white ${
            errors.description 
              ? "border-red-300 focus:border-red-500 dark:border-red-600" 
              : "border-gray-300 focus:border-blue-500 dark:border-gray-600 dark:focus:border-blue-400"
          }`}
          placeholder="Enter level description"
          required
        />
        {errors.description && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
        )}
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
          {saving ? "Saving..." : mode === 'create' ? "Create Level" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}