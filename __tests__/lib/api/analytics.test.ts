import { getExerciseAnalytics } from "@/lib/api/analytics";
import { api } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/client";

// Mock the API client
jest.mock("@/lib/api/client", () => ({
  api: {
    get: jest.fn()
  }
}));

const mockApi = api as jest.Mocked<typeof api>;

// Helper to create mock API responses
function createMockResponse<T>(data: T): ApiResponse<T> {
  return { data, status: 200, headers: new Headers() };
}

describe("Analytics API Client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getExerciseAnalytics sends correct API request and returns response", async () => {
    const responseData = {
      insights: [
        {
          type: "difficulty_wall",
          severity: "high",
          lesson_id: 5,
          slug: "fix-wall",
          title: "Fix the Wall",
          message: "13.2% of learners attempt this exercise but give up - likely a difficulty wall.",
          value: 13.2
        }
      ],
      exercises: [
        {
          lesson_id: 5,
          slug: "fix-wall",
          title: "Fix the Wall",
          health_score: 72,
          low_sample: false,
          num_starts: 100,
          num_in_progress: 10,
          num_completed: 80,
          num_bounced: 4,
          num_abandoned: 6,
          completion_pct: 88.9,
          bounce_pct: 4.4,
          abandon_pct: 6.7,
          reach_start_pct: 91.2,
          completer_median_attempts: 6,
          completer_p90_attempts: 43,
          abandoner_median_attempts: 8,
          struggle_ratio: 1.33,
          median_minutes_to_complete: 6.4,
          avg_difficulty: 2.71,
          avg_fun: 3.56,
          num_engaged: 70,
          ask_jiki_pct: 11.1
        }
      ]
    };

    mockApi.get.mockResolvedValue(createMockResponse(responseData));

    const result = await getExerciseAnalytics();

    expect(mockApi.get).toHaveBeenCalledWith("/admin/analytics/exercises");
    expect(result).toEqual(responseData);
  });

  test("getExerciseAnalytics propagates API errors", async () => {
    mockApi.get.mockRejectedValue(new Error("API Error: 500 Internal Server Error"));

    await expect(getExerciseAnalytics()).rejects.toThrow("API Error: 500 Internal Server Error");
  });
});
