"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import MJMLEditor from "./MJMLEditor";
import TextBodyEditor from "./TextBodyEditor";
import mjml2html from "mjml-browser";
import toast from "react-hot-toast";
import type { EmailTemplate, EmailTemplateType } from "../types";

interface EmailTemplateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: Omit<EmailTemplate, "id"> | EmailTemplate) => Promise<void>;
  template?: EmailTemplate | null;
  templateTypes: EmailTemplateType[];
  loading?: boolean;
  isPage?: boolean;
  onBack?: () => void;
}

interface FormData {
  type: string;
  slug: string;
  locale: string;
  subject: string;
  body_mjml: string;
  body_text: string;
}

const initialFormData: FormData = {
  type: "",
  slug: "",
  locale: "",
  subject: "",
  body_mjml: "",
  body_text: ""
};

const localeOptions = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" }
];

export default function EmailTemplateForm({
  isOpen,
  onClose,
  onSave,
  template,
  templateTypes,
  loading = false,
  isPage = false,
  onBack
}: EmailTemplateFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!template;

  useEffect(() => {
    if ((isOpen || isPage) && template) {
      // Populate form with existing template data
      setFormData({
        type: template.type,
        slug: template.slug,
        locale: template.locale,
        subject: template.subject,
        body_mjml: template.body_mjml,
        body_text: template.body_text
      });
    } else if ((isOpen || isPage) && !template) {
      // Reset form for new template
      setFormData(initialFormData);
    }
    setErrors({});
  }, [isOpen, isPage, template]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.type.trim()) {
      newErrors.type = "Template type is required";
    }
    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    }
    if (!formData.locale.trim()) {
      newErrors.locale = "Locale is required";
    }
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }
    if (!formData.body_mjml.trim() && !formData.body_text.trim()) {
      newErrors.body_mjml = "Either MJML or text body is required";
      newErrors.body_text = "Either MJML or text body is required";
    }

    // Validate MJML syntax if provided
    if (formData.body_mjml.trim()) {
      try {
        const result = mjml2html(formData.body_mjml, { validationLevel: "soft" });
        if (result.errors.length > 0) {
          newErrors.body_mjml = `MJML validation failed: ${result.errors[0].message}`;
        }
      } catch (error) {
        newErrors.body_mjml = `Invalid MJML: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing) {
        // Update existing template
        await onSave({ ...template, ...formData });
      } else {
        // Create new template
        await onSave(formData);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save template:", error);
      // Error handling could be improved with proper error display
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSelectChange = (field: keyof FormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleTextAreaChange = (field: keyof FormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const copyMJMLToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formData.body_mjml);
      toast.success("MJML copied to clipboard");
    } catch (error) {
      console.error("Failed to copy MJML to clipboard:", error);
      // Fallback for older browsers or when clipboard API fails
      const textArea = document.createElement("textarea");
      textArea.value = formData.body_mjml;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        toast.success("MJML copied to clipboard");
      } catch (fallbackError) {
        console.error("Fallback copy failed:", fallbackError);
        toast.success("MJML copied to clipboard");
      }
      document.body.removeChild(textArea);
    }
  };

  const extractTextFromMJML = () => {
    if (!formData.body_mjml.trim()) {
      toast.error("No MJML content to extract text from");
      return;
    }

    try {
      // Parse MJML directly to extract text content
      const mjmlContent = formData.body_mjml;

      // Create a temporary DOM parser to handle MJML as XML
      const parser = new DOMParser();
      const mjmlDoc = parser.parseFromString(mjmlContent, "text/xml");

      // Check for parsing errors
      const parseError = mjmlDoc.querySelector("parsererror");
      if (parseError) {
        toast.error("Invalid MJML syntax. Please check your MJML.");
        return;
      }

      // Extract text from MJML components
      const extractTextFromMJML = (element: Element): string => {
        let text = "";

        // Process child nodes
        for (const child of element.children) {
          const tagName = child.tagName.toLowerCase();

          if (tagName === "mj-text") {
            // Extract text content and handle links
            const textContent = child.textContent || "";
            const processedText = textContent.replace(/<a\s+href="([^"]*)"[^>]*>([^<]*)<\/a>/gi, "$2 ($1)");
            text += processedText.trim() + "\n\n";
          } else if (tagName === "mj-button") {
            // Extract button text and href
            const buttonText = child.textContent || "";
            const href = child.getAttribute("href");
            if (buttonText.trim()) {
              if (href) {
                text += `${buttonText.trim()} (${href})\n\n`;
              } else {
                text += `${buttonText.trim()}\n\n`;
              }
            }
          } else {
            // Recursively process other MJML components
            text += extractTextFromMJML(child);
          }
        }

        return text;
      };

      const extractedText = extractTextFromMJML(mjmlDoc.documentElement)
        .replace(/\n{3,}/g, "\n\n") // Remove excessive line breaks
        .replace(/^\s+|\s+$/gm, "") // Trim whitespace from each line
        .replace(/\n\n+/g, "\n\n") // Normalize line breaks
        .trim();

      if (!extractedText) {
        toast.error("No text content found in MJML");
        return;
      }

      setFormData((prev) => ({ ...prev, body_text: extractedText }));

      // Clear any existing error for body_text
      if (errors.body_text) {
        setErrors((prev) => ({ ...prev, body_text: undefined }));
      }

      toast.success("Text extracted from MJML successfully");
    } catch (error) {
      console.error("Failed to extract text from MJML:", error);
      toast.error("Failed to extract text from MJML. Please check your MJML syntax.");
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit}>
      {!isPage && (
        <h4 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
          {isEditing ? "Edit Email Template" : "Create New Email Template"}
        </h4>
      )}

      <div className="space-y-6">
        {/* Type and Locale Row */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label htmlFor="type">Template Type *</Label>
            <Select
              options={templateTypes}
              placeholder="Select template type"
              onChange={handleSelectChange("type")}
              value={formData.type}
            />
            {errors.type && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.type}</p>}
          </div>

          <div>
            <Label htmlFor="locale">Locale *</Label>
            <Select
              options={localeOptions}
              placeholder="Select locale"
              onChange={handleSelectChange("locale")}
              value={formData.locale}
            />
            {errors.locale && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.locale}</p>}
          </div>
        </div>

        {/* Slug and Subject Row */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label htmlFor="slug">Slug *</Label>
            <Input
              type="text"
              id="slug"
              placeholder="e.g., welcome_email"
              value={formData.slug}
              onChange={handleInputChange("slug")}
              error={!!errors.slug}
              hint={errors.slug}
            />
          </div>

          <div>
            <Label htmlFor="subject">Subject *</Label>
            <Input
              type="text"
              id="subject"
              placeholder="Email subject line"
              value={formData.subject}
              onChange={handleInputChange("subject")}
              error={!!errors.subject}
              hint={errors.subject}
            />
          </div>
        </div>

        {/* MJML Body */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="body_mjml">MJML Body</Label>
            <Button size="sm" variant="outline" onClick={copyMJMLToClipboard} className="text-xs">
              Copy MJML
            </Button>
          </div>
          <MJMLEditor
            value={formData.body_mjml}
            onChange={handleTextAreaChange("body_mjml")}
            error={!!errors.body_mjml}
            hint={errors.body_mjml || "MJML markup for HTML email rendering"}
            onExtractText={extractTextFromMJML}
          />
        </div>

        {/* Text Body */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="body_text">Text Body</Label>
            <Button
              size="sm"
              variant="outline"
              onClick={extractTextFromMJML}
              disabled={!formData.body_mjml.trim()}
              className="text-xs"
            >
              Extract text from MJML
            </Button>
          </div>
          <TextBodyEditor
            value={formData.body_text}
            onChange={handleTextAreaChange("body_text")}
            error={!!errors.body_text}
            hint={errors.body_text || "Plain text version for email clients that don't support HTML"}
          />
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          * At least one body type (MJML or Text) is required
        </div>
      </div>

      {/* Form Actions */}
      <div className="mt-8 flex items-center justify-end gap-3">
        <Button size="sm" variant="outline" onClick={isPage && onBack ? onBack : onClose} disabled={isSubmitting}>
          {isPage ? "Back" : "Cancel"}
        </Button>
        <button
          type="submit"
          disabled={isSubmitting || loading}
          className={`inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-4 py-3 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 ${isSubmitting || loading ? "cursor-not-allowed opacity-50" : ""}`}
        >
          {isSubmitting ? "Saving..." : isEditing ? "Update Template" : "Create Template"}
        </button>
      </div>
    </form>
  );

  if (isPage) {
    return formContent;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl p-6 lg:p-8">
      {formContent}
    </Modal>
  );
}
