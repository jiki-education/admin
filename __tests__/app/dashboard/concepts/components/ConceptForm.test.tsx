import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ConceptForm from "@/app/dashboard/concepts/components/ConceptForm";

// Mock the slug utilities
jest.mock("@/lib/utils/slug", () => ({
  generateSlug: (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""),
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

  test("auto-generates slug from title in create mode", async () => {
    render(<ConceptForm mode="create" onSave={mockOnSave} onCancel={mockOnCancel} />);

    const titleInput = screen.getByLabelText(/title/i);
    const slugInput = screen.getByLabelText(/slug/i);

    // Type a title
    fireEvent.change(titleInput, { target: { value: "Introduction to Programming" } });

    // Wait for the slug to be auto-generated
    await waitFor(() => {
      expect(slugInput).toHaveValue("introduction-to-programming");
    });
  });

  test("stops auto-generating slug when user manually edits slug field", async () => {
    render(<ConceptForm mode="create" onSave={mockOnSave} onCancel={mockOnCancel} />);

    const titleInput = screen.getByLabelText(/title/i);
    const slugInput = screen.getByLabelText(/slug/i);

    // Type a title first
    fireEvent.change(titleInput, { target: { value: "First Title" } });
    await waitFor(() => {
      expect(slugInput).toHaveValue("first-title");
    });

    // Manually edit the slug
    fireEvent.change(slugInput, { target: { value: "custom-slug" } });

    // Change title again - slug should NOT update
    fireEvent.change(titleInput, { target: { value: "Second Title" } });

    // Slug should remain as manually edited
    expect(slugInput).toHaveValue("custom-slug");
  });

  test("does not auto-generate slug in edit mode", async () => {
    const initialData = {
      id: 1,
      title: "Existing Concept",
      slug: "existing-concept",
      description: "Test description",
      content_markdown: "Test content"
    };

    render(<ConceptForm mode="edit" initialData={initialData} onSave={mockOnSave} onCancel={mockOnCancel} />);

    const titleInput = screen.getByLabelText(/title/i);
    const slugInput = screen.getByLabelText(/slug/i);

    // Change the title
    fireEvent.change(titleInput, { target: { value: "Updated Title" } });

    // Slug should remain unchanged in edit mode
    expect(slugInput).toHaveValue("existing-concept");
  });

  test("validates required fields", async () => {
    render(<ConceptForm mode="create" onSave={mockOnSave} onCancel={mockOnCancel} />);

    const submitButton = screen.getByRole("button", { name: /create concept/i });

    // Initially submit button should be disabled (no required fields filled)
    expect(submitButton).toBeDisabled();

    // Fill only title
    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: "Test Title" } });

    // Still disabled - missing description and content
    expect(submitButton).toBeDisabled();

    // Fill description
    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, { target: { value: "Test description" } });

    // Still disabled - missing content
    expect(submitButton).toBeDisabled();

    // Fill content (MarkdownEditor)
    const contentInput = screen.getByRole("textbox", { name: /content.*markdown/i });
    fireEvent.change(contentInput, { target: { value: "Test content" } });

    // Now should be enabled
    expect(submitButton).not.toBeDisabled();
  });
});
