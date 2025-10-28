"use client";
import { useState, useEffect } from "react";

interface JSONEditorProps {
  value: string;
  onChange: (value: string) => void;
  onValidation?: (error: string | null) => void;
  placeholder?: string;
  className?: string;
}

export default function JSONEditor({
  value,
  onChange,
  onValidation,
  placeholder = "Enter valid JSON...",
  className = ""
}: JSONEditorProps) {
  const [localValue, setLocalValue] = useState(value);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);

    // Validate JSON
    let validationError: string | null = null;
    if (newValue.trim()) {
      try {
        JSON.parse(newValue);
      } catch (err) {
        validationError = err instanceof Error ? err.message : "Invalid JSON format";
      }
    }

    setError(validationError);
    onValidation?.(validationError);

    // Only call onChange if JSON is valid or empty
    if (!validationError) {
      onChange(newValue);
    }
  };

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(localValue);
      const formatted = JSON.stringify(parsed, null, 2);
      setLocalValue(formatted);
      onChange(formatted);
      setError(null);
      onValidation?.(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Invalid JSON format";
      setError(errorMessage);
      onValidation?.(errorMessage);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">JSON Data</label>
        <button
          type="button"
          onClick={formatJSON}
          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
        >
          Format JSON
        </button>
      </div>

      <div className="relative">
        <textarea
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          rows={12}
          className={`w-full p-3 border rounded-lg font-mono text-sm resize-y min-h-[200px] ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-600 dark:focus:border-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-200 dark:border-gray-600 dark:focus:border-blue-400"
          } dark:bg-gray-800 dark:text-white dark:placeholder-gray-400`}
        />

        {error && (
          <div className="absolute top-2 right-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" title={error} />
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">JSON Error: {error}</p>}

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Enter valid JSON data. Use the &quot;Format JSON&quot; button to auto-format your input.
      </p>
    </div>
  );
}
