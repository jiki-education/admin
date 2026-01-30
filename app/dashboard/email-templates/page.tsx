"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
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
import {
  getEmailTemplates,
  getEmailTemplateTypes,
  createEmailTemplate,
  deleteEmailTemplate,
  getEmailTemplatesSummary,
  translateEmailTemplate
} from "@/lib/api/email-templates";
import { useModal } from "@/hooks/useModal";
import { useRequireAuth } from "@/lib/auth/hooks";

export default function EmailTemplates() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();

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

  // Track which template is being translated
  const [translatingTemplateId, setTranslatingTemplateId] = useState<number | null>(null);

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

  const handleDeleteTemplate = useCallback(
    (template: EmailTemplate) => {
      setSelectedTemplate(template);
      deleteModal.openModal();
    },
    [deleteModal]
  );

  const handleCreateTemplate = useCallback(() => {
    setSelectedTemplate(null);
    createModal.openModal();
  }, [createModal]);

  const handleSaveTemplate = useCallback(
    async (templateData: Omit<EmailTemplate, "id">) => {
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
    },
    [loadTemplates]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedTemplate) {
      return;
    }

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

  const handleTranslateTemplate = useCallback(
    async (template: EmailTemplate) => {
      setOperationLoading(true);
      setTranslatingTemplateId(template.id);
      try {
        const response = await translateEmailTemplate(template.id);
        const localeNames = response.queued_locales
          .map((locale) => {
            switch (locale) {
              case "hu":
                return "Hungarian";
              case "fr":
                return "French";
              default:
                return locale.toUpperCase();
            }
          })
          .join(" and ");

        const templateName = template.subject || template.slug || `ID ${template.id}`;

        // Log detailed info for debugging
        console.log("Translation Response:", response);
        console.log("Expected locales:", response.queued_locales);
        console.log("Original template:", template);

        toast.success(
          `Translation queued successfully! The template "${templateName}" will be translated to ${localeNames}. Expected locales: ${response.queued_locales.join(", ")}. Translations may take a few moments to appear.`,
          { duration: 8000 }
        );

        // Immediately refresh to show any changes
        await loadTemplates();

        // Set up a delayed refresh to check for completed translations
        const originalSlug = template.slug;
        const expectedLocales = response.queued_locales;

        setTimeout(async () => {
          try {
            const response = await getEmailTemplates(filters);
            const currentTemplates = response.results;

            // Check which translations actually appeared
            const newTemplates = currentTemplates.filter(
              (t) => t.slug === originalSlug && expectedLocales.includes(t.locale)
            );

            const foundLocales = newTemplates.map((t) => t.locale);
            const missingLocales = expectedLocales.filter((locale) => !foundLocales.includes(locale));

            console.log("Translation check results:");
            console.log("Expected locales:", expectedLocales);
            console.log("Found locales:", foundLocales);
            console.log("Missing locales:", missingLocales);
            console.log(
              "All current templates with this slug:",
              currentTemplates.filter((t) => t.slug === originalSlug)
            );

            if (missingLocales.length === 0) {
              toast.success(`All translations completed! Found: ${foundLocales.join(", ")}`, { duration: 3000 });
            } else {
              toast.error(
                `Some translations missing! Found: ${foundLocales.join(", ") || "none"}, Missing: ${missingLocales.join(", ")}`,
                { duration: 8000 }
              );
            }

            // Refresh the UI with the new data
            await loadTemplates();
          } catch (error) {
            console.error("Failed to refresh templates:", error);
            toast.error("Failed to check translation status", { duration: 3000 });
          }
        }, 5000); // Refresh again after 5 seconds
      } catch (error) {
        console.error("Failed to translate template:", error);

        // Handle specific error cases
        if (error instanceof Error) {
          if (error.message.includes("English") || error.message.includes("en")) {
            toast.error("Only English templates can be translated. Please select an English template and try again.");
          } else if (error.message.includes("not found") || error.message.includes("404")) {
            toast.error("Template not found. It may have been deleted. Please refresh the page and try again.");
          } else if (error.message.includes("network") || error.message.includes("fetch")) {
            toast.error("Network error. Please check your connection and try again.");
          } else {
            toast.error(`Translation failed: ${error.message}`);
          }
        } else {
          toast.error("An unexpected error occurred while starting translation. Please try again.");
        }
      } finally {
        setOperationLoading(false);
        setTranslatingTemplateId(null);
      }
    },
    [loadTemplates, filters]
  );

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
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Email Templates Management</h1>
            <Button onClick={handleCreateTemplate}>Create Template</Button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
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
                onTranslate={handleTranslateTemplate}
                loading={loading}
                translatingTemplateId={translatingTemplateId}
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

                  <SummaryTable summaryData={summaryData} filters={summaryFilters} />
                </>
              )}

              {!summaryLoading && !summaryError && !summaryData && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">No summary data available</div>
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
