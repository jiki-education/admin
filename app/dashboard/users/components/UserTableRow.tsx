import { TableCell, TableRow } from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import type { User } from "../types";

interface UserTableRowProps {
  user: User;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onDelete?: (user: User) => void;
}

export default function UserTableRow({ user, selected, onSelect, onDelete }: UserTableRowProps) {
  return (
    <TableRow className={selected ? "bg-blue-50 dark:bg-blue-900/10" : ""}>
      <TableCell className="px-5 py-4 text-start">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          aria-label={`Select user: ${user.email}`}
        />
      </TableCell>
      <TableCell className="px-5 py-4 text-start">
        <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">#{user.id}</span>
      </TableCell>
      <TableCell className="px-5 py-4 text-start">
        <div className="font-medium text-gray-900 dark:text-white">{user.name || "—"}</div>
      </TableCell>
      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
        {user.email}
      </TableCell>
      <TableCell className="px-5 py-4 text-start">
        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          {user.locale.toUpperCase()}
        </span>
      </TableCell>
      <TableCell className="px-5 py-4 text-start">
        {user.admin ? (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            Admin
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
            User
          </span>
        )}
      </TableCell>
      <TableCell className="px-5 py-4 text-start">
        {onDelete && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(user)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
          >
            Delete
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
