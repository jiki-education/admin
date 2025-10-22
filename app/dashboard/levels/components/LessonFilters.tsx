"use client";
import { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import type { AdminLesson } from "../types";

interface LessonFiltersProps {
  lessons: AdminLesson[];
  onFilterChange: (filteredLessons: AdminLesson[]) => void;
  className?: string;
}

const LESSON_TYPES = [
  { value: "", label: "All types" },
  { value: "exercise", label: "Exercise" },
  { value: "tutorial", label: "Tutorial" },
  { value: "video", label: "Video" },
  { value: "reading", label: "Reading" },
  { value: "quiz", label: "Quiz" },
  { value: "project", label: "Project" },
  { value: "assessment", label: "Assessment" }
];

export default function LessonFilters({
  lessons,
  onFilterChange,
  className = ""
}: LessonFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Apply filters whenever search term, type, or lessons change
    let filteredLessons = [...lessons];

    // Filter by search term (title and description)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filteredLessons = filteredLessons.filter(lesson =>
        lesson.title.toLowerCase().includes(searchLower) ||
        (lesson.description && lesson.description.toLowerCase().includes(searchLower)) ||
        lesson.slug.toLowerCase().includes(searchLower)
      );
    }

    // Filter by type
    if (selectedType) {
      filteredLessons = filteredLessons.filter(lesson => lesson.type === selectedType);
    }

    onFilterChange(filteredLessons);
  }, [searchTerm, selectedType, lessons, onFilterChange]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedType("");
  };

  const hasActiveFilters = searchTerm.trim() || selectedType;
  const totalLessons = lessons.length;
  
  // Count lessons by type for the dropdown
  const typeCounts = lessons.reduce((acc, lesson) => {
    acc[lesson.type] = (acc[lesson.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1">
          <label htmlFor="lesson-search" className="sr-only">
            Search lessons
          </label>
          <input
            id="lesson-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search lessons by title, description, or slug..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-blue-50 border-blue-300 dark:bg-blue-900/30" : ""}
            aria-expanded={showFilters}
            aria-controls="advanced-filters"
          >
            <span className="hidden sm:inline">{showFilters ? "Hide Filters" : "Show Filters"}</span>
            <span className="sm:hidden">Filters</span>
          </Button>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/30"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div id="advanced-filters" className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Type Filter */}
            <div>
              <label htmlFor="lesson-type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lesson Type
              </label>
              <select
                id="lesson-type-filter"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
              >
                {LESSON_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                    {type.value && typeCounts[type.value] ? ` (${typeCounts[type.value]})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Lesson Count Summary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Summary
              </label>
              <div className="p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div>Total: {totalLessons} lessons</div>
                  {hasActiveFilters && (
                    <div className="text-blue-600 dark:text-blue-400 font-medium">
                      Filtered results will show here
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-gray-600 dark:text-gray-400">Active filters:</span>
          {searchTerm.trim() && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              Search: &quot;{searchTerm.trim()}&quot;
            </span>
          )}
          {selectedType && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              Type: {LESSON_TYPES.find(t => t.value === selectedType)?.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}