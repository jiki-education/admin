import React from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import type { AdminConcept } from "../types";

interface ConceptTableProps {
  concepts: AdminConcept[];
  loading?: boolean;
}

export default function ConceptTable({ concepts, loading = false }: ConceptTableProps) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-8 text-center">
          <div className="text-gray-600 dark:text-gray-400">Loading concepts...</div>
        </div>
      </div>
    );
  }

  if (concepts.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-8 text-center">
          <div className="text-gray-600 dark:text-gray-400 mb-4">No concepts found</div>
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
                  Description
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Videos
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
              {concepts.map((concept) => (
                <TableRow key={concept.id}>
                  <TableCell className="px-5 py-4 text-start">
                    <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">#{concept.id}</span>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <div className="font-medium text-gray-900 dark:text-white">{concept.title}</div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">{concept.slug}</code>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start max-w-xs">
                    <div className="text-gray-600 dark:text-gray-400 text-sm truncate">
                      {concept.description || "No description"}
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <div className="flex flex-col gap-1">
                      {concept.standard_video_provider && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Standard: {concept.standard_video_provider}
                        </span>
                      )}
                      {concept.premium_video_provider && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                          Premium: {concept.premium_video_provider}
                        </span>
                      )}
                      {!concept.standard_video_provider && !concept.premium_video_provider && (
                        <span className="text-gray-400 text-xs">No videos</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <Link href={`/dashboard/concepts/${concept.id}`}>
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