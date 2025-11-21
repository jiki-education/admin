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

export interface EmailTemplateSummaryItem {
  type: string;
  slug: string;
  locales: string[];
}

export interface LocaleConfiguration {
  supported: string[];
  wip: string[];
}

export interface EmailTemplateSummaryResponse {
  email_templates: EmailTemplateSummaryItem[];
  locales: LocaleConfiguration;
}

export interface TranslateEmailTemplateResponse {
  email_template: EmailTemplate;
  queued_locales: string[];
}
