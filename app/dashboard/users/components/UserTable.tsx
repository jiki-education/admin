import React from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import type { User } from "../types";
import UserTableRow from "./UserTableRow";

interface UserTableProps {
  users: User[];
  loading?: boolean;
  selectedIds: Set<number>;
  onSelectionChange: (selectedIds: Set<number>) => void;
  onDelete?: (user: User) => void;
}

const COLUMNS = ["ID", "Name", "Email", "Locale", "Admin", "Internal", "Actions"];
const HEADER_CLASS = "px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400";

export default function UserTable({
  users,
  loading = false,
  selectedIds,
  onSelectionChange,
  onDelete
}: UserTableProps) {
  if (loading) {
    return <TableMessage title="Loading users..." />;
  }

  if (users.length === 0) {
    return <TableMessage title="No users found" subtitle="Try adjusting your filters or check back later." />;
  }

  const allSelected = users.every((user) => selectedIds.has(user.id));

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[900px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className={`${HEADER_CLASS} w-12`}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    aria-label="Select all users"
                  />
                </TableCell>
                {COLUMNS.map((column) => (
                  <TableCell key={column} isHeader className={HEADER_CLASS}>
                    {column}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {users.map((user) => (
                <UserTableRow
                  key={user.id}
                  user={user}
                  selected={selectedIds.has(user.id)}
                  onSelect={(checked) => handleSelectUser(user.id, checked)}
                  onDelete={onDelete}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );

  function handleSelectAll(checked: boolean) {
    onSelectionChange(checked ? new Set(users.map((user) => user.id)) : new Set());
  }

  function handleSelectUser(userId: number, checked: boolean) {
    const next = new Set(selectedIds);
    if (checked) {
      next.add(userId);
    } else {
      next.delete(userId);
    }
    onSelectionChange(next);
  }
}

function TableMessage({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="p-8 text-center">
        <div className={`text-gray-600 dark:text-gray-400 ${subtitle ? "mb-4" : ""}`}>{title}</div>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}
