// Admin-specific types for project management

export interface AdminProject {
  id: number;
  slug: string;
  exercise_slug: string;
  unlocked_by_lesson_id?: number | null;
}

export interface AdminProjectFilters {
  slug?: string;
  page?: number;
  per?: number;
}

export interface AdminProjectsResponse {
  results: AdminProject[];
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
  };
}

// Types for creating and updating projects
export type CreateProjectData = Omit<AdminProject, "id" | "slug" | "unlocked_by_lesson_id"> & {
  slug?: string; // Optional on create, auto-generated if not provided
};

export type UpdateProjectData = Partial<Omit<AdminProject, "id">> & {
  slug: string; // Required on update
};
