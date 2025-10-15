"use client";
import { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import JSONEditor from "./JSONEditor";
import type { AdminLesson } from "../types";

interface LessonEditFormProps {
  lesson: AdminLesson;
  onSave: (updatedLesson: Partial<AdminLesson>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
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

export default function LessonEditForm({
  lesson,
  onSave,
  onCancel,
  loading = false
}: LessonEditFormProps) {
  const [formData, setFormData] = useState({
    title: lesson.title || "",
    description: lesson.description || "",
    type: lesson.type || "exercise",
    data: JSON.stringify(lesson.data || {}, null, 2)
  });
  
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData({
      title: lesson.title || "",
      description: lesson.description || "",
      type: lesson.type || "exercise",
      data: JSON.stringify(lesson.data || {}, null, 2)
    });
  }, [lesson]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleJSONChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      data: value
    }));
  };

  const handleJSONValidation = (error: string | null) => {
    setJsonError(error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (jsonError) {
      alert("Please fix JSON errors before saving.");
      return;
    }

    try {
      setSaving(true);
      
      let parsedData = {};
      if (formData.data.trim()) {
        try {
          parsedData = JSON.parse(formData.data);
        } catch (err) {
          alert("Invalid JSON format. Please check your JSON data.");
          return;
        }
      }

      const updatedLesson: Partial<AdminLesson> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        data: parsedData
      };

      await onSave(updatedLesson);
    } catch (error) {
      console.error("Failed to save lesson:", error);
      alert("Failed to save lesson. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.title.trim().length > 0 &&
      formData.type.length > 0 &&
      !jsonError
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
          placeholder="Enter lesson title"
          required
        />
      </div>

      {/* Description Field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
          placeholder="Enter lesson description (optional)"
        />
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
          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
          required
        >
          {LESSON_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* JSON Data Editor */}
      <JSONEditor
        value={formData.data}
        onChange={handleJSONChange}
        onValidation={handleJSONValidation}
        placeholder="Enter lesson data as valid JSON..."
      />

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
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}