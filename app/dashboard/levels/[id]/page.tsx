"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { useAuthStore } from "@/stores/authStore";
import { useRouter, useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getLevelLessons } from "@/lib/api/levels";
import type { AdminLesson } from "../types";
import LessonTable from "../components/LessonTable";
import LessonReorderControls from "../components/LessonReorderControls";

export default function LevelDetail() {
  const { isAuthenticated, hasCheckedAuth, checkAuth } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const levelId = parseInt(params.id as string);

  const [lessons, setLessons] = useState<AdminLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasCheckedAuth) {
      void checkAuth();
    }
  }, [hasCheckedAuth, checkAuth]);

  useEffect(() => {
    if (hasCheckedAuth && !isAuthenticated) {
      router.push("/signin");
    }
  }, [isAuthenticated, hasCheckedAuth, router]);

  const loadLessons = useCallback(async () => {
    if (!levelId || isNaN(levelId)) {
      setError("Invalid level ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const lessonsData = await getLevelLessons(levelId);
      setLessons(lessonsData);
    } catch (err) {
      console.error("Failed to load lessons:", err);
      setError(err instanceof Error ? err.message : "Failed to load lessons");
    } finally {
      setLoading(false);
    }
  }, [levelId]);

  useEffect(() => {
    if (isAuthenticated) {
      void loadLessons();
    }
  }, [isAuthenticated, loadLessons]);

  const handleBack = useCallback(() => {
    router.push("/dashboard/levels");
  }, [router]);

  const handleLessonsUpdate = useCallback((updatedLessons: AdminLesson[]) => {
    setLessons(updatedLessons);
  }, []);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  // Use the lesson reorder controls hook
  const { reorderLesson } = LessonReorderControls({
    lessons,
    levelId,
    onLessonsUpdate: handleLessonsUpdate,
    onError: handleError
  });

  if (!hasCheckedAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading level details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Level Details" />
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Level Details
            </h1>
            <Button variant="outline" onClick={handleBack}>
              Back to Levels
            </Button>
          </div>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Level Details" />
      
      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Level Details (ID: {levelId})
            </h1>
            <Button variant="outline" onClick={handleBack}>
              Back to Levels
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">
                Lessons ({lessons.length})
              </h2>
              
              <LessonTable
                lessons={lessons}
                loading={loading}
                onReorder={reorderLesson}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}