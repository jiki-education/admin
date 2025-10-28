/**
 * Generates a URL-friendly slug from a title string
 *
 * @param title - The title to convert to a slug
 * @returns A URL-safe slug string
 *
 * @example
 * generateSlug("Introduction to Programming") // "introduction-to-programming"
 * generateSlug("Variables & Data Types!") // "variables-data-types"
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Validates if a slug is properly formatted
 *
 * @param slug - The slug to validate
 * @returns True if the slug is valid, false otherwise
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length === 0) {
    return false;
  }

  // Slug should only contain lowercase letters, numbers, and hyphens
  // Should not start or end with hyphen
  // Should not have consecutive hyphens
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugPattern.test(slug);
}

/**
 * Sanitizes a slug to ensure it follows proper format
 *
 * @param slug - The slug to sanitize
 * @returns A properly formatted slug
 */
export function sanitizeSlug(slug: string): string {
  return generateSlug(slug);
}
