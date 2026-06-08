import GridShape from "@/components/common/GridShape";
import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

export default function Forbidden() {
  return (
    <div className="relative z-1 flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
      <GridShape />
      <div className="mx-auto w-full max-w-[472px] text-center">
        <h1 className="mb-4 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-2xl">403</h1>
        <h2 className="mb-6 text-2xl font-semibold text-gray-700 dark:text-gray-300">Access denied</h2>
        <p className="mb-10 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
          You don&apos;t have permission to access the Jiki admin dashboard. If you believe this is a mistake, contact
          an administrator.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            Back to Home Page
          </Link>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
