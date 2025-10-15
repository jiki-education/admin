"use client";
import { useState } from "react";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import type { AdminLesson } from "../types";

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessons: AdminLesson[];
  selectedLessonIds: number[];
  onSave: (updates: Partial<AdminLesson>) => Promise<void>;
}

const LESSON_TYPES = [
  { value: "", label: "Keep current type" },
  { value: "exercise", label: "Exercise" },
  { value: "tutorial", label: "Tutorial" },
  { value: "video", label: "Video" },
  { value: "reading", label: "Reading" },
  { value: "quiz", label: "Quiz" },
  { value: "project", label: "Project" },
  { value: "assessment", label: "Assessment" }
];

export default function BulkEditModal({
  isOpen,
  onClose,
  lessons,
  selectedLessonIds,
  onSave
}: BulkEditModalProps) {
  const [formData, setFormData] = useState({
    type: "",
    description: ""
  });
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const selectedLessons = lessons.filter(lesson => selectedLessonIds.includes(lesson.id));

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const updates: Partial<AdminLesson> = {};
      if (formData.type) {
        updates.type = formData.type;
      }
      if (formData.description.trim()) {
        updates.description = formData.description.trim();
      }

      // Only save if there are actual updates
      if (Object.keys(updates).length > 0) {
        await onSave(updates);
      }
      
      onClose();
      setFormData({ type: "", description: "" });
    } catch (error) {
      console.error("Failed to bulk edit lessons:", error);
      alert("Failed to update lessons. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    onClose();
    setFormData({ type: "", description: "" });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Bulk Edit Lessons
      </h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Editing {selectedLessonIds.length} lesson{selectedLessonIds.length !== 1 ? 's' : ''}:
        </p>
        <div className="mt-2 max-h-32 overflow-y-auto">
          <ul className="text-sm text-gray-800 dark:text-gray-200">
            {selectedLessons.map(lesson => (
              <li key={lesson.id} className="truncate">
                • {lesson.title}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Field */}
        <div>
          <label htmlFor="bulk-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Change Type
          </label>
          <select
            id="bulk-type"
            value={formData.type}
            onChange={(e) => handleInputChange("type", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
          >
            {LESSON_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="bulk-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Set Description
          </label>
          <textarea
            id="bulk-description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
            placeholder="Leave empty to keep current descriptions"
          />
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Only fields with values will be updated. Empty fields will be ignored.
        </p>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
          >
            {saving ? "Updating..." : "Update Lessons"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}