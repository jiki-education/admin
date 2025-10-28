import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LessonForm from "@/app/dashboard/levels/components/LessonForm";
import type { CreateLessonData } from "@/app/dashboard/levels/types";

// Mock the JSONEditor component
jest.mock("@/app/dashboard/levels/components/JSONEditor", () => {
  return function MockJSONEditor({ value, onChange, onValidation }: any) {
    return (
      <textarea
        data-testid="json-editor"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          // Simulate validation
          try {
            JSON.parse(e.target.value || "{}");
            onValidation(null);
          } catch {
            onValidation("Invalid JSON");
          }
        }}
      />
    );
  };
});

const mockOnSave = jest.fn();
const mockOnCancel = jest.fn();

describe("LessonForm Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("validates required fields and lesson type selection", async () => {
    render(<LessonForm mode="create" levelId={1} onSave={mockOnSave} onCancel={mockOnCancel} />);

    const submitButton = screen.getByRole("button", { name: /create lesson/i });

    // Form should start invalid (empty required fields)
    expect(submitButton).toBeDisabled();

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "Test Lesson" }
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Test description" }
    });

    // Select lesson type
    const typeSelect = screen.getByLabelText(/type/i);
    fireEvent.change(typeSelect, { target: { value: "tutorial" } });

    // Now form should be valid
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  test("submits complete lesson data with JSON parsing", async () => {
    const mockSave = jest.fn().mockResolvedValue({});

    render(<LessonForm mode="create" levelId={123} onSave={mockSave} onCancel={mockOnCancel} />);

    // Fill in all form fields
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "Variables and Types" }
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Learn about variables" }
    });
    fireEvent.change(screen.getByLabelText(/type/i), {
      target: { value: "exercise" }
    });

    const jsonEditor = screen.getByTestId("json-editor");
    fireEvent.change(jsonEditor, {
      target: { value: '{"difficulty": "beginner", "timeEstimate": 30}' }
    });

    const submitButton = screen.getByRole("button", { name: /create lesson/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith({
        title: "Variables and Types",
        slug: "variables-and-types",
        description: "Learn about variables",
        type: "exercise",
        data: { difficulty: "beginner", timeEstimate: 30 }
      } as CreateLessonData);
    });
  });
});
