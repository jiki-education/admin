import React from "react";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import type { EmailTemplateFilters, EmailTemplateType } from "../types";

interface TemplateFiltersProps {
  filters: EmailTemplateFilters;
  onFiltersChange: (filters: EmailTemplateFilters) => void;
  templateTypes: EmailTemplateType[];
  onClearFilters: () => void;
}

export default function TemplateFilters({
  filters,
  onFiltersChange,
  templateTypes,
  onClearFilters
}: TemplateFiltersProps) {
  const handleTypeChange = (type: string) => {
    onFiltersChange({ ...filters, type: type || undefined });
  };

  const handleLocaleChange = (locale: string) => {
    onFiltersChange({ ...filters, locale: locale || undefined });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value || undefined });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, slug: e.target.value || undefined });
  };

  const localeOptions = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "ja", label: "Japanese" }
  ];

  const hasActiveFilters = filters.type || filters.locale || filters.search || filters.slug;

  return (
    <div className="mb-6 p-4 bg-gray-50 dark:bg-white/[0.02] rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Template Type</label>
          <Select
            options={templateTypes}
            placeholder="All types"
            onChange={handleTypeChange}
            defaultValue={filters.type || ""}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Locale</label>
          <Select
            options={localeOptions}
            placeholder="All locales"
            onChange={handleLocaleChange}
            defaultValue={filters.locale || ""}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
          <input
            type="text"
            placeholder="Search templates..."
            value={filters.search || ""}
            onChange={handleSearchChange}
            className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Slug</label>
          <input
            type="text"
            placeholder="Filter by slug..."
            value={filters.slug || ""}
            onChange={handleSlugChange}
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
