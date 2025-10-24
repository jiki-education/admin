"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useRouter, useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createLesson, getAdminLevels } from "@/lib/api/levels";
import LessonForm from "../../../components/LessonForm";
import type { CreateLessonData, AdminLevel } from "../../../types";

export default function NewLesson() {
  const router = useRouter();
  const params = useParams();
  const levelId = parseInt(params.id as string);

  const [level, setLevel] = useState<AdminLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load level details to show context
  const loadLevel = useCallback(async () => {
    if (!levelId || isNaN(levelId)) {
      setError("Invalid level ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get the level from the levels list
      // Note: We use getAdminLevels since there's no single level endpoint
      const response = await getAdminLevels({});
      const foundLevel = response.results.find(l => l.id === levelId);
      
      if (!foundLevel) {
        setError("Level not found");
        return;
      }
      
      setLevel(foundLevel);
    } catch (err) {
      console.error("Failed to load level:", err);
      setError(err instanceof Error ? err.message : "Failed to load level");
    } finally {
      setLoading(false);
    }
  }, [levelId]);

  useEffect(() => {
    void loadLevel();
  }, [loadLevel]);

  const handleSaveLesson = useCallback(async (lessonData: CreateLessonData) => {
    try {
      setError(null);
      await createLesson(levelId, lessonData);
      
      // Redirect back to the level detail page
      router.push(`/dashboard/levels/${levelId}`);
    } catch (error) {
      console.error("Failed to create lesson:", error);
      
      // Re-throw error so form can handle it
      throw error;
    }
  }, [levelId, router]);

  const handleCancel = useCallback(() => {
    router.push(`/dashboard/levels/${levelId}`);
  }, [router, levelId]);

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="New Lesson" />
        
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-6">
              <div className="w-96 h-7 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="w-full h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-full h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-full h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !level) {
    return (
      <div>
        <PageBreadcrumb pageTitle="New Lesson" />
        
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                Add New Lesson
              </h1>
            </div>
            
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <p className="text-red-700 dark:text-red-400">{error || "Level not found"}</p>
              <button
                onClick={() => router.push("/dashboard/levels")}
                className="mt-2 text-sm text-red-600 dark:text-red-400 underline hover:no-underline"
              >
                Go back to levels
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="New Lesson" />
      
      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                Add New Lesson
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Adding lesson to: <span className="font-medium text-gray-700 dark:text-gray-300">{level.title}</span>
              </p>
            </div>
          </div>

          {/* Level Context Card */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/10 dark:border-blue-800">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                    {level.position}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {level.title}
                </h3>
                <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                  {level.description}
                </p>
                <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                  Slug: <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">{level.slug}</code>
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <LessonForm
            mode="create"
            levelId={levelId}
            onSave={handleSaveLesson}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}