"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { AdminConcept, AdminConceptFilters } from "./types";
import { getAdminConcepts } from "@/lib/api/concepts";
import ConceptFilters from "./components/ConceptFilters";
import ConceptTable from "./components/ConceptTable";
import ConceptPagination from "./components/ConceptPagination";

export default function Concepts() {
  const router = useRouter();

  const [concepts, setConcepts] = useState<AdminConcept[]>([]);
  const [filters, setFilters] = useState<AdminConceptFilters>({});
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

  const loadConcepts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAdminConcepts(filters);
      console.debug("Response:", response);
      setConcepts(response.results);
      setMeta(response.meta);
    } catch (err) {
      console.error("Failed to load concepts:", err);
      setError(err instanceof Error ? err.message : "Failed to load concepts");
      setConcepts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void loadConcepts();
  }, [loadConcepts]);

  const handleFiltersChange = useCallback((newFilters: AdminConceptFilters) => {
    // Reset to page 1 when filters change
    setFilters({ ...newFilters, page: 1 });
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prevFilters) => ({ ...prevFilters, page }));
  }, []);

  const handleAddNewConcept = useCallback(() => {
    router.push("/dashboard/concepts/new");
  }, [router]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Concepts" />

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Concept Management</h1>
            <Button onClick={handleAddNewConcept}>Add New Concept</Button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <ConceptFilters filters={filters} onFiltersChange={handleFiltersChange} onClearFilters={handleClearFilters} />

          <ConceptTable concepts={concepts} loading={loading} />

          <ConceptPagination
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