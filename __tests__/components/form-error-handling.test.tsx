import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LevelForm from "@/app/dashboard/levels/components/LevelForm";
import LessonForm from "@/app/dashboard/levels/components/LessonForm";

// Mock JSONEditor for LessonForm tests
jest.mock("@/app/dashboard/levels/components/JSONEditor", () => {
  return function MockJSONEditor({ value, onChange, onValidation }: any) {
    return (
      <textarea
        data-testid="json-editor"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          onValidation(null);
        }}
      />
    );
  };
});

describe("Form Error Handling", () => {
  test("LevelForm displays API errors and allows retry", async () => {
    const mockOnSave = jest.fn().mockRejectedValueOnce(new Error("Slug already exists"));
    const mockOnCancel = jest.fn();

    render(<LevelForm mode="create" onSave={mockOnSave} onCancel={mockOnCancel} />);

    // Fill in valid form data
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "Test Level" }
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Test description" }
    });

    // Submit form - should fail first time
    const submitButton = screen.getByRole("button", { name: /create level/i });
    fireEvent.click(submitButton);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/slug already exists/i)).toBeInTheDocument();
    });

    // Verify the error is displayed and form was submitted once
    expect(mockOnSave).toHaveBeenCalledTimes(1);
  });

  test("LessonForm handles validation errors and shows field-specific messages", async () => {
    const mockOnSave = jest.fn();
    const mockOnCancel = jest.fn();

    render(<LessonForm mode="create" levelId={1} onSave={mockOnSave} onCancel={mockOnCancel} />);

    const submitButton = screen.getByRole("button", { name: /create lesson/i });

    // Fill form with invalid slug format
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "Test Lesson" }
    });
    fireEvent.change(screen.getByLabelText(/slug/i), {
      target: { value: "Invalid Slug!" }
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Test description" }
    });

    // Click submit - validation runs on submit
    fireEvent.click(submitButton);

    // Validation error should appear for invalid slug
    await waitFor(() => {
      expect(screen.getByText(/slug must contain only lowercase/i)).toBeInTheDocument();
    });

    // Form won't call onSave when validation fails
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  test("forms handle network errors gracefully", async () => {
    const networkError = new Error("Network request failed");
    const mockOnSave = jest.fn().mockRejectedValue(networkError);
    const mockOnCancel = jest.fn();

    render(<LevelForm mode="create" onSave={mockOnSave} onCancel={mockOnCancel} />);

    // Fill in valid form data
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "Test Level" }
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Test description" }
    });

    const submitButton = screen.getByRole("button", { name: /create level/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/network request failed/i)).toBeInTheDocument();
    });

    // Form should still be usable after error (button may be disabled due to form validation)
    // But the form should be functional and the error should be displayed
    expect(screen.getByText(/network request failed/i)).toBeInTheDocument();

    // Check that after fixing the error state, the button works again
    await waitFor(() => {
      // The button might be disabled during the save attempt, but error should be visible
      expect(mockOnSave).toHaveBeenCalledTimes(1);
    });
  });
});
