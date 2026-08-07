import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ConceptForm from "@/app/dashboard/concepts/components/ConceptForm";

// Mock the slug utilities
jest.mock("@/lib/utils/slug", () => ({
  isValidSlug: (slug: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}));

// Mock the marked library
jest.mock("marked", () => ({
  marked: {
    parse: jest.fn((markdown: string) => Promise.resolve(`<p>${markdown}</p>`))
  }
}));

describe("ConceptForm", () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("pre-fills the slug in edit mode", () => {
    const initialData = {
      id: 1,
      slug: "existing-concept",
      content_markdown: "Test content"
    };

    render(<ConceptForm mode="edit" initialData={initialData} onSave={mockOnSave} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText(/slug/i)).toHaveValue("existing-concept");
  });

  test("validates required fields", () => {
    render(<ConceptForm mode="create" onSave={mockOnSave} onCancel={mockOnCancel} />);

    const submitButton = screen.getByRole("button", { name: /create concept/i });

    // Initially submit button should be disabled (no required fields filled)
    expect(submitButton).toBeDisabled();

    // Fill only the slug
    fireEvent.change(screen.getByLabelText(/slug/i), { target: { value: "test-concept" } });

    // Still disabled - missing content
    expect(submitButton).toBeDisabled();

    // Fill content (MarkdownEditor)
    const contentInput = screen.getByRole("textbox", { name: /content.*markdown/i });
    fireEvent.change(contentInput, { target: { value: "Test content" } });

    // Now should be enabled
    expect(submitButton).not.toBeDisabled();
  });
});
