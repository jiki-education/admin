import React from "react";
import Pagination from "@/components/ui/pagination/Pagination";
import Select from "@/components/form/Select";

interface MailshotPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

const itemsPerPageOptions = [
  { value: "10", label: "10 per page" },
  { value: "25", label: "25 per page" },
  { value: "50", label: "50 per page" },
  { value: "100", label: "100 per page" }
];

export default function MailshotPagination({
  currentPage,
  totalPages,
  totalCount,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange
}: MailshotPaginationProps) {
  return (
    <div className="mt-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">Items per page:</span>
        <div className="w-40">
          <Select
            options={itemsPerPageOptions}
            value={itemsPerPage.toString()}
            onChange={(value) => onItemsPerPageChange(parseInt(value, 10))}
          />
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={onPageChange}
        itemLabel="mailshots"
      />
    </div>
  );
}
