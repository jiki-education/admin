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
import type { EmailTemplate, EmailTemplateFilters, EmailTemplateType } from "./types";
import { getEmailTemplates, getEmailTemplateTypes, createEmailTemplate, deleteEmailTemplate } from "@/lib/api/email-templates";
import { useModal } from "@/hooks/useModal";

export default function EmailTemplates() {
  const { isAuthenticated, hasCheckedAuth, checkAuth } = useAuthStore();
  const router = useRouter();

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [templateTypes, setTemplateTypes] = useState<EmailTemplateType[]>([]);
  const [filters, setFilters] = useState<EmailTemplateFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const response = await getEmailTemplates(filters);
      console.log(response)
      setTemplates(response.results);
    } catch (err) {
      console.error("Failed to load templates:", err);
      setError(err instanceof Error ? err.message : "Failed to load templates");
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadTemplateTypes = useCallback(async () => {
    try {
      const types = await getEmailTemplateTypes();
      setTemplateTypes(types);
    } catch (err) {
      console.error("Failed to load template types:", err);
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

  const handleFiltersChange = useCallback((newFilters: EmailTemplateFilters) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
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