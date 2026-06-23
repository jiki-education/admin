export type Segment = "all_users" | "premium_users" | "free_users" | "admin_users";

export const SEGMENTS: { value: Segment; label: string }[] = [
  { value: "all_users", label: "All users" },
  { value: "premium_users", label: "Premium users" },
  { value: "free_users", label: "Free users" },
  { value: "admin_users", label: "Admin users" }
];

export interface Mailshot {
  id: number;
  slug: string;
  subject: string;
  preview_text: string;
  body_markdown: string;
  email_communication_preferences_key: string;
  sent_to_audiences: Segment[];
  sent_count: number;
  created_at: string;
  updated_at: string;
}

// Payload for create/update (wrapped in { mailshot: ... } by the API client)
export interface MailshotInput {
  slug: string;
  subject: string;
  preview_text?: string;
  body_markdown: string;
}

export interface MailshotFilters {
  status?: "draft" | "sent";
  page?: number;
  per?: number;
}

export interface MailshotsResponse {
  results: Mailshot[];
  meta: {
    current_page: number;
    total_count: number;
    total_pages: number;
  };
}

export interface MailshotResponse {
  mailshot: Mailshot;
}

export interface SendResponse {
  mailshot: Mailshot;
  audience_count: number;
}

export interface PreviewResponse {
  html: string;
}
