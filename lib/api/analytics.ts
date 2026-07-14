import type { ExerciseAnalyticsResponse } from "@/app/analytics/exercises/types";
import { api } from "./client";

export async function getExerciseAnalytics(): Promise<ExerciseAnalyticsResponse> {
  const response = await api.get<ExerciseAnalyticsResponse>("/admin/analytics/exercises");
  return response.data;
}
