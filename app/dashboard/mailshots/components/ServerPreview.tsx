"use client";
import { useEffect, useState } from "react";
import { previewMailshot } from "@/lib/api/mailshots";

interface ServerPreviewProps {
  mailshotId: number;
  bodyMarkdown: string;
  subject: string;
  previewText: string;
}

const DEBOUNCE_MS = 500;

export default function ServerPreview({ mailshotId, bodyMarkdown, subject, previewText }: ServerPreviewProps) {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bodyMarkdown.trim()) {
      setHtml("");
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const rendered = await previewMailshot(mailshotId, {
          body_markdown: bodyMarkdown,
          subject,
          preview_text: previewText
        });
        if (!cancelled) {
          setHtml(rendered);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to render preview");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [mailshotId, bodyMarkdown, subject, previewText]);

  if (error) {
    return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;
  }

  if (!bodyMarkdown.trim()) {
    return <p className="text-gray-400 italic">No content to preview</p>;
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute top-2 right-2 z-10 rounded border bg-white px-2 py-1 text-xs text-gray-600 shadow-sm dark:bg-gray-800 dark:text-gray-400">
          Rendering…
        </div>
      )}
      <iframe
        title="Email preview"
        srcDoc={html}
        className="h-[600px] w-full rounded-lg border border-gray-200 bg-white dark:border-gray-700"
      />
    </div>
  );
}
