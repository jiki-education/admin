import { createLevel, createLesson } from "@/lib/api/levels";
import { api } from "@/lib/api/client";
import type { CreateLevelData, CreateLessonData } from "@/app/dashboard/levels/types";

// Mock the API client
jest.mock("@/lib/api/client", () => ({
  api: {
    post: jest.fn()
  }
}));

const mockApi = api as jest.Mocked<typeof api>;

describe("Levels API Client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createLevel sends correct API request and returns level data", async () => {
    const levelData: CreateLevelData = {
      title: "Introduction to Programming",
      slug: "intro-to-programming",
      description: "Learn the basics of programming"
    };

    const mockResponse = {
      data: {
        level: {
          id: 123,
          title: "Introduction to Programming",
          slug: "intro-to-programming",
          description: "Learn the basics of programming",
          position: 5
        }
      }
    };

    mockApi.post.mockResolvedValue({ ...mockResponse, status: 201, headers: new Headers() });

    const result = await createLevel("python", levelData);

    expect(mockApi.post).toHaveBeenCalledWith(
      "/admin/levels",
      { level: levelData },
      { params: { course_slug: "python" } }
    );

    expect(result).toEqual({
      id: 123,
      title: "Introduction to Programming",
      slug: "intro-to-programming",
      description: "Learn the basics of programming",
      position: 5
    });
  });

  test("createLesson sends correct API request with level ID and returns lesson data", async () => {
    const levelId = 123;
    const lessonData: CreateLessonData = {
      title: "Variables and Data Types",
      slug: "variables-and-types",
      description: "Understanding variables and basic data types",
      type: "exercise",
      data: { difficulty: "beginner", estimatedTime: 30 }
    };

    const mockResponse = {
      data: {
        lesson: {
          id: 456,
          title: "Variables and Data Types",
          slug: "variables-and-types",
          description: "Understanding variables and basic data types",
          type: "exercise",
          position: 3,
          data: { difficulty: "beginner", estimatedTime: 30 }
        }
      }
    };

    mockApi.post.mockResolvedValue({ ...mockResponse, status: 201, headers: new Headers() });

    const result = await createLesson(levelId, lessonData);

    expect(mockApi.post).toHaveBeenCalledWith("/admin/levels/123/lessons", {
      lesson: lessonData
    });

    expect(result).toEqual({
      id: 456,
      title: "Variables and Data Types",
      slug: "variables-and-types",
      description: "Understanding variables and basic data types",
      type: "exercise",
      position: 3,
      data: { difficulty: "beginner", estimatedTime: 30 }
    });
  });

  test("API functions handle errors properly", async () => {
    const apiError = new Error("API Error: Duplicate slug");
    mockApi.post.mockRejectedValue(apiError);

    const levelData: CreateLevelData = {
      title: "Test",
      slug: "duplicate-slug",
      description: "Test"
    };

    await expect(createLevel("python", levelData)).rejects.toThrow("API Error: Duplicate slug");

    await expect(
      createLesson(1, {
        title: "Test",
        slug: "test",
        description: "Test",
        type: "exercise",
        data: {}
      })
    ).rejects.toThrow("API Error: Duplicate slug");
  });
});
