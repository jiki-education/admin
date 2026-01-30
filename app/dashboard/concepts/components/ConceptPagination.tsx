import React from "react";
import Pagination from "@/components/ui/pagination/Pagination";

interface ConceptPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export default function ConceptPagination({
  currentPage,
  totalPages,
  totalCount,
  onPageChange
}: ConceptPaginationProps) {
  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalCount={totalCount}
      onPageChange={onPageChange}
      itemLabel="concepts"
    />
  );
}
