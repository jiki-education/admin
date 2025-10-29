"use client";
import { useState, useCallback } from "react";
import { marked } from "marked";
import Button from "@/components/ui/button/Button";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  label?: string;
  required?: boolean;
  rows?: number;
  className?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = "Enter markdown content...",
  error,
  label,
  required = false,
  rows = 10,
  className = ""
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [htmlContent, setHtmlContent] = useState("");

  const handleModeSwitch = useCallback(async (newMode: "edit" | "preview") => {
    if (newMode === "preview" && value.trim()) {
      try {
        const html = await marked.parse(value);
        setHtmlContent(html);
      } catch (err) {
        console.error("Markdown parsing error:", err);
        setHtmlContent("<p>Error parsing markdown</p>");
      }
    }
    setMode(newMode);
  }, [value]);

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className={className}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="markdown-editor-textarea" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={mode === "edit" ? "primary" : "outline"}
              onClick={() => handleModeSwitch("edit")}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant={mode === "preview" ? "primary" : "outline"}
              onClick={() => handleModeSwitch("preview")}
              disabled={!value.trim()}
            >
              Preview
            </Button>
          </div>
        </div>
      )}

      <div className="relative">
        {mode === "edit" ? (
          <textarea
            id="markdown-editor-textarea"
            value={value}
            onChange={handleTextareaChange}
            placeholder={placeholder}
            rows={rows}
            className={`w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 font-mono resize-y ${
              error
                ? "border-red-300 focus:border-red-300 focus:ring-red-500/10 dark:border-red-800"
                : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800"
            }`}
          />
        ) : (
          <div
            className={`w-full min-h-[${rows * 1.5}rem] rounded-lg border px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 overflow-auto`}
            style={{ minHeight: `${rows * 1.5}rem` }}
          >
            {value.trim() ? (
              <div
                className="markdown-preview text-gray-900 dark:text-gray-100"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            ) : (
              <p className="text-gray-400 italic">No content to preview</p>
            )}
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}

      {mode === "edit" && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          <details className="cursor-pointer">
            <summary className="hover:text-gray-700 dark:hover:text-gray-300">
              Markdown syntax help
            </summary>
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded border space-y-1">
              <div><code># Heading 1</code> → <strong>Large heading</strong></div>
              <div><code>## Heading 2</code> → <strong>Medium heading</strong></div>
              <div><code>**bold text**</code> → <strong>bold text</strong></div>
              <div><code>*italic text*</code> → <em>italic text</em></div>
              <div><code>[link text](url)</code> → <span className="text-blue-600">link text</span></div>
              <div><code>`code`</code> → <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">code</code></div>
              <div><code>- List item</code> → • List item</div>
              <div><code>1. Numbered item</code> → 1. Numbered item</div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}