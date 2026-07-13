"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useEffect, useState } from "react";
import { getExerciseAnalytics } from "@/lib/api/analytics";
import type { ExerciseAnalyticsResponse } from "./types";
import InsightsPanel from "./components/InsightsPanel";
import ExerciseHealthTable from "./components/ExerciseHealthTable";

export default function ExerciseAnalyticsPage() {
  const [data, setData] = useState<ExerciseAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        setError(null);
        setData(await getExerciseAnalytics());
      } catch (err) {
        console.error("Failed to load exercise analytics:", err);
        setError(err instanceof Error ? err.message : "Failed to load exercise analytics");
      } finally {
        setLoading(false);
      }
    }

    void loadAnalytics();
  }, []);

  return (
    <div>
      <PageBreadcrumb pageTitle="Exercise Analytics" />

      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {loading && !error && (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="text-gray-600 dark:text-gray-400">Loading exercise analytics...</div>
          </div>
        )}

        {!loading && !error && data && (
          <>
            <InsightsPanel insights={data.insights} />
            <ExerciseHealthTable exercises={data.exercises} />
          </>
        )}
      </div>
    </div>
  );
}
