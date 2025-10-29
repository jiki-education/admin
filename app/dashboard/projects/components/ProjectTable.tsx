import React from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import type { AdminProject } from "../types";

interface ProjectTableProps {
  projects: AdminProject[];
  loading?: boolean;
}

export default function ProjectTable({ projects, loading = false }: ProjectTableProps) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-8 text-center">
          <div className="text-gray-600 dark:text-gray-400">Loading projects...</div>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-8 text-center">
          <div className="text-gray-600 dark:text-gray-400 mb-4">No projects found</div>
          <p className="text-sm text-gray-500 dark:text-gray-500">Try adjusting your filters or check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1000px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  ID
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
                  Slug
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Exercise Slug
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
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="px-5 py-4 text-start">
                    <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">#{project.id}</span>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <div className="font-medium text-gray-900 dark:text-white">{project.title}</div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">{project.slug}</code>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded text-xs font-mono">{project.exercise_slug}</code>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start max-w-xs">
                    <div className="text-gray-600 dark:text-gray-400 text-sm truncate">
                      {project.description || "No description"}
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <Link href={`/dashboard/projects/${project.id}`}>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </Link>
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