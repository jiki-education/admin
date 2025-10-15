import React from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";

interface LessonTableSkeletonProps {
  rows?: number;
}

export default function LessonTableSkeleton({ rows = 5 }: LessonTableSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[900px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-12"
                >
                  <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Position
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Title
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Type
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Slug
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Description
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {Array.from({ length: rows }).map((_, index) => (
                <TableRow key={index}>
                  {/* Checkbox skeleton */}
                  <TableCell className="px-5 py-4 text-start">
                    <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </TableCell>
                  
                  {/* Position skeleton */}
                  <TableCell className="px-5 py-4 text-start">
                    <div className="w-8 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </TableCell>
                  
                  {/* Title skeleton */}
                  <TableCell className="px-5 py-4 text-start">
                    <div className="w-32 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </TableCell>
                  
                  {/* Type skeleton */}
                  <TableCell className="px-5 py-4 text-start">
                    <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </TableCell>
                  
                  {/* Slug skeleton */}
                  <TableCell className="px-5 py-4 text-start">
                    <div className="w-24 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </TableCell>
                  
                  {/* Description skeleton */}
                  <TableCell className="px-5 py-4 text-start max-w-xs">
                    <div className="w-40 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </TableCell>
                  
                  {/* Actions skeleton */}
                  <TableCell className="px-5 py-4 text-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="w-12 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}