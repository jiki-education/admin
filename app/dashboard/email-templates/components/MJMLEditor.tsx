"use client";
import React, { useState, useEffect, useCallback } from "react";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";

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

  const validateMJML = useCallback(async (mjmlContent: string) => {
    if (!mjmlContent.trim()) {
      setValidationErrors([]);
      setHtmlPreview("");
      return;
    }

    setIsValidating(true);
    try {
      // Dynamically import mjml-browser only on client side
      const { default: mjml2html } = await import("mjml-browser");
      // Use soft validation to get errors without throwing
      const result = mjml2html(mjmlContent, { validationLevel: "soft" });
      setValidationErrors(result.errors);
      setHtmlPreview(result.html || "");
    } catch (error) {
      // This shouldn't happen with soft validation, but just in case
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

        <TextArea
          placeholder={placeholder}
          rows={12}
          value={value}
          onChange={onChange}
          error={error || hasErrors}
          hint={hint}
          className="font-mono text-sm"
        />

        {/* Validation Errors */}
        {hasErrors && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
            <div className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">MJML Validation Errors:</div>
            <ul className="space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm text-red-700 dark:text-red-400">
                  <span className="font-mono text-xs bg-red-100 dark:bg-red-800 px-1 py-0.5 rounded">
                    Line {error.line}
                  </span>{" "}
                  {error.message}
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
                  void navigator.clipboard.writeText(htmlPreview);
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
