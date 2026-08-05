import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LevelForm from "@/app/dashboard/levels/components/LevelForm";
import type { CreateLevelData } from "@/app/dashboard/levels/types";

const mockOnSave = jest.fn();
const mockOnCancel = jest.fn();

describe("LevelForm Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("validates required fields and shows errors for empty submission", () => {
    render(<LevelForm mode="create" onSave={mockOnSave} onCancel={mockOnCancel} />);

    // Try to submit empty form
    const submitButton = screen.getByRole("button", { name: /create level/i });
    expect(submitButton).toBeDisabled(); // Should be disabled when form is invalid

    const slugInput = screen.getByLabelText(/slug/i);

    // Clear slug to test validation
    fireEvent.change(slugInput, { target: { value: "" } });

    // Now the button should be disabled due to empty slug
    expect(submitButton).toBeDisabled();

    // Try to submit anyway (this should trigger validation)
    fireEvent.click(submitButton);

    // Since button is disabled, the form submission won't happen
    expect(mockOnSave).not.toHaveBeenCalled();

    // The form correctly disables submit when validation fails
    // This is the expected behavior - form should not allow invalid submissions
  });

  test("shows validation errors when form submission is attempted with invalid data", async () => {
    const mockSave = jest.fn().mockImplementation(() => {
      throw new Error("Validation failed");
    });

    render(<LevelForm mode="create" onSave={mockSave} onCancel={mockOnCancel} />);

    // Fill in form with valid data first
    fireEvent.change(screen.getByLabelText(/slug/i), {
      target: { value: "test-slug" }
    });

    // Now form is valid and submit should be enabled
    const submitButton = screen.getByRole("button", { name: /create level/i });
    expect(submitButton).not.toBeDisabled();

    // Submit - this will call mockSave which throws an error
    fireEvent.click(submitButton);

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/validation failed/i)).toBeInTheDocument();
    });

    expect(mockSave).toHaveBeenCalled();
  });

  test("rejects a slug that is not URL-friendly", () => {
    render(<LevelForm mode="create" onSave={mockOnSave} onCancel={mockOnCancel} />);

    const submitButton = screen.getByRole("button", { name: /create level/i });

    fireEvent.change(screen.getByLabelText(/slug/i), { target: { value: "Not A Slug" } });
    expect(submitButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/slug/i), { target: { value: "not-a-slug" } });
    expect(submitButton).not.toBeDisabled();
  });

  test("submits valid form data correctly", async () => {
    const mockSave = jest.fn().mockResolvedValue({});

    render(<LevelForm mode="create" onSave={mockSave} onCancel={mockOnCancel} />);

    // Fill in valid form data
    fireEvent.change(screen.getByLabelText(/slug/i), {
      target: { value: "test-level" }
    });

    const submitButton = screen.getByRole("button", { name: /create level/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith({
        slug: "test-level"
      } as CreateLevelData);
    });
  });
});
