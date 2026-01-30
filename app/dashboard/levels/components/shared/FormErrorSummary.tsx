import { hasErrors, getErrorCount, formatErrorMessage } from "../../utils/errorParsing";

interface FormErrorSummaryProps {
  errors: Record<string, string>;
  fieldLabels?: Record<string, string>;
}

export default function FormErrorSummary({ errors, fieldLabels = {} }: FormErrorSummaryProps) {
  if (!hasErrors(errors)) {
    return null;
  }

  const errorCount = getErrorCount(errors);

  const getFieldLabel = (field: string): string => {
    if (fieldLabels[field]) {
      return fieldLabels[field];
    }

    // Default field labels
    const defaultLabels: Record<string, string> = {
      title: "Title",
      slug: "Slug",
      description: "Description",
      type: "Type",
      data: "Lesson Data (JSON)"
    };

    return defaultLabels[field] || field.charAt(0).toUpperCase() + field.slice(1);
  };

  return (
    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-700">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-red-400 dark:text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
            Please fix the following {errorCount === 1 ? "error" : "errors"}:
          </h3>
          <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
            {errors.general && (
              <li className="flex items-start space-x-2">
                <span className="font-medium">•</span>
                <span>{errors.general}</span>
              </li>
            )}
            {Object.entries(errors).map(([field, error]) => {
              if (field === "general") {
                return null;
              }

              const fieldLabel = getFieldLabel(field);
              const cleanError = formatErrorMessage(field, error);

              return (
                <li key={field} className="flex items-start space-x-2">
                  <span className="font-medium">•</span>
                  <span>
                    <strong>
                      {fieldLabel} <span className="text-red-600">*</span>:
                    </strong>{" "}
                    {cleanError}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
