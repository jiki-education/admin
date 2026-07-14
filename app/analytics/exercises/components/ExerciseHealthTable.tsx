"use client";
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import type { ExerciseAnalytics, SortColumn, SortDirection } from "../types";
import { COLUMNS } from "../utils/columns";
import { defaultDirectionFor, sortExercises } from "../utils/sort";
import ExerciseRow from "./ExerciseRow";

interface ExerciseHealthTableProps {
  exercises: ExerciseAnalytics[];
}

export default function ExerciseHealthTable({ exercises }: ExerciseHealthTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection(defaultDirectionFor(column));
    }
  };

  if (exercises.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-8 text-center">
          <div className="text-gray-600 dark:text-gray-400">No exercises found</div>
        </div>
      </div>
    );
  }

  const sortedExercises = sortExercises(exercises, sortColumn, sortDirection);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {COLUMNS.map((column) => (
                <TableCell
                  key={column.key}
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                >
                  <button
                    type="button"
                    onClick={() => handleSort(column.key)}
                    className="inline-flex items-center gap-1 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    {column.label}
                    {sortColumn === column.key && <span aria-hidden>{sortDirection === "asc" ? "▲" : "▼"}</span>}
                  </button>
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {sortedExercises.map((exercise) => (
              <ExerciseRow key={exercise.lesson_id} exercise={exercise} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
