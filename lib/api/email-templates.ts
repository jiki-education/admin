/**
 * Email Templates API Service
 * API integration for email template management endpoints
 */

import { api } from "@/lib/api";
import type { 
  EmailTemplate, 
  EmailTemplateFilters, 
  EmailTemplateType,
  EmailTemplateSummaryResponse 
} from "@/app/dashboard/email-templates/types";

interface EmailTemplatesResponse {
  results: EmailTemplate[];
  meta: {
    current_page: number;
    total_count: number;
    total_pages: number;
  };
}

interface EmailTemplateTypesResponse {
  types: string[];
}

/**
 * Get list of email templates with filtering
 * GET /v1/admin/email_templates
 */
export async function getEmailTemplates(filters?: EmailTemplateFilters): Promise<EmailTemplatesResponse> {
  const params: Record<string, string> = {
    ...(filters?.type && { type: filters.type }),
    ...(filters?.slug && { slug: filters.slug }),
    ...(filters?.locale && { locale: filters.locale }),
    ...(filters?.search && { search: filters.search }),
    ...(filters?.page && { page: filters.page.toString() })
  };

  const response = await api.get<EmailTemplatesResponse>("/admin/email_templates", { params });
  return response.data;
}

/**
 * Get available email template types
 * GET /v1/admin/email_templates/types
 */
export async function getEmailTemplateTypes(): Promise<EmailTemplateType[]> {
  const response = await api.get<EmailTemplateTypesResponse>("/admin/email_templates/types");
  
  // Convert string array to options format
  return response.data.types.map(type => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')
  }));
}

/**
 * Get single email template by ID
 * GET /v1/admin/email_templates/:id
 */
export async function getEmailTemplate(id: number): Promise<EmailTemplate> {
  const response = await api.get<{ email_template: EmailTemplate }>(`/admin/email_templates/${id}`);
  return response.data.email_template;
}

/**
 * Create new email template
 * POST /v1/admin/email_templates
 */
export async function createEmailTemplate(template: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> {
  const response = await api.post<{ email_template: EmailTemplate }>("/admin/email_templates", {
    email_template: template
  });
  return response.data.email_template;
}

/**
 * Update existing email template
 * PATCH /v1/admin/email_templates/:id
 */
export async function updateEmailTemplate(id: number, template: Partial<EmailTemplate>): Promise<EmailTemplate> {
  const response = await api.patch<{ email_template: EmailTemplate }>(`/admin/email_templates/${id}`, {
    email_template: template
  });
  return response.data.email_template;
}

/**
 * Delete email template
 * DELETE /v1/admin/email_templates/:id
 */
export async function deleteEmailTemplate(id: number): Promise<void> {
  await api.delete(`/admin/email_templates/${id}`);
}

/**
 * Get email templates summary grouped by type and slug
 * GET /v1/admin/email_templates/summary
 */
export async function getEmailTemplatesSummary(): Promise<EmailTemplateSummaryResponse> {
  const response = await api.get<EmailTemplateSummaryResponse>("/admin/email_templates/summary");
  return response.data;
}