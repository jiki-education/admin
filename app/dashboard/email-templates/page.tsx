"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import EmailTemplateTable from "./components/EmailTemplateTable";
import TemplateFilters from "./components/TemplateFilters";
import EmailTemplateForm from "./components/EmailTemplateForm";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import EmailTemplatePagination from "./components/EmailTemplatePagination";
import TabNavigation from "./components/TabNavigation";
import type { EmailTemplate, EmailTemplateFilters, EmailTemplateType, EmailTemplateSummaryResponse } from "./types";
import { getEmailTemplates, getEmailTemplateTypes, createEmailTemplate, deleteEmailTemplate, getEmailTemplatesSummary } from "@/lib/api/email-templates";
import { useModal } from "@/hooks/useModal";

export default function EmailTemplates() {
  const { isAuthenticated, hasCheckedAuth, checkAuth } = useAuthStore();
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
            <div className="mt-6">
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
                <div className="space-y-6">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Found {summaryData.email_templates.length} template groups
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Slug
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Implemented Locales
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Missing Locales
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            WIP Locales
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {summaryData.email_templates.map((template, index) => {
                          const implementedLocales = template.locales;
                          const missingLocales = summaryData.locales.supported.filter(
                            locale => !implementedLocales.includes(locale)
                          );
                          const wipLocales = summaryData.locales.wip.filter(
                            locale => implementedLocales.includes(locale)
                          );
                          
                          return (
                            <tr key={`${template.type}-${template.slug}`} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                {template.type}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                {template.slug}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-wrap gap-1">
                                  {implementedLocales.map(locale => (
                                    <span key={locale} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                      {locale}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-wrap gap-1">
                                  {missingLocales.map(locale => (
                                    <span key={locale} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                      {locale}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-wrap gap-1">
                                  {wipLocales.map(locale => (
                                    <span key={locale} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                      {locale}
                                    </span>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {!summaryLoading && !summaryError && !summaryData && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No summary data available
                </div>
              )}
            </div>
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