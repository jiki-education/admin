"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import EmailTemplateTable from "./components/EmailTemplateTable";
import TemplateFilters from "./components/TemplateFilters";
import type { EmailTemplate, EmailTemplateFilters, EmailTemplateType } from "./types";
import { getEmailTemplates, getEmailTemplateTypes } from "@/lib/api/email-templates";

export default function EmailTemplates() {
  const { isAuthenticated, hasCheckedAuth, checkAuth } = useAuthStore();
  const router = useRouter();

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [templateTypes, setTemplateTypes] = useState<EmailTemplateType[]>([]);
  const [filters, setFilters] = useState<EmailTemplateFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setTemplates(response.email_templates);
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

  const handleEditTemplate = useCallback((template: EmailTemplate) => {
    // TODO: Implement edit modal in Phase 3
    console.warn("Edit template functionality not yet implemented:", template.id);
  }, []);

  const handleDeleteTemplate = useCallback((template: EmailTemplate) => {
    // TODO: Implement delete confirmation in Phase 3  
    console.warn("Delete template functionality not yet implemented:", template.id);
  }, []);

  const handleCreateTemplate = useCallback(() => {
    // TODO: Implement create modal in Phase 3
    console.warn("Create template functionality not yet implemented");
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
            onEdit={handleEditTemplate}
            onDelete={handleDeleteTemplate}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}