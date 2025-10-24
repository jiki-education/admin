/**
 * Parse Rails validation error messages into field-specific errors
 * Example: "Validation failed: Title can't be blank, Slug has already been taken"
 */
export function parseValidationErrors(message: string): Record<string, string> {
  const errors: Record<string, string> = {};
  
  // Remove "Validation failed: " prefix if present
  const cleanMessage = message.replace(/^Validation failed:\s*/, "");
  
  // Split by comma and process each error
  const errorParts = cleanMessage.split(", ");
  
  for (const part of errorParts) {
    // Match patterns like "Title can't be blank" or "Slug has already been taken"
    const match = part.match(/^([A-Za-z_]+)\s+(.+)$/);
    
    if (match) {
      const [, field, error] = match;
      const fieldKey = field.toLowerCase();
      errors[fieldKey] = `${field} ${error}`;
    } else {
      // If we can't parse the field, add to general errors
      errors.general = part;
    }
  }
  
  // If no field-specific errors were found, treat the whole message as general
  if (Object.keys(errors).length === 0) {
    errors.general = message;
  }
  
  return errors;
}

/**
 * Format a single error message for display
 */
export function formatErrorMessage(fieldName: string, errorMessage: string): string {
  // Remove field name prefix if it exists in the error message
  const cleanError = errorMessage.replace(new RegExp(`^${fieldName}\\s+`, 'i'), '');
  return cleanError;
}

/**
 * Check if there are any validation errors
 */
export function hasErrors(errors: Record<string, string>): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Get the count of validation errors
 */
export function getErrorCount(errors: Record<string, string>): number {
  return Object.keys(errors).length;
}