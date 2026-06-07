"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { reseedDatabase } from "@/lib/api/seeds";
import { useState } from "react";

export default function DangerZone() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleReseed = async () => {
    if (!window.confirm("This will reseed the database. Are you sure?")) {
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      await reseedDatabase();
      setStatus("success");
    } catch (err) {
      console.error("Failed to reseed database:", err);
      setError(err instanceof Error ? err.message : "Failed to reseed database");
      setStatus("error");
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Danger Zone" />

      <div className="space-y-6">
        <div className="rounded-xl border border-red-200 bg-white p-6 dark:border-red-800 dark:bg-white/[0.03]">
          <h1 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">Danger Zone</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Destructive operations. Proceed with caution.
          </p>

          <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-6">
            <div>
              <h2 className="text-base font-medium text-gray-800 dark:text-white/90">Reseed Database</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Runs the database seed task. This may overwrite existing data.
              </p>
            </div>
            <Button onClick={handleReseed} disabled={status === "loading"}>
              {status === "loading" ? "Reseeding..." : "Reseed DB"}
            </Button>
          </div>

          {status === "success" && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
              <p className="text-green-700 dark:text-green-400">Database reseeded successfully.</p>
            </div>
          )}

          {status === "error" && error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
