import React from "react";
import Pagination from "@/components/ui/pagination/Pagination";

interface EmailTemplatePaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export default function EmailTemplatePagination({
  currentPage,
  totalPages,
  totalCount,
  onPageChange
}: EmailTemplatePaginationProps) {
  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalCount={totalCount}
      onPageChange={onPageChange}
      itemLabel="templates"
    />
  );
}