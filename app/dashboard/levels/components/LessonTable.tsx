import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import LessonTableSkeleton from "./LessonTableSkeleton";
import LessonCard from "./LessonCard";
import type { AdminLesson } from "../types";

interface LessonTableProps {
  lessons: AdminLesson[];
  loading?: boolean;
  onReorder: (lessonId: number, direction: "up" | "down") => Promise<void>;
  levelId: number;
  onBulkEdit?: (lessonIds: number[]) => void;
}

export default function LessonTable({ lessons, loading = false, onReorder, levelId, onBulkEdit }: LessonTableProps) {
  const router = useRouter();
  const [selectedLessons, setSelectedLessons] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Reset selection when lessons change
  useEffect(() => {
    setSelectedLessons(new Set());
    setSelectAll(false);
  }, [lessons]);
  if (loading) {
    return <LessonTableSkeleton rows={5} />;
  }

  if (lessons.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-8 text-center">
          <div className="text-gray-600 dark:text-gray-400 mb-4">No lessons found</div>
          <p className="text-sm text-gray-500 dark:text-gray-500">This level doesn&apos;t have any lessons yet.</p>
        </div>
      </div>
    );
  }

  const sortedLessons = [...lessons].sort((a, b) => a.position - b.position);

  const handleMoveUp = async (lesson: AdminLesson) => {
    await onReorder(lesson.id, "up");
  };

  const handleMoveDown = async (lesson: AdminLesson) => {
    await onReorder(lesson.id, "down");
  };

  const canMoveUp = (index: number) => index > 0;
  const canMoveDown = (index: number) => index < sortedLessons.length - 1;

  const handleEditLesson = (lesson: AdminLesson) => {
    router.push(`/dashboard/levels/${levelId}/lessons/${lesson.id}/edit`);
  };

  const handleSelectLesson = (lessonId: number, checked: boolean) => {
    const newSelected = new Set(selectedLessons);
    if (checked) {
      newSelected.add(lessonId);
    } else {
      newSelected.delete(lessonId);
    }
    setSelectedLessons(newSelected);
    setSelectAll(newSelected.size === sortedLessons.length);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = sortedLessons.map((lesson) => lesson.id);
      setSelectedLessons(new Set(allIds));
    } else {
      setSelectedLessons(new Set());
    }
    setSelectAll(checked);
  };

  const handleBulkEdit = () => {
    if (onBulkEdit && selectedLessons.size > 0) {
      onBulkEdit(Array.from(selectedLessons));
    }
  };

  const selectedCount = selectedLessons.size;

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 dark:bg-blue-900/20 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {selectedCount} lesson{selectedCount !== 1 ? "s" : ""} selected
              </span>
              <button
                onClick={() => setSelectedLessons(new Set())}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 focus:outline-none focus:underline"
              >
                Clear selection
              </button>
            </div>
            <div className="flex items-center gap-2">
              {onBulkEdit && (
                <Button size="sm" onClick={handleBulkEdit} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Bulk Edit
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Card View (hidden on larger screens) */}
      <div className="block md:hidden space-y-3">
        {sortedLessons.map((lesson, index) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            isSelected={selectedLessons.has(lesson.id)}
            onSelect={(checked) => handleSelectLesson(lesson.id, checked)}
            onMoveUp={() => handleMoveUp(lesson)}
            onMoveDown={() => handleMoveDown(lesson)}
            onEdit={() => handleEditLesson(lesson)}
            canMoveUp={canMoveUp(index)}
            canMoveDown={canMoveDown(index)}
          />
        ))}
      </div>

      {/* Desktop Table View (hidden on smaller screens) */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[900px] lg:min-w-0">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-12"
                  >
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      aria-label="Select all lessons"
                    />
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
                {sortedLessons.map((lesson, index) => (
                  <TableRow
                    key={lesson.id}
                    className={selectedLessons.has(lesson.id) ? "bg-blue-50 dark:bg-blue-900/10" : ""}
                  >
                    <TableCell className="px-5 py-4 text-start">
                      <input
                        type="checkbox"
                        checked={selectedLessons.has(lesson.id)}
                        onChange={(e) => handleSelectLesson(lesson.id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        aria-label={`Select lesson: ${lesson.title}`}
                      />
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        {lesson.position}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <div className="font-medium text-gray-900 dark:text-white">{lesson.title}</div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        {lesson.type}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">{lesson.slug}</code>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start max-w-xs">
                      <div className="text-gray-600 dark:text-gray-400 text-sm truncate">
                        {lesson.description || "No description"}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMoveUp(lesson)}
                          disabled={!canMoveUp(index)}
                          className="w-8 h-8 p-0 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                          title="Move up"
                          aria-label={`Move ${lesson.title} up`}
                        >
                          <span aria-hidden="true">↑</span>
                        </button>
                        <button
                          onClick={() => handleMoveDown(lesson)}
                          disabled={!canMoveDown(index)}
                          className="w-8 h-8 p-0 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                          title="Move down"
                          aria-label={`Move ${lesson.title} down`}
                        >
                          <span aria-hidden="true">↓</span>
                        </button>
                        <Button size="sm" variant="outline" onClick={() => handleEditLesson(lesson)}>
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
