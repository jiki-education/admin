import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useRouter, useParams } from "next/navigation";
import NewLesson from "@/app/dashboard/levels/[id]/lessons/new/page";
import { createLesson, getAdminLevels } from "@/lib/api/levels";

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useParams: jest.fn()
}));

jest.mock("@/lib/api/levels", () => ({
  createLesson: jest.fn(),
  getAdminLevels: jest.fn()
}));

jest.mock("@/stores/authStore", () => ({
  useAuthStore: () => ({
    isAuthenticated: true,
    hasCheckedAuth: true,
    checkAuth: jest.fn()
  })
}));

jest.mock("@/app/dashboard/levels/components/LessonForm", () => {
  return function MockLessonForm({ mode, levelId, onSave, onCancel }: any) {
    return (
      <div data-testid="lesson-form">
        <button
          onClick={() =>
            onSave({
              title: "Test Lesson",
              slug: "test-lesson",
              description: "Test desc",
              type: "exercise",
              data: {}
            })
          }
        >
          Save
        </button>
        <button onClick={onCancel}>Cancel</button>
        <span>Mode: {mode}</span>
        <span>Level ID: {levelId}</span>
      </div>
    );
  };
});

const mockPush = jest.fn();
const mockCreateLesson = createLesson as jest.MockedFunction<typeof createLesson>;
const mockGetAdminLevels = getAdminLevels as jest.MockedFunction<typeof getAdminLevels>;

describe("NewLesson Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    });
    (useParams as jest.Mock).mockReturnValue({
      id: "123"
    });
  });

  test("loads level context and renders lesson form with level information", async () => {
    const mockLevel = {
      id: 123,
      title: "Test Level",
      slug: "test-level",
      description: "Test level description",
      position: 1
    };

    mockGetAdminLevels.mockResolvedValue({
      results: [mockLevel],
      meta: { current_page: 1, total_pages: 1, total_count: 1 }
    });

    render(<NewLesson />);

    await waitFor(() => {
      expect(screen.getByText(/add new lesson/i)).toBeInTheDocument();
      expect(screen.getByText(/adding lesson to:/i)).toBeInTheDocument();
      expect(screen.getAllByText("Test Level")).toHaveLength(2); // One in subtitle, one in level card
      expect(screen.getByText("Level ID: 123")).toBeInTheDocument();
    });

    // Check level context card is displayed
    expect(screen.getByText("Test level description")).toBeInTheDocument();
    expect(screen.getByText(/slug:/i)).toBeInTheDocument();
  });

  test("handles successful lesson creation and navigation back to level", async () => {
    const mockLevel = {
      id: 123,
      title: "Test Level",
      slug: "test-level",
      description: "Test description",
      position: 1
    };

    const mockLesson = {
      id: 456,
      title: "Test Lesson",
      slug: "test-lesson",
      description: "Test desc",
      type: "exercise",
      position: 1,
      data: {}
    };

    mockGetAdminLevels.mockResolvedValue({
      results: [mockLevel],
      meta: { current_page: 1, total_pages: 1, total_count: 1 }
    });
    mockCreateLesson.mockResolvedValue(mockLesson);

    render(<NewLesson />);

    await waitFor(() => {
      const saveButton = screen.getByText("Save");
      saveButton.click();
    });

    await waitFor(() => {
      expect(mockCreateLesson).toHaveBeenCalledWith(123, {
        title: "Test Lesson",
        slug: "test-lesson",
        description: "Test desc",
        type: "exercise",
        data: {}
      });
      expect(mockPush).toHaveBeenCalledWith("/dashboard/levels/123");
    });
  });

  test("handles level not found error gracefully", async () => {
    mockGetAdminLevels.mockResolvedValue({
      results: [], // No levels found
      meta: { current_page: 1, total_pages: 0, total_count: 0 }
    });

    render(<NewLesson />);

    await waitFor(() => {
      expect(screen.getByText(/level not found/i)).toBeInTheDocument();
      expect(screen.getByText(/go back to levels/i)).toBeInTheDocument();
    });
  });
});
