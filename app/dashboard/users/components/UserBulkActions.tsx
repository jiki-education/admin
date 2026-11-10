import { useState } from "react";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";
import type { UserBulkAction } from "../types";

interface UserBulkActionsProps {
  selectedCount: number;
  loading?: boolean;
  onApply: (action: UserBulkAction) => void;
  onClearSelection: () => void;
}

const ACTION_OPTIONS: { value: UserBulkAction; label: string }[] = [
  { value: "set_internal", label: "Set as Internal" }
];

export default function UserBulkActions({
  selectedCount,
  loading = false,
  onApply,
  onClearSelection
}: UserBulkActionsProps) {
  const [action, setAction] = useState<UserBulkAction | "">("");

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 dark:bg-blue-900/20 dark:border-blue-800">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            {selectedCount} user{selectedCount !== 1 ? "s" : ""} selected
          </span>
          <button
            type="button"
            onClick={onClearSelection}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 focus:outline-none focus:underline"
          >
            Clear selection
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-56" aria-label="Bulk action">
            <Select
              options={ACTION_OPTIONS}
              placeholder="Choose an action"
              value={action}
              onChange={(value) => setAction(value as UserBulkAction)}
            />
          </div>
          <Button size="sm" disabled={!action || loading} onClick={() => handleApply()}>
            {loading ? "Applying..." : "Apply"}
          </Button>
        </div>
      </div>
    </div>
  );

  function handleApply() {
    if (action) {
      onApply(action);
    }
  }
}
