import React from "react";
import Button from "@/components/ui/button/Button";
import type { AdminLesson } from "../types";

interface LessonCardProps {
  lesson: AdminLesson;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export default function LessonCard({
  lesson,
  isSelected,
  onSelect,
  onMoveUp,
  onMoveDown,
  onEdit,
  canMoveUp,
  canMoveDown
}: LessonCardProps) {
  return (
    <div className={`border rounded-lg p-4 space-y-3 ${
      isSelected 
        ? "bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800" 
        : "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
    }`}>
      {/* Header with checkbox and position */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            aria-label={`Select lesson: ${lesson.title}`}
          />
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            Position {lesson.position}
          </span>
        </div>
        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          {lesson.type}
        </span>
      </div>

      {/* Title */}
      <div>
        <h3 className="font-medium text-gray-900 dark:text-white text-sm">
          {lesson.title}
        </h3>
      </div>

      {/* Slug */}
      <div>
        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">
          {lesson.slug}
        </code>
      </div>

      {/* Description */}
      {lesson.description && (
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {lesson.description}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-1">
          <button
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="w-8 h-8 p-0 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            title="Move up"
            aria-label={`Move ${lesson.title} up`}
          >
            <span aria-hidden="true">↑</span>
          </button>
          <button
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="w-8 h-8 p-0 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            title="Move down"
            aria-label={`Move ${lesson.title} down`}
          >
            <span aria-hidden="true">↓</span>
          </button>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onEdit}
        >
          Edit
        </Button>
      </div>
    </div>
  );
}