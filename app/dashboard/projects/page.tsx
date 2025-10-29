"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { AdminProject, AdminProjectFilters } from "./types";
import { getAdminProjects } from "@/lib/api/projects";
import ProjectFilters from "./components/ProjectFilters";
import ProjectTable from "./components/ProjectTable";
import ProjectPagination from "./components/ProjectPagination";

export default function Projects() {
  const router = useRouter();

  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [filters, setFilters] = useState<AdminProjectFilters>({});
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

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAdminProjects(filters);
      console.debug("Response:", response);
      setProjects(response.results);
      setMeta(response.meta);
    } catch (err) {
      console.error("Failed to load projects:", err);
      setError(err instanceof Error ? err.message : "Failed to load projects");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const handleFiltersChange = useCallback((newFilters: AdminProjectFilters) => {
    // Reset to page 1 when filters change
    setFilters({ ...newFilters, page: 1 });
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prevFilters) => ({ ...prevFilters, page }));
  }, []);

  const handleAddNewProject = useCallback(() => {
    router.push("/dashboard/projects/new");
  }, [router]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Projects" />

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Project Management</h1>
            <Button onClick={handleAddNewProject}>Add New Project</Button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <ProjectFilters filters={filters} onFiltersChange={handleFiltersChange} onClearFilters={handleClearFilters} />

          <ProjectTable projects={projects} loading={loading} error={error} onRetry={loadProjects} />

          <ProjectPagination
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