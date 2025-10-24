"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import EmailTemplateTable from "./components/EmailTemplateTable";
import TemplateFilters from "./components/TemplateFilters";
import EmailTemplateForm from "./components/EmailTemplateForm";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import EmailTemplatePagination from "./components/EmailTemplatePagination";
import TabNavigation from "./components/TabNavigation";
import SummaryTable from "./components/SummaryTable";
import SummaryFilters from "./components/SummaryFilters";
import type { EmailTemplate, EmailTemplateFilters, EmailTemplateType, EmailTemplateSummaryResponse } from "./types";
import type { SummaryFilters as SummaryFiltersType } from "./components/SummaryFilters";
import { getEmailTemplates, getEmailTemplateTypes, createEmailTemplate, deleteEmailTemplate, getEmailTemplatesSummary } from "@/lib/api/email-templates";
import { useModal } from "@/hooks/useModal";
import { useRequireAuth } from "@/lib/auth/hooks";

export default function EmailTemplates() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const router = useRouter();

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [templateTypes, setTemplateTypes] = useState<EmailTemplateType[]>([]);
  const [filters, setFilters] = useState<EmailTemplateFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<"templates" | "summary">("templates");
  
  // Summary state
  const [summaryData, setSummaryData] = useState<EmailTemplateSummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryFilters, setSummaryFilters] = useState<SummaryFiltersType>({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal states
  const createModal = useModal();
  const deleteModal = useModal();

  // Selected template for delete
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);


  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const filtersWithPage = { ...filters, page: currentPage };
      const response = await getEmailTemplates(filtersWithPage);
      setTemplates(response.results);
      setCurrentPage(response.meta.current_page);
      setTotalPages(response.meta.total_pages);
      setTotalCount(response.meta.total_count);
    } catch (err) {
      console.error("Failed to load templates:", err);
      setError(err instanceof Error ? err.message : "Failed to load templates");
      setTemplates([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  const loadTemplateTypes = useCallback(async () => {
    try {
      const types = await getEmailTemplateTypes();
      setTemplateTypes(types);
    } catch (err) {
      console.error("Failed to load template types:", err);
    }
  }, []);

  const loadSummaryData = useCallback(async () => {
    try {
      setSummaryLoading(true);
      setSummaryError(null);
      const data = await getEmailTemplatesSummary();
      setSummaryData(data);
    } catch (err) {
      console.error("Failed to load summary data:", err);
      setSummaryError(err instanceof Error ? err.message : "Failed to load summary data");
      setSummaryData(null);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      void loadTemplates();
    }
  }, [isAuthenticated, loadTemplates]);

  useEffect(() => {
    if (isAuthenticated) {
      void loadTemplateTypes();
    }
  }, [isAuthenticated, loadTemplateTypes]);

  useEffect(() => {
    if (isAuthenticated && activeTab === "summary" && !summaryData) {
      void loadSummaryData();
    }
  }, [isAuthenticated, activeTab, summaryData, loadSummaryData]);

  const handleFiltersChange = useCallback((newFilters: EmailTemplateFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
    setCurrentPage(1); // Reset to first page when filters are cleared
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleDeleteTemplate = useCallback((template: EmailTemplate) => {
    setSelectedTemplate(template);
    deleteModal.openModal();
  }, [deleteModal]);

  const handleCreateTemplate = useCallback(() => {
    setSelectedTemplate(null);
    createModal.openModal();
  }, [createModal]);

  const handleSaveTemplate = useCallback(async (templateData: Omit<EmailTemplate, 'id'>) => {
    setOperationLoading(true);
    try {
      // Create new template
      await createEmailTemplate(templateData);
      // Reload templates after successful save
      await loadTemplates();
    } catch (error) {
      console.error("Failed to save template:", error);
      throw error; // Re-throw to let the modal handle it
    } finally {
      setOperationLoading(false);
    }
  }, [loadTemplates]);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedTemplate) { return };

    setOperationLoading(true);
    try {
      await deleteEmailTemplate(selectedTemplate.id);
      // Reload templates after successful delete
      await loadTemplates();
    } catch (error) {
      console.error("Failed to delete template:", error);
      throw error; // Re-throw to let the modal handle it
    } finally {
      setOperationLoading(false);
    }
  }, [selectedTemplate, loadTemplates]);

  const handleSummaryFiltersChange = useCallback((newFilters: SummaryFiltersType) => {
    setSummaryFilters(newFilters);
  }, []);

  const handleClearSummaryFilters = useCallback(() => {
    setSummaryFilters({});
  }, []);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Email Templates" />

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Email Templates Management
            </h1>
            <Button onClick={handleCreateTemplate}>
              Create Template
            </Button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <TabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          {activeTab === "templates" && (
            <>
              <TemplateFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                templateTypes={templateTypes}
                onClearFilters={handleClearFilters}
              />

              <EmailTemplateTable
                templates={templates}
                onDelete={handleDeleteTemplate}
                loading={loading}
              />

              <EmailTemplatePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                onPageChange={handlePageChange}
              />
            </>
          )}

          {activeTab === "summary" && (
            <>
              {summaryError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
                  <p className="text-red-700 dark:text-red-400">{summaryError}</p>
                </div>
              )}
              
              {summaryLoading && (
                <div className="text-center py-12">
                  <div className="text-lg text-gray-500 dark:text-gray-400">Loading summary...</div>
                </div>
              )}
              
              {!summaryLoading && !summaryError && summaryData && (
                <>
                  <SummaryFilters
                    filters={summaryFilters}
                    onFiltersChange={handleSummaryFiltersChange}
                    templateTypes={templateTypes}
                    onClearFilters={handleClearSummaryFilters}
                  />
                  
                  <SummaryTable
                    summaryData={summaryData}
                    filters={summaryFilters}
                  />
                </>
              )}
              
              {!summaryLoading && !summaryError && !summaryData && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No summary data available
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Template Modal */}
      <EmailTemplateForm
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
        onSave={handleSaveTemplate}
        template={null}
        templateTypes={templateTypes}
        loading={operationLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleConfirmDelete}
        template={selectedTemplate}
        loading={operationLoading}
      />
    </div>
  );
}