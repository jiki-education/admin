/**
 * Mailshots API Service
 * API integration for mailshot authoring and sending endpoints
 */

import { api } from "@/lib/api";
import type {
  Mailshot,
  MailshotInput,
  MailshotFilters,
  MailshotsResponse,
  MailshotResponse,
  PreviewResponse,
  SendResponse,
  Segment
} from "@/app/dashboard/mailshots/types";

/**
 * Get list of mailshots with filtering
 * GET /admin/mailshots
 */
export async function getMailshots(filters?: MailshotFilters): Promise<MailshotsResponse> {
  const params: Record<string, string> = {
    ...(filters?.status && { status: filters.status }),
    ...(filters?.page && { page: filters.page.toString() }),
    ...(filters?.per && { per: filters.per.toString() })
  };

  const response = await api.get<MailshotsResponse>("/admin/mailshots", { params });
  return response.data;
}

/**
 * Get single mailshot by ID
 * GET /admin/mailshots/:id
 */
export async function getMailshot(id: number): Promise<Mailshot> {
  const response = await api.get<MailshotResponse>(`/admin/mailshots/${id}`);
  return response.data.mailshot;
}

/**
 * Create new mailshot
 * POST /admin/mailshots
 */
export async function createMailshot(input: MailshotInput): Promise<Mailshot> {
  const response = await api.post<MailshotResponse>("/admin/mailshots", { mailshot: input });
  return response.data.mailshot;
}

/**
 * Update existing mailshot
 * PATCH /admin/mailshots/:id
 */
export async function updateMailshot(id: number, input: MailshotInput): Promise<Mailshot> {
  const response = await api.patch<MailshotResponse>(`/admin/mailshots/${id}`, { mailshot: input });
  return response.data.mailshot;
}

/**
 * Delete mailshot (drafts only)
 * DELETE /admin/mailshots/:id
 */
export async function deleteMailshot(id: number): Promise<void> {
  await api.delete(`/admin/mailshots/${id}`);
}

/**
 * Render a server-side preview of the mailshot (markdown injected into the MJML layout).
 * Not persisted; reflects the unsaved editor content sent in the request.
 * POST /admin/mailshots/:id/preview
 */
export async function previewMailshot(
  id: number,
  input: { body_markdown: string; subject: string; preview_text: string }
): Promise<string> {
  const response = await api.post<PreviewResponse>(`/admin/mailshots/${id}/preview`, { mailshot: input });
  return response.data.html;
}

/**
 * Send a test email of the mailshot to the current admin. Works on drafts and
 * never touches sent_to_audiences / sent_count.
 * POST /admin/mailshots/:id/test
 */
export async function testMailshot(id: number): Promise<boolean> {
  const response = await api.post<{ success: boolean }>(`/admin/mailshots/${id}/test`);
  return response.data.success;
}

/**
 * Send the mailshot to a segment. The segment param is a raw control param (not wrapped).
 * Returns the refreshed mailshot and the targeted audience size.
 * POST /admin/mailshots/:id/send
 */
export async function sendMailshot(id: number, segment: Segment): Promise<SendResponse> {
  const response = await api.post<SendResponse>(`/admin/mailshots/${id}/send`, { segment });
  return response.data;
}
