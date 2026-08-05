import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ExerciseAnalyticsPage from "@/app/analytics/exercises/page";
import { getExerciseAnalytics } from "@/lib/api/analytics";
import type { ExerciseAnalytics, ExerciseAnalyticsResponse } from "@/app/analytics/exercises/types";

// Mock the analytics API
jest.mock("@/lib/api/analytics", () => ({
  getExerciseAnalytics: jest.fn()
}));

const mockGetExerciseAnalytics = getExerciseAnalytics as jest.MockedFunction<typeof getExerciseAnalytics>;

function buildExercise(overrides: Partial<ExerciseAnalytics> = {}): ExerciseAnalytics {
  return {
    lesson_id: 5,
    slug: "fix-wall",
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
    ask_jiki_pct: 11.1,
    ...overrides
  };
}

const RESPONSE: ExerciseAnalyticsResponse = {
  insights: [
    {
      type: "difficulty_wall",
      severity: "high",
      lesson_id: 5,
      slug: "fix-wall",
      message: "13.2% of learners attempt this exercise but give up - likely a difficulty wall.",
      value: 13.2
    },
    {
      type: "ask_jiki_underuse",
      severity: "medium",
      lesson_id: 7,
      slug: "paint-fence",
      message: "Learners rarely open Ask Jiki here despite struggling.",
      value: 2.1
    }
  ],
  exercises: [
    buildExercise({ lesson_id: 7, slug: "paint-fence", health_score: 90 }),
    buildExercise(),
    buildExercise({
      lesson_id: 9,
      slug: "empty-garden",
      health_score: null,
      low_sample: true,
      num_starts: 5,
      num_in_progress: 0,
      completion_pct: null,
      bounce_pct: null,
      abandon_pct: null,
      reach_start_pct: null,
      completer_median_attempts: null,
      completer_p90_attempts: null,
      abandoner_median_attempts: null,
      struggle_ratio: null,
      median_minutes_to_complete: null,
      avg_difficulty: null,
      avg_fun: null,
      ask_jiki_pct: null
    })
  ]
};

function bodyRowSlugs(): string[] {
  const [, ...rows] = screen.getAllByRole("row");
  return rows.map((row) => row.querySelector("td div")?.textContent ?? "");
}

describe("ExerciseAnalyticsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders insights with type badges and messages", async () => {
    mockGetExerciseAnalytics.mockResolvedValue(RESPONSE);
    render(<ExerciseAnalyticsPage />);

    expect(await screen.findByText("Difficulty wall")).toBeInTheDocument();
    expect(screen.getByText("Ask Jiki underuse")).toBeInTheDocument();
    expect(
      screen.getByText("13.2% of learners attempt this exercise but give up - likely a difficulty wall.")
    ).toBeInTheDocument();
    expect(screen.getByText("Learners rarely open Ask Jiki here despite struggling.")).toBeInTheDocument();
  });

  test("shows 'No issues detected' when there are no insights", async () => {
    mockGetExerciseAnalytics.mockResolvedValue({ insights: [], exercises: [buildExercise()] });
    render(<ExerciseAnalyticsPage />);

    expect(await screen.findByText("No issues detected")).toBeInTheDocument();
  });

  test("renders a table row per exercise with formatted values", async () => {
    mockGetExerciseAnalytics.mockResolvedValue(RESPONSE);
    render(<ExerciseAnalyticsPage />);

    expect(await screen.findAllByText("fix-wall")).not.toHaveLength(0);
    // Header row + 3 exercise rows
    expect(screen.getAllByRole("row")).toHaveLength(4);
    // Percentages with one decimal, in-progress and p90 annotations
    expect(screen.getAllByText("88.9%")).toHaveLength(2);
    expect(screen.getAllByText("+10 active")).toHaveLength(2);
    expect(screen.getAllByText("/ p90 43")).toHaveLength(2);
  });

  test("preserves course order by default and sorts worst-first when clicking Health", async () => {
    mockGetExerciseAnalytics.mockResolvedValue(RESPONSE);
    render(<ExerciseAnalyticsPage />);
    await screen.findAllByText("fix-wall");

    expect(bodyRowSlugs()).toEqual(["paint-fence", "fix-wall", "empty-garden"]);

    fireEvent.click(screen.getByRole("button", { name: "Health" }));
    expect(bodyRowSlugs()).toEqual(["fix-wall", "paint-fence", "empty-garden"]);

    // Clicking again reverses the sort (nulls stay last)
    fireEvent.click(screen.getByRole("button", { name: /Health/ }));
    expect(bodyRowSlugs()).toEqual(["paint-fence", "fix-wall", "empty-garden"]);
  });

  test("renders low-sample exercises muted with n/a health and dashes for nulls", async () => {
    mockGetExerciseAnalytics.mockResolvedValue(RESPONSE);
    render(<ExerciseAnalyticsPage />);

    const healthNa = await screen.findByTitle("Fewer than 30 classifiable sessions");
    expect(healthNa).toHaveTextContent("n/a");

    const lowSampleRow = screen.getByText("empty-garden").closest("tr");
    expect(lowSampleRow).toHaveClass("opacity-60");
    expect(lowSampleRow?.textContent).toContain("–");
  });

  test("shows error state when the API request fails", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockGetExerciseAnalytics.mockRejectedValue(new Error("API Error: 500 Internal Server Error"));
    render(<ExerciseAnalyticsPage />);

    expect(await screen.findByText("API Error: 500 Internal Server Error")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
