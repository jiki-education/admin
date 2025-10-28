export interface Level {
  id: number;
  slug: string;
  title: string;
  description: string;
  position: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: number;
  slug: string;
  title: string;
  description: string;
  type: string;
  position: number;
  data: Record<string, any>;
}

export interface LevelsResponse {
  levels: Level[];
}

export interface UserLesson {
  id: number;
  lesson_slug: string;
  status: "not_started" | "started" | "completed";
}

export interface UserLevel {
  id: number;
  level_slug: string;
  user_lessons: UserLesson[];
}

export interface UserLevelsResponse {
  user_levels: UserLevel[];
}

export interface LevelWithProgress extends Level {
  userProgress?: UserLevel;
  status: "not_started" | "started" | "completed";
}
