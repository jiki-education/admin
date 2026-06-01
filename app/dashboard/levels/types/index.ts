// Admin-specific types for level management
export interface AdminLevel {
  id: number;
  slug: string;
  title: string;
  description: string;
  position: number;
  milestone_summary: string;
  milestone_content: string;
}

export interface AdminLesson {
  id: number;
  slug: string;
  title: string;
  description: string;
  type: string;
  position: number;
  data: Record<string, any>;
  walkthrough_video_data: Record<string, any> | null;
}

export interface AdminLevelFilters {
  course_slug?: string;
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
export type CreateLevelData = Omit<AdminLevel, "id" | "position" | "milestone_summary" | "milestone_content"> & {
  milestone_summary?: string;
  milestone_content?: string;
};
export type CreateLessonData = Omit<AdminLesson, "id" | "position" | "walkthrough_video_data"> & {
  walkthrough_video_data?: Record<string, any> | null;
};
