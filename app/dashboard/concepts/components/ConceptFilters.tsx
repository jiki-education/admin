import React from "react";
import Button from "@/components/ui/button/Button";
import type { AdminConceptFilters } from "../types";

interface ConceptFiltersProps {
  filters: AdminConceptFilters;
  onFiltersChange: (filters: AdminConceptFilters) => void;
  onClearFilters: () => void;
}

export default function ConceptFilters({ filters, onFiltersChange, onClearFilters }: ConceptFiltersProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, title: e.target.value || undefined });
  };

  const hasActiveFilters = filters.title;

  return (
    <div className="mb-6 p-4 bg-gray-50 dark:bg-white/[0.02] rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
          <input
            type="text"
            placeholder="Search by title..."
            value={filters.title || ""}
            onChange={handleTitleChange}
            className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}