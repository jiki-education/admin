"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { ApiError } from "@/lib/api";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { updateMailshot } from "@/lib/api/mailshots";
import { extractFieldErrors } from "../errors";
import ServerPreview from "./ServerPreview";
import type { Mailshot } from "../types";

interface MailshotFormProps {
  mailshot: Mailshot;
  onSaved: (mailshot: Mailshot) => void;
}

export default function MailshotForm({ mailshot, onSaved }: MailshotFormProps) {
  const [slug, setSlug] = useState(mailshot.slug);
  const [subject, setSubject] = useState(mailshot.subject);
  const [previewText, setPreviewText] = useState(mailshot.preview_text);
  const [bodyMarkdown, setBodyMarkdown] = useState(mailshot.body_markdown);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string[]>>>({});
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setFieldErrors({});
    try {
      const updated = await updateMailshot(mailshot.id, {
        slug,
        subject,
        preview_text: previewText,
        body_markdown: bodyMarkdown
      });
      onSaved(updated);
      toast.success("Mailshot saved");
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(extractFieldErrors(err));
      }
      toast.error(err instanceof ApiError ? "Could not save mailshot" : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="mailshot-slug">Slug</Label>
        <Input
          id="mailshot-slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          error={Boolean(fieldErrors.slug)}
          hint={fieldErrors.slug?.join(", ")}
        />
      </div>

      <div>
        <Label htmlFor="mailshot-subject">Subject</Label>
        <Input
          id="mailshot-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          error={Boolean(fieldErrors.subject)}
          hint={fieldErrors.subject?.join(", ")}
        />
      </div>

      <div>
        <Label htmlFor="mailshot-preview-text">Preview text</Label>
        <Input
          id="mailshot-preview-text"
          value={previewText}
          onChange={(e) => setPreviewText(e.target.value)}
          error={Boolean(fieldErrors.preview_text)}
          hint={
            fieldErrors.preview_text?.join(", ") ||
            "The snippet shown after the subject in inbox previews (e.g. Gmail). Leave blank to let clients use the email body."
          }
        />
      </div>

      <MarkdownEditor
        label="Body"
        value={bodyMarkdown}
        onChange={setBodyMarkdown}
        rows={18}
        error={fieldErrors.body_markdown?.join(", ")}
        renderPreview={(value) => (
          <ServerPreview mailshotId={mailshot.id} bodyMarkdown={value} subject={subject} previewText={previewText} />
        )}
      />

      <div className="flex justify-end">
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
