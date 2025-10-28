// Admin-specific types for level management
export interface AdminLevel {
  id: number;
  slug: string;
  title: string;
  description: string;
  position: number;
}

export interface AdminLesson {
  id: number;
  slug: string;
  title: string;
  description: string;
  type: string;
  position: number;
  data: Record<string, any>;
}

export interface AdminLevelFilters {
  title?: string;
  slug?: string;
  page?: number;
  per?: number;
}

export interface AdminLevelsResponse {
  results: AdminLevel[];
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
  };
}

// Types for creating new levels and lessons
export type CreateLevelData = Omit<AdminLevel, "id" | "position">;
export type CreateLessonData = Omit<AdminLesson, "id" | "position">;
