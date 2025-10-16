export interface EmailTemplate {
  id: number;
  type: string;
  slug: string;
  locale: string;
  subject: string;
  body_mjml: string;
  body_text: string;
}

export interface EmailTemplateFilters {
  type?: string;
  slug?: string;
  locale?: string;
  search?: string;
  page?: number;
}

export interface EmailTemplateType {
  value: string;
  label: string;
}