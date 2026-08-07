export type InsightType = "difficulty_wall" | "bounce" | "pre_start_dropoff" | "fun_crash" | "ask_jiki_underuse";
export type InsightSeverity = "high" | "medium";

export interface ExerciseInsight {
  type: InsightType;
  severity: InsightSeverity;
  lesson_id: number;
  slug: string;
  message: string;
  value: number;
}

export interface ExerciseAnalytics {
  lesson_id: number;
  slug: string;
  health_score: number | null;
  low_sample: boolean;
  num_starts: number;
  num_in_progress: number;
  num_completed: number;
  num_bounced: number;
  num_abandoned: number;
  completion_pct: number | null;
  bounce_pct: number | null;
  abandon_pct: number | null;
  reach_start_pct: number | null;
  completer_median_attempts: number | null;
  completer_p90_attempts: number | null;
  abandoner_median_attempts: number | null;
  struggle_ratio: number | null;
  median_minutes_to_complete: number | null;
  avg_difficulty: number | null;
  avg_fun: number | null;
  num_engaged: number;
  ask_jiki_pct: number | null;
}

export interface ExerciseAnalyticsResponse {
  insights: ExerciseInsight[];
  exercises: ExerciseAnalytics[];
}

export type SortColumn =
  | "slug"
  | "health_score"
  | "num_starts"
  | "completion_pct"
  | "bounce_pct"
  | "abandon_pct"
  | "reach_start_pct"
  | "completer_median_attempts"
  | "struggle_ratio"
  | "median_minutes_to_complete"
  | "avg_difficulty"
  | "ask_jiki_pct";

export type SortDirection = "asc" | "desc";
