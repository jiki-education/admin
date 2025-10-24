"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { useRouter, useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getLevelLessons, updateLesson } from "@/lib/api/levels";
import type { AdminLesson } from "../types";
import LessonTable from "../components/LessonTable";
import LessonReorderControls from "../components/LessonReorderControls";
import BulkEditModal from "../components/BulkEditModal";
import LessonFilters from "../components/LessonFilters";
import LessonFiltersSkeleton from "../components/LessonFiltersSkeleton";
import LessonErrorBoundary from "../components/LessonErrorBoundary";
import ErrorDisplay from "../components/ErrorDisplay";

export default function LevelDetail() {
  const router = useRouter();
  const params = useParams();
  const levelId = parseInt(params.id as string);

  const [lessons, setLessons] = useState<AdminLesson[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<AdminLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [selectedLessonIds, setSelectedLessonIds] = useState<number[]>([]);

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
    void loadLessons();
  }, [loadLessons]);

  const handleBack = useCallback(() => {
    router.push("/dashboard/levels");
  }, [router]);

  const handleLessonsUpdate = useCallback((updatedLessons: AdminLesson[]) => {
    setLessons(updatedLessons);
  }, []);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  const handleBulkEdit = useCallback((lessonIds: number[]) => {
    setSelectedLessonIds(lessonIds);
    setShowBulkEditModal(true);
  }, []);

  const handleBulkEditSave = useCallback(async (updates: Partial<AdminLesson>) => {
    try {
      // Update each selected lesson
      const updatePromises = selectedLessonIds.map(lessonId => 
        updateLesson(levelId, lessonId, updates)
      );
      
      await Promise.all(updatePromises);
      
      // Reload lessons to reflect changes
      await loadLessons();
      
      setShowBulkEditModal(false);
      setSelectedLessonIds([]);
    } catch (error) {
      console.error("Failed to bulk update lessons:", error);
      throw error;
    }
  }, [selectedLessonIds, levelId, loadLessons]);

  const handleCloseBulkEdit = useCallback(() => {
    setShowBulkEditModal(false);
    setSelectedLessonIds([]);
  }, []);

  const handleAddNewLesson = useCallback(() => {
    router.push(`/dashboard/levels/${levelId}/lessons/new`);
  }, [router, levelId]);

  const handleFilterChange = useCallback((filtered: AdminLesson[]) => {
    setFilteredLessons(filtered);
  }, []);

  // Use the lesson reorder controls hook
  const { reorderLesson } = LessonReorderControls({
    lessons,
    levelId,
    onLessonsUpdate: handleLessonsUpdate,
    onError: handleError
  });

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Level Details" />
        
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-6">
              <div className="w-48 h-7 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
                
                <div className="mb-6">
                  <LessonFiltersSkeleton />
                </div>
                
                <LessonTable
                  lessons={[]}
                  loading={true}
                  onReorder={async () => {}}
                  levelId={levelId}
                />
              </div>
            </div>
          </div>
        </div>
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
          <ErrorDisplay
            title="Failed to load level details"
            message={error}
            onRetry={loadLessons}
            onGoBack={handleBack}
          />
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
            <LessonErrorBoundary>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-800 dark:text-white/90">
                    Lessons ({lessons.length})
                  </h2>
                  <Button onClick={handleAddNewLesson}>
                    Add New Lesson
                  </Button>
                </div>
                
                {lessons.length > 0 && (
                  <div className="mb-6">
                    <LessonFilters
                      lessons={lessons}
                      onFilterChange={handleFilterChange}
                    />
                  </div>
                )}
                
                <LessonTable
                  lessons={filteredLessons.length > 0 || lessons.length === 0 ? filteredLessons : lessons}
                  loading={loading}
                  onReorder={reorderLesson}
                  levelId={levelId}
                  onBulkEdit={handleBulkEdit}
                />
              </div>
            </LessonErrorBoundary>
          </div>
        </div>
      </div>
      
      {/* Bulk Edit Modal */}
      <BulkEditModal
        isOpen={showBulkEditModal}
        onClose={handleCloseBulkEdit}
        lessons={lessons}
        selectedLessonIds={selectedLessonIds}
        onSave={handleBulkEditSave}
      />
    </div>
  );
}