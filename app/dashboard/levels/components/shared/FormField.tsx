import type { ReactNode } from "react";

interface FormFieldProps {
  type: "text" | "textarea" | "select" | "custom";
  name: string;
  label: string;
  value?: string;
  onChange?: (field: string, value: string) => void;
  error?: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  options?: Array<{ value: string; label: string }>;
  children?: ReactNode;
  helpText?: string;
}

export default function FormField({
  type,
  name,
  label,
  value = "",
  onChange,
  error,
  className = "",
  placeholder,
  required = false,
  rows = 3,
  options = [],
  children,
  helpText
}: FormFieldProps) {
  const baseInputClasses = `w-full p-3 border rounded-lg focus:ring-blue-200 dark:bg-gray-800 dark:text-white ${
    error
      ? "border-red-300 focus:border-red-500 dark:border-red-600"
      : "border-gray-300 focus:border-blue-500 dark:border-gray-600 dark:focus:border-blue-400"
  }`;

  const handleChange = (newValue: string) => {
    if (onChange) {
      onChange(name, newValue);
    }
  };

  const renderInput = () => {
    switch (type) {
      case "text":
        return (
          <input
            type="text"
            id={name}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className={`${baseInputClasses} ${className}`}
            placeholder={placeholder}
            required={required}
          />
        );

      case "textarea":
        return (
          <textarea
            id={name}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            rows={rows}
            className={`${baseInputClasses} ${className}`}
            placeholder={placeholder}
            required={required}
          />
        );

      case "select":
        return (
          <select
            id={name}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className={`${baseInputClasses} ${className}`}
            required={required}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "custom":
        return children;

      default:
        return null;
    }
  };

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-500 font-bold"> *</span>}
      </label>

      {renderInput()}

      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-700">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {helpText && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{helpText}</p>}
    </div>
  );
}
