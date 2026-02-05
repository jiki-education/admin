import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useRouter } from "next/navigation";
import NewLevel from "@/app/dashboard/levels/new/page";
import { createLevel } from "@/lib/api/levels";

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => new URLSearchParams("course=python"))
}));

jest.mock("@/lib/api/levels", () => ({
  createLevel: jest.fn()
}));

jest.mock("@/stores/authStore", () => ({
  useAuthStore: () => ({
    isAuthenticated: true,
    hasCheckedAuth: true,
    checkAuth: jest.fn()
  })
}));

jest.mock("@/app/dashboard/levels/components/LevelForm", () => {
  return function MockLevelForm({ mode, onSave, onCancel }: any) {
    return (
      <div data-testid="level-form">
        <button onClick={() => onSave({ title: "Test", slug: "test", description: "Test desc" })}>Save</button>
        <button onClick={onCancel}>Cancel</button>
        <span>Mode: {mode}</span>
      </div>
    );
  };
});

const mockPush = jest.fn();
const mockCreateLevel = createLevel as jest.MockedFunction<typeof createLevel>;

describe("NewLevel Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    });
  });

  test("renders new level page with correct form mode and navigation", async () => {
    render(<NewLevel />);

    await waitFor(() => {
      expect(screen.getByText(/create new level/i)).toBeInTheDocument();
      expect(screen.getByTestId("level-form")).toBeInTheDocument();
      expect(screen.getByText("Mode: create")).toBeInTheDocument();
    });
  });

  test("handles successful level creation and navigation", async () => {
    const mockLevel = { id: 123, title: "Test", slug: "test", description: "Test desc", position: 1 };
    mockCreateLevel.mockResolvedValue(mockLevel);

    render(<NewLevel />);

    await waitFor(() => {
      const saveButton = screen.getByText("Save");
      saveButton.click();
    });

    await waitFor(() => {
      expect(mockCreateLevel).toHaveBeenCalledWith("python", {
        title: "Test",
        slug: "test",
        description: "Test desc"
      });
      expect(mockPush).toHaveBeenCalledWith("/dashboard/levels/123");
    });
  });

  test("handles cancel navigation back to levels list", async () => {
    render(<NewLevel />);

    await waitFor(() => {
      const cancelButton = screen.getByText("Cancel");
      cancelButton.click();
    });

    expect(mockPush).toHaveBeenCalledWith("/dashboard/levels");
  });
});
