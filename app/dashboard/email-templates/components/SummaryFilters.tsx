import React from "react";
import type { EmailTemplateType } from "../types";

export interface SummaryFilters {
  type?: string;
  localeStatus?: "all" | "missing" | "wip" | "complete";
  search?: string;
}

interface SummaryFiltersProps {
  filters: SummaryFilters;
  onFiltersChange: (filters: SummaryFilters) => void;
  templateTypes: EmailTemplateType[];
  onClearFilters: () => void;
}

function SummaryFilters({ 
  filters, 
  onFiltersChange, 
  templateTypes, 
  onClearFilters 
}: SummaryFiltersProps) {
  const handleFilterChange = (key: keyof SummaryFilters, value: string) => {
    const newFilters = { ...filters };
    if (value === "") {
      delete newFilters[key];
    } else {
      if (key === "localeStatus") {
        newFilters[key] = value as "all" | "missing" | "wip" | "complete";
      } else {
        newFilters[key] = value;
      }
    }
    onFiltersChange(newFilters);
  };

  const hasActiveFilters = Object.keys(filters).some(key => 
    filters[key as keyof SummaryFilters] !== undefined && 
    filters[key as keyof SummaryFilters] !== ""
  );

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Template Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Template Type
          </label>
          <select
            value={filters.type || ""}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Types</option>
            {templateTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Locale Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Locale Status
          </label>
          <select
            value={filters.localeStatus || "all"}
            onChange={(e) => handleFilterChange("localeStatus", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Templates</option>
            <option value="complete">Complete (all locales implemented)</option>
            <option value="missing">Has Missing Locales</option>
            <option value="wip">Has WIP Locales</option>
          </select>
        </div>

        {/* Search Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search Template Slug
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by slug..."
              value={filters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClearFilters}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default SummaryFilters;