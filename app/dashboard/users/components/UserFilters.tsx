import React from "react";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import type { UserFilters as UserFiltersType } from "../types";

interface UserFiltersProps {
  filters: UserFiltersType;
  onFiltersChange: (filters: UserFiltersType) => void;
  onClearFilters: () => void;
}

export default function UserFilters({
  filters,
  onFiltersChange,
  onClearFilters
}: UserFiltersProps) {
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, email: e.target.value || undefined });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, name: e.target.value || undefined });
  };

  const handleLocaleChange = (locale: string) => {
    onFiltersChange({ ...filters, locale: locale || undefined });
  };

  const localeOptions = [
    { value: "en", label: "English" },
    { value: "hu", label: "Hungarian" }
  ];

  const hasActiveFilters = filters.email || filters.name || filters.locale;

  return (
    <div className="mb-6 p-4 bg-gray-50 dark:bg-white/[0.02] rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            type="text"
            placeholder="Search by email..."
            value={filters.email || ""}
            onChange={handleEmailChange}
            className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Name
          </label>
          <input
            type="text"
            placeholder="Search by name..."
            value={filters.name || ""}
            onChange={handleNameChange}
            className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Locale
          </label>
          <Select
            options={localeOptions}
            placeholder="All locales"
            onChange={handleLocaleChange}
            defaultValue={filters.locale || ""}
          />
        </div>
      </div>
      
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}