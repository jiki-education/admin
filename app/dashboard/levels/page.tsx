"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { AdminLevel, AdminLevelFilters } from "./types";
import { getAdminLevels } from "@/lib/api/levels";
import LevelFilters from "./components/LevelFilters";
import LevelTable from "./components/LevelTable";
import LevelPagination from "./components/LevelPagination";

export default function Levels() {
  const { isAuthenticated, hasCheckedAuth, checkAuth } = useAuthStore();
  const router = useRouter();

  const [levels, setLevels] = useState<AdminLevel[]>([]);
  const [filters, setFilters] = useState<AdminLevelFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{
    current_page: number;
    total_count: number;
    total_pages: number;
  }>({
    current_page: 1,
    total_count: 0,
    total_pages: 0
  });

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

  const loadLevels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAdminLevels(filters);
      console.debug('Response:', response)
      setLevels(response.results);
      setMeta(response.meta);
    } catch (err) {
      console.error("Failed to load levels:", err);
      setError(err instanceof Error ? err.message : "Failed to load levels");
      setLevels([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (isAuthenticated) {
      void loadLevels();
    }
  }, [isAuthenticated, loadLevels]);

  const handleFiltersChange = useCallback((newFilters: AdminLevelFilters) => {
    // Reset to page 1 when filters change
    setFilters({ ...newFilters, page: 1 });
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters(prevFilters => ({ ...prevFilters, page }));
  }, []);

  if (!hasCheckedAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to signin
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Levels" />

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Level Management
            </h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <LevelFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />

          <LevelTable
            levels={levels}
            loading={loading}
          />

          <LevelPagination
            currentPage={meta.current_page}
            totalPages={meta.total_pages}
            totalCount={meta.total_count}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}