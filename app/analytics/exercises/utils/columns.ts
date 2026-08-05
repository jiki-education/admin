import type { SortColumn } from "../types";

export interface ColumnDef {
  key: SortColumn;
  label: string;
}

export const COLUMNS: ColumnDef[] = [
  { key: "slug", label: "Exercise" },
  { key: "health_score", label: "Health" },
  { key: "num_starts", label: "Starts" },
  { key: "completion_pct", label: "Done %" },
  { key: "bounce_pct", label: "Bounce %" },
  { key: "abandon_pct", label: "Abandon %" },
  { key: "reach_start_pct", label: "Reach→Start %" },
  { key: "completer_median_attempts", label: "Attempts" },
  { key: "struggle_ratio", label: "Struggle" },
  { key: "median_minutes_to_complete", label: "Mins" },
  { key: "avg_difficulty", label: "Diff / Fun" },
  { key: "ask_jiki_pct", label: "Ask Jiki %" }
];
