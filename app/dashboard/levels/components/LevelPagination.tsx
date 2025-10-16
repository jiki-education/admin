import React from "react";
import Pagination from "@/components/ui/pagination/Pagination";

interface LevelPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export default function LevelPagination({
  currentPage,
  totalPages,
  totalCount,
  onPageChange
}: LevelPaginationProps) {
  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalCount={totalCount}
      onPageChange={onPageChange}
      itemLabel="levels"
    />
  );
}