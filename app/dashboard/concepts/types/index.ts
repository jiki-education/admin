// Admin-specific types for concept management

export interface AdminConcept {
  id: number;
  title: string;
  slug: string;
  description: string;
  content_markdown: string;
  standard_video_provider?: "youtube" | "mux" | null;
  standard_video_id?: string | null;
  premium_video_provider?: "youtube" | "mux" | null;
  premium_video_id?: string | null;
}

export interface AdminConceptFilters {
  title?: string;
  page?: number;
  per?: number;
}

export interface AdminConceptsResponse {
  results: AdminConcept[];
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
  };
}

// Types for creating and updating concepts
export type CreateConceptData = Omit<AdminConcept, "id" | "slug"> & {
  slug?: string; // Optional on create, auto-generated if not provided
};

export type UpdateConceptData = Partial<Omit<AdminConcept, "id">> & {
  slug: string; // Required on update
};

// Video provider types
export type VideoProvider = "youtube" | "mux";

export interface VideoSection {
  provider?: VideoProvider | null;
  video_id?: string | null;
}
