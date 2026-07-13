import type { ExerciseAnalytics, SortColumn, SortDirection } from "../types";

// Health sorts ascending by default so the worst exercises appear first.
// Title sorts alphabetically; all other (metric) columns default to descending.
export function defaultDirectionFor(column: SortColumn): SortDirection {
  return column === "health_score" || column === "title" ? "asc" : "desc";
}

// A null column resets to course order (the order the API returns).
// Null metric values always sort last, regardless of direction.
export function sortExercises(
  exercises: ExerciseAnalytics[],
  column: SortColumn | null,
  direction: SortDirection
): ExerciseAnalytics[] {
  if (!column) {
    return exercises;
  }

  return [...exercises].sort((a, b) => {
    const aValue = a[column];
    const bValue = b[column];

    if (aValue == null && bValue == null) {
      return 0;
    }
    if (aValue == null) {
      return 1;
    }
    if (bValue == null) {
      return -1;
    }

    const comparison =
      typeof aValue === "string" && typeof bValue === "string"
        ? aValue.localeCompare(bValue)
        : Number(aValue) - Number(bValue);

    return direction === "asc" ? comparison : -comparison;
  });
}
