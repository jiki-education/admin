import React from "react";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import type { MailshotFilters as MailshotFiltersType } from "../types";

interface MailshotFiltersProps {
  filters: MailshotFiltersType;
  onFiltersChange: (filters: MailshotFiltersType) => void;
  onClearFilters: () => void;
}

const statusOptions = [
  { value: "draft", label: "Drafts only" },
  { value: "sent", label: "Sent only" }
];

export default function MailshotFilters({ filters, onFiltersChange, onClearFilters }: MailshotFiltersProps) {
  const handleStatusChange = (status: string) => {
    onFiltersChange({ ...filters, status: (status as MailshotFiltersType["status"]) || undefined });
  };

  const hasActiveFilters = Boolean(filters.status);

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
          <Select
            options={statusOptions}
            placeholder="All statuses"
            onChange={handleStatusChange}
            value={filters.status || ""}
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
