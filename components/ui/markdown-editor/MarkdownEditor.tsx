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
  onImageUpload?: (file: File) => Promise<string>;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = "Enter markdown content...",
  error,
  label,
  required = false,
  rows = 10,
  className = "",
  onImageUpload
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [htmlContent, setHtmlContent] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleModeSwitch = useCallback(
    async (newMode: "edit" | "preview") => {
      if (newMode === "preview" && value.trim()) {
        try {
          const html = await marked.parse(value, {
            breaks: true,
            gfm: true
          });
          console.log("Parsed HTML:", html); // Debug: see what HTML is generated
          setHtmlContent(html);
        } catch (err) {
          console.error("Markdown parsing error:", err);
          setHtmlContent("<p>Error parsing markdown</p>");
        }
      }
      setMode(newMode);
    },
    [value]
  );

  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      if (!onImageUpload) {
        return;
      }

      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter((file) => file.type.startsWith("image/"));

      if (imageFiles.length === 0) {
        return;
      }

      setIsUploading(true);

      for (const file of imageFiles) {
        try {
          // Insert placeholder while uploading
          const placeholder = `![Uploading ${file.name}...](uploading)`;
          const textArea = e.currentTarget;
          const start = textArea.selectionStart;
          const end = textArea.selectionEnd;
          const newValue = value.slice(0, start) + placeholder + value.slice(end);
          onChange(newValue);

          // Upload the image
          const imageUrl = await onImageUpload(file);

          // Replace placeholder with actual image
          const finalMarkdown = `![${file.name}](${imageUrl})`;
          const updatedValue = newValue.replace(placeholder, finalMarkdown);
          onChange(updatedValue);
        } catch (error) {
          console.error("Image upload failed:", error);
          // Remove placeholder on error
          const failedPlaceholder = `![Uploading ${file.name}...](uploading)`;
          onChange(value.replace(failedPlaceholder, ""));
        }
      }

      setIsUploading(false);
    },
    [value, onChange, onImageUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  return (
    <div className={className}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="markdown-editor-textarea"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
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
          <div className="relative">
            <textarea
              id="markdown-editor-textarea"
              value={value}
              onChange={handleTextareaChange}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              placeholder={placeholder}
              rows={rows}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 font-mono resize-y transition-colors ${
                isDragOver
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                  : error
                    ? "border-red-300 focus:border-red-300 focus:ring-red-500/10 dark:border-red-800"
                    : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800"
              }`}
            />
            {isDragOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-brand-50/90 dark:bg-brand-900/50 rounded-lg border-2 border-dashed border-brand-500 pointer-events-none">
                <div className="text-center text-brand-600 dark:text-brand-400">
                  <div className="text-lg font-medium mb-1">Drop images here</div>
                  <div className="text-sm">Images will be uploaded and inserted as markdown</div>
                </div>
              </div>
            )}
            {isUploading && (
              <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 px-2 py-1 rounded border shadow-sm">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="w-3 h-3 border-2 border-gray-300 border-t-brand-500 rounded-full animate-spin"></div>
                  Uploading...
                </div>
              </div>
            )}
          </div>
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
            <summary className="hover:text-gray-700 dark:hover:text-gray-300">Markdown syntax help</summary>
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded border space-y-1">
              <div>
                <code># Heading 1</code> → <strong>Large heading</strong>
              </div>
              <div>
                <code>## Heading 2</code> → <strong>Medium heading</strong>
              </div>
              <div>
                <code>**bold text**</code> → <strong>bold text</strong>
              </div>
              <div>
                <code>*italic text*</code> → <em>italic text</em>
              </div>
              <div>
                <code>[link text](url)</code> → <span className="text-blue-600">link text</span>
              </div>
              <div>
                <code>![alt text](image-url)</code> → 🖼️ Image
              </div>
              <div>
                <code>`code`</code> → <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">code</code>
              </div>
              <div>
                <code>- List item</code> → • List item
              </div>
              <div>
                <code>1. Numbered item</code> → 1. Numbered item
              </div>
              <div className="pt-1 border-t border-gray-200 dark:border-gray-600 text-brand-600 dark:text-brand-400">
                💡 <strong>Tip:</strong> Drag & drop images directly into the editor
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
