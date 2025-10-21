"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Pipeline, PipelineFilters as PipelineFiltersType } from "./types";
import { getPipelines, deletePipeline } from "@/lib/api/video-pipelines";
import PipelineTable from "./components/PipelineTable";
import PipelinePagination from "./components/PipelinePagination";
import DeletePipelineModal from "./components/DeletePipelineModal";

export default function VideoPipelines() {
  const { isAuthenticated, hasCheckedAuth, checkAuth } = useAuthStore();
  const router = useRouter();

  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [filters, setFilters] = useState<PipelineFiltersType>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [meta, setMeta] = useState<{
    current_page: number;
    total_count: number;
    total_pages: number;
  }>({
    current_page: 1,
    total_count: 0,
    total_pages: 0
  });

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const loadPipelines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPipelines({ ...filters, per: itemsPerPage });
      setPipelines(response.results);
      setMeta(response.meta);
    } catch (err) {
      console.error("Failed to load pipelines:", err);
      setError(err instanceof Error ? err.message : "Failed to load pipelines");
      setPipelines([]);
    } finally {
      setLoading(false);
    }
  }, [filters, itemsPerPage]);

  useEffect(() => {
    if (isAuthenticated) {
      void loadPipelines();
    }
  }, [isAuthenticated, loadPipelines]);

  const handlePageChange = useCallback((page: number) => {
    setFilters(prevFilters => ({ ...prevFilters, page }));
  }, []);

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setFilters(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleDeletePipeline = useCallback((pipeline: Pipeline) => {
    setSelectedPipeline(pipeline);
    setIsDeleteModalOpen(true);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setSelectedPipeline(null);
    setDeleteLoading(false);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedPipeline) {
      return;
    }

    setDeleteLoading(true);
    try {
      await deletePipeline(selectedPipeline.uuid);
      
      await loadPipelines();
      handleCloseDeleteModal();
    } catch (err) {
      console.error("Failed to delete pipeline:", err);
      setError(err instanceof Error ? err.message : "Failed to delete pipeline");
      setDeleteLoading(false);
    }
  }, [selectedPipeline, loadPipelines, handleCloseDeleteModal]);

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

  return (
    <div>
      <PageBreadcrumb pageTitle="Video Pipelines" />

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Video Production Pipelines
            </h1>
            <Link
              href="/dashboard/video-pipelines/new"
              className="inline-flex items-center px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
            >
              Create New Pipeline
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <PipelineTable
            pipelines={pipelines}
            loading={loading}
            onDelete={handleDeletePipeline}
          />

          <PipelinePagination
            currentPage={meta.current_page}
            totalPages={meta.total_pages}
            totalCount={meta.total_count}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      </div>

      <DeletePipelineModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        pipeline={selectedPipeline}
        loading={deleteLoading}
      />
    </div>
  );
}