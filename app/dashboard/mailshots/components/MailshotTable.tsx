import React from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { isDraft, statusLabel } from "../status";
import type { Mailshot } from "../types";

interface MailshotTableProps {
  mailshots: Mailshot[];
  loading?: boolean;
  onDelete?: (mailshot: Mailshot) => void;
}

const headerClass = "px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400";

export default function MailshotTable({ mailshots, loading = false, onDelete }: MailshotTableProps) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-8 text-center text-gray-600 dark:text-gray-400">Loading mailshots...</div>
      </div>
    );
  }

  if (mailshots.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-8 text-center">
          <div className="mb-4 text-gray-600 dark:text-gray-400">No mailshots found</div>
          <p className="text-sm text-gray-500 dark:text-gray-500">Create one to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[900px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className={headerClass}>
                  Slug
                </TableCell>
                <TableCell isHeader className={headerClass}>
                  Subject
                </TableCell>
                <TableCell isHeader className={headerClass}>
                  Status
                </TableCell>
                <TableCell isHeader className={headerClass}>
                  Sent
                </TableCell>
                <TableCell isHeader className={headerClass}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {mailshots.map((mailshot) => (
                <TableRow key={mailshot.id}>
                  <TableCell className="px-5 py-4 text-start">
                    <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{mailshot.slug}</span>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                    {mailshot.subject || "—"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <Badge color={isDraft(mailshot) ? "light" : "success"}>{statusLabel(mailshot)}</Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                    {mailshot.sent_count}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/mailshots/${mailshot.id}/edit`}>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </Link>
                      {onDelete && isDraft(mailshot) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDelete(mailshot)}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                        >
                          Delete
                        </Button>
                      )}
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
