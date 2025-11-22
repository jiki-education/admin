"use client";
import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/button/Button";
import { generateSlug, isValidSlug } from "@/lib/utils/slug";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { uploadImage } from "@/lib/api/images";
import type { AdminConcept, VideoProvider } from "../types";

interface ConceptFormProps {
  initialData?: Partial<AdminConcept>;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  mode: "create" | "edit";
}

export default function ConceptForm({ initialData, onSave, onCancel, mode }: ConceptFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    content_markdown: initialData?.content_markdown || "",
    standard_video_provider: (initialData?.standard_video_provider as VideoProvider) ?? null,
    standard_video_id: initialData?.standard_video_id ?? "",
    premium_video_provider: (initialData?.premium_video_provider as VideoProvider) ?? null,
    premium_video_id: initialData?.premium_video_id ?? ""
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugTouched, setSlugTouched] = useState(mode === "edit" || Boolean(initialData?.slug));

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleMarkdownChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, content_markdown: value }));
    
    // Clear error when user starts typing
    if (errors.content_markdown) {
      setErrors(prev => ({ ...prev, content_markdown: "" }));
    }
  }, [errors.content_markdown]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.content_markdown.trim()) {
      newErrors.content_markdown = "Content is required";
    }
    if (mode === "edit" && !formData.slug.trim()) {
      newErrors.slug = "Slug is required for updates";
    }

    // Video validation - if provider is set, ID is required
    if (formData.standard_video_provider && !formData.standard_video_id.trim()) {
      newErrors.standard_video_id = "Video ID is required when provider is selected";
    }
    if (formData.premium_video_provider && !formData.premium_video_id.trim()) {
      newErrors.premium_video_id = "Video ID is required when provider is selected";
    }

    // Slug format validation
    if (formData.slug && !isValidSlug(formData.slug)) {
      newErrors.slug = "Slug must be a valid URL-friendly format (lowercase letters, numbers, and hyphens only)";
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
        content_markdown: formData.content_markdown.trim(),
        ...(mode === "edit" && { slug: formData.slug.trim() }),
        ...(mode === "create" && formData.slug.trim() && { slug: formData.slug.trim() }),
        standard_video_provider: formData.standard_video_provider ?? null,
        standard_video_id: formData.standard_video_id.trim() || null,
        premium_video_provider: formData.premium_video_provider ?? null,
        premium_video_id: formData.premium_video_id.trim() || null
      };

      await onSave(data);
      
      // Success toast will be shown by the parent component after navigation
      toast.success(mode === "create" ? "Concept created successfully!" : "Concept updated successfully!");
    } catch (error) {
      console.error("Form submission error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save concept";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [formData, mode, onSave, validateForm]);

  const isFormValid = () => {
    return (
      formData.title.trim() &&
      formData.description.trim() &&
      formData.content_markdown.trim() &&
      (mode === "create" || formData.slug.trim()) &&
      (!formData.standard_video_provider || Boolean(formData.standard_video_id.trim())) &&
      (!formData.premium_video_provider || Boolean(formData.premium_video_id.trim()))
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
          placeholder="Enter concept title"
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
          placeholder="concept-slug"
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

      {/* Content Markdown */}
      <MarkdownEditor
        label="Content (Markdown)"
        value={formData.content_markdown}
        onChange={handleMarkdownChange}
        onImageUpload={uploadImage}
        placeholder="Enter the main content in Markdown format..."
        error={errors.content_markdown}
        required
        rows={10}
      />

      {/* Video Sections */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Video Settings</h3>
        
        {/* Standard Video */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">Standard Video</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Provider</label>
            <select
              name="standard_video_provider"
              value={formData.standard_video_provider ?? ""}
              onChange={handleInputChange}
              className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            >
              <option value="">Select provider</option>
              <option value="youtube">YouTube</option>
              <option value="mux">Mux</option>
            </select>
          </div>

          {formData.standard_video_provider && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Video ID</label>
              <input
                type="text"
                name="standard_video_id"
                value={formData.standard_video_id}
                onChange={handleInputChange}
                placeholder="Enter video ID"
                className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
                  errors.standard_video_id
                    ? "border-red-300 focus:border-red-300 focus:ring-red-500/10 dark:border-red-800"
                    : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800"
                }`}
              />
              {errors.standard_video_id && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.standard_video_id}</p>}
            </div>
          )}
        </div>

        {/* Premium Video */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">Premium Video</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Provider</label>
            <select
              name="premium_video_provider"
              value={formData.premium_video_provider ?? ""}
              onChange={handleInputChange}
              className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            >
              <option value="">Select provider</option>
              <option value="youtube">YouTube</option>
              <option value="mux">Mux</option>
            </select>
          </div>

          {formData.premium_video_provider && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Video ID</label>
              <input
                type="text"
                name="premium_video_id"
                value={formData.premium_video_id}
                onChange={handleInputChange}
                placeholder="Enter video ID"
                className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
                  errors.premium_video_id
                    ? "border-red-300 focus:border-red-300 focus:ring-red-500/10 dark:border-red-800"
                    : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800"
                }`}
              />
              {errors.premium_video_id && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.premium_video_id}</p>}
            </div>
          )}
        </div>
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
          {loading ? "Saving..." : (mode === "create" ? "Create Concept" : "Save Changes")}
        </Button>
      </div>
    </form>
  );
}