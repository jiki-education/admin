import React from "react";
import Pagination from "@/components/ui/pagination/Pagination";

interface ProjectPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export default function ProjectPagination({ currentPage, totalPages, totalCount, onPageChange }: ProjectPaginationProps) {
  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalCount={totalCount}
      onPageChange={onPageChange}
      itemLabel="projects"
    />
  );
}