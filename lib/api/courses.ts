import { api } from "./client";

export interface Course {
  slug: string;
  title: string;
  description: string;
}

interface CoursesResponse {
  courses: Course[];
}

export async function getCourses(): Promise<Course[]> {
  const response = await api.get<CoursesResponse>("/internal/courses");
  return response.data.courses;
}
