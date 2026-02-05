"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { createLevel } from "@/lib/api/levels";
import LevelForm from "../components/LevelForm";
import type { CreateLevelData } from "../types";

export default function NewLevel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseSlug = searchParams.get("course");
  const [error, setError] = useState<string | null>(null);

  const handleSaveLevel = useCallback(
    async (levelData: CreateLevelData) => {
      if (!courseSlug) {
        throw new Error("No course selected");
      }
      try {
        setError(null);
        const newLevel = await createLevel(courseSlug, levelData);

        // Redirect to the new level's detail page
        router.push(`/dashboard/levels/${newLevel.id}`);
      } catch (error) {
        console.error("Failed to create level:", error);

        // Re-throw error so form can handle it
        throw error;
      }
    },
    [router, courseSlug]
  );

  const handleCancel = useCallback(() => {
    router.push("/dashboard/levels");
  }, [router]);

  return (
    <div>
      <PageBreadcrumb pageTitle="New Level" />

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Create New Level</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Add a new learning level to the platform. Position will be automatically assigned.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <LevelForm mode="create" onSave={handleSaveLevel} onCancel={handleCancel} />
        </div>
      </div>
    </div>
  );
}
