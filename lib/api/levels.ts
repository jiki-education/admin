import type { Level, LevelWithProgress, LevelsResponse, UserLevel, UserLevelsResponse } from "@/types/levels";
import type { AdminLevelFilters, AdminLevelsResponse, AdminLevel, AdminLesson, CreateLevelData, CreateLessonData } from "@/app/dashboard/levels/types";
import { api } from "./client";

export async function fetchLevels(): Promise<Level[]> {
  const response = await api.get<LevelsResponse>("/levels");
  return response.data.levels;
}

export async function fetchUserLevels(): Promise<UserLevel[]> {
  const response = await api.get<UserLevelsResponse>("/user_levels");
  return response.data.user_levels;
}

export async function fetchLevelsWithProgress(): Promise<LevelWithProgress[]> {
  const [levels, userLevels] = await Promise.all([fetchLevels(), fetchUserLevels()]);

  // Create a map of user progress by level slug
  const userLevelMap = new Map(userLevels.map((ul) => [ul.level_slug, ul]));

  return levels.map((level) => {
    const userProgress = userLevelMap.get(level.slug);

    // Determine overall level status based on lesson progress
    let status: "not_started" | "started" | "completed" = "not_started";
    if (userProgress) {
      const completedCount = userProgress.user_lessons.filter((l) => l.status === "completed").length;
      const startedCount = userProgress.user_lessons.filter((l) => l.status === "started").length;

      if (completedCount === level.lessons.length) {
        status = "completed";
      } else if (completedCount > 0 || startedCount > 0) {
        status = "started";
      }
    }

    return {
      ...level,
      userProgress,
      status
    };
  });
}

// Admin API functions
export async function getAdminLevels(filters?: AdminLevelFilters): Promise<AdminLevelsResponse> {
  const params: Record<string, string> = {
    ...(filters?.title && { title: filters.title }),
    ...(filters?.slug && { slug: filters.slug }),
    ...(filters?.page && { page: filters.page.toString() }),
    ...(filters?.per && { per: filters.per.toString() })
  };

  const response = await api.get<AdminLevelsResponse>("/admin/levels", { params });
  return response.data;
}

export async function updateLevel(id: number, data: Partial<AdminLevel>): Promise<AdminLevel> {
  const response = await api.patch<{ level: AdminLevel }>(`/admin/levels/${id}`, { level: data });
  return response.data.level;
}

export async function getLevelLessons(levelId: number): Promise<AdminLesson[]> {
  const response = await api.get<{ lessons: AdminLesson[] }>(`/admin/levels/${levelId}/lessons`);
  return response.data.lessons;
}

export async function updateLesson(levelId: number, lessonId: number, data: Partial<AdminLesson>): Promise<AdminLesson> {
  const response = await api.patch<{ lesson: AdminLesson }>(`/admin/levels/${levelId}/lessons/${lessonId}`, { lesson: data });
  return response.data.lesson;
}

export async function createLevel(data: CreateLevelData): Promise<AdminLevel> {
  const response = await api.post<{ level: AdminLevel }>("/admin/levels", { level: data });
  return response.data.level;
}

export async function createLesson(levelId: number, data: CreateLessonData): Promise<AdminLesson> {
  const response = await api.post<{ lesson: AdminLesson }>(`/admin/levels/${levelId}/lessons`, { lesson: data });
  return response.data.lesson;
}
