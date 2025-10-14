import React from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import type { AdminLesson } from "../types";

interface LessonTableProps {
  lessons: AdminLesson[];
  loading?: boolean;
  onReorder: (lessonId: number, direction: "up" | "down") => Promise<void>;
  levelId: number;
}

export default function LessonTable({
  lessons,
  loading = false,
  onReorder,
  levelId
}: LessonTableProps) {
  const router = useRouter();
  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-8 text-center">
          <div className="text-gray-600 dark:text-gray-400">Loading lessons...</div>
        </div>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-8 text-center">
          <div className="text-gray-600 dark:text-gray-400 mb-4">No lessons found</div>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            This level doesn&apos;t have any lessons yet.
          </p>
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

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[900px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
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
                <TableRow key={lesson.id}>
                  <TableCell className="px-5 py-4 text-start">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      {lesson.position}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {lesson.title}
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      {lesson.type}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                      {lesson.slug}
                    </code>
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
                        className="w-8 h-8 p-0 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => handleMoveDown(lesson)}
                        disabled={!canMoveDown(index)}
                        className="w-8 h-8 p-0 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
                        title="Move down"
                      >
                        ↓
                      </button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditLesson(lesson)}
                      >
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
  );
}