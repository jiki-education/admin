"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Button from "@/components/ui/button/Button";

export function wrapMJML(content: string): string {
  const trimmed = content.trim();
  if (trimmed.startsWith("<mjml>") || trimmed.startsWith("<mjml ")) {
    return trimmed;
  }
  return `<mjml>\n<mj-body>\n${trimmed}\n</mj-body>\n</mjml>`;
}

function wrapperLineOffset(content: string): number {
  const trimmed = content.trim();
  if (trimmed.startsWith("<mjml>") || trimmed.startsWith("<mjml ")) {
    return 0;
  }
  // We prepend "<mjml>\n<mj-body>\n", which adds 2 lines
  return 2;
}

interface MJMLEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  hint?: string;
  onExtractText?: () => void;
}

interface ValidationError {
  line: number;
  message: string;
  tagName: string;
  formattedMessage: string;
}

export default function MJMLEditor({
  value,
  onChange,
  placeholder = "Enter MJML template content...",
  error = false,
  hint,
  onExtractText
}: MJMLEditorProps) {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [htmlPreview, setHtmlPreview] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const validateMJML = useCallback(async (mjmlContent: string) => {
    if (!mjmlContent.trim()) {
      setValidationErrors([]);
      setHtmlPreview("");
      return;
    }

    setIsValidating(true);
    try {
      const { default: mjml2html } = await import("mjml-browser");
      const result = mjml2html(wrapMJML(mjmlContent), { validationLevel: "soft" });
      const offset = wrapperLineOffset(mjmlContent);
      const adjusted = result.errors.map((err: ValidationError) => ({
        ...err,
        line: Math.max(1, err.line - offset)
      }));
      setValidationErrors(adjusted);
      setHtmlPreview(result.html || "");
    } catch (error) {
      console.error("MJML validation error:", error);
      setValidationErrors([
        {
          line: 0,
          message: error instanceof Error ? error.message : "Unknown validation error",
          tagName: "unknown",
          formattedMessage: error instanceof Error ? error.message : "Unknown validation error"
        }
      ]);
      setHtmlPreview("");
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Debounced validation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void validateMJML(value);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [value, validateMJML]);

  const hasErrors = validationErrors.length > 0;
  const isValid = value.trim() && !hasErrors;

  const errorLines = new Set(validationErrors.map((e) => e.line));
  const lineCount = Math.max((value || "").split("\n").length, 1);

  const syncScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className="space-y-4">
      {/* MJML Editor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">MJML Editor</span>
            {isValidating && <span className="text-xs text-gray-500 dark:text-gray-400">Validating...</span>}
            {!isValidating && value.trim() && (
              <span
                className={`text-xs ${isValid ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
              >
                {isValid
                  ? "✓ Valid MJML"
                  : `✗ ${validationErrors.length} error${validationErrors.length !== 1 ? "s" : ""}`}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {onExtractText && value.trim() && (
              <Button size="sm" variant="outline" type="button" onClick={onExtractText} disabled={hasErrors}>
                Extract Text
              </Button>
            )}
            {value.trim() && (
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                disabled={hasErrors}
              >
                {showPreview ? "Hide Preview" : "Show Preview"}
              </Button>
            )}
          </div>
        </div>

        {/* Textarea with line numbers */}
        <div
          className={`flex rounded-lg border overflow-hidden ${
            error || hasErrors
              ? "border-gray-300 focus-within:border-error-300 focus-within:ring-3 focus-within:ring-error-500/10 dark:border-gray-700 dark:focus-within:border-error-800"
              : "border-gray-300 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/10 dark:border-gray-700 dark:focus-within:border-brand-800"
          }`}
        >
          <div
            ref={lineNumbersRef}
            className="select-none overflow-hidden bg-gray-50 dark:bg-gray-800 py-2.5 text-right font-mono text-sm leading-[21px] text-gray-400 dark:text-gray-500"
            style={{
              minWidth: `${Math.max(3, String(lineCount).length + 1)}ch`,
              paddingRight: "8px",
              paddingLeft: "8px"
            }}
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i + 1} className={errorLines.has(i + 1) ? "text-red-500 font-bold dark:text-red-400" : ""}>
                {i + 1}
              </div>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            placeholder={placeholder}
            rows={12}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={syncScroll}
            className="w-full resize-y bg-transparent py-2.5 px-3 font-mono text-sm leading-[21px] text-gray-400 focus:outline-hidden dark:bg-gray-900 dark:text-white/90"
          />
        </div>
        {hint && (
          <p className={`mt-2 text-sm ${error || hasErrors ? "text-error-500" : "text-gray-500 dark:text-gray-400"}`}>
            {hint}
          </p>
        )}

        {/* Validation Errors */}
        {hasErrors && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
            <div className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">MJML Validation Errors:</div>
            <ul className="space-y-1">
              {validationErrors.map((validationError, index) => (
                <li key={index} className="text-sm text-red-700 dark:text-red-400">
                  <span className="font-mono text-xs bg-red-100 dark:bg-red-800 px-1 py-0.5 rounded">
                    Line {validationError.line}
                  </span>{" "}
                  {validationError.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* HTML Preview */}
      {showPreview && isValid && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">HTML Preview</h4>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (navigator.clipboard?.writeText) {
                    void navigator.clipboard.writeText(htmlPreview);
                  } else {
                    const textArea = document.createElement("textarea");
                    textArea.value = htmlPreview;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand("copy");
                    document.body.removeChild(textArea);
                  }
                }}
              >
                Copy HTML
              </Button>
            </div>
          </div>

          {/* Rendered Email Preview */}
          <div className="mb-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Email Preview (rendered):</div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <iframe
                srcDoc={htmlPreview}
                className="w-full h-96 bg-white"
                title="Email Preview"
                sandbox="allow-same-origin"
              />
            </div>
          </div>

          {/* Raw HTML Code */}
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Generated HTML:</div>
            <div className="font-mono text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 overflow-auto max-h-64">
              <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{htmlPreview}</pre>
            </div>
          </div>
        </div>
      )}

      {/* MJML Help */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Need help with MJML? Check out the{" "}
        <a
          href="https://documentation.mjml.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          MJML documentation
        </a>{" "}
        for syntax and components.
      </div>
    </div>
  );
}
