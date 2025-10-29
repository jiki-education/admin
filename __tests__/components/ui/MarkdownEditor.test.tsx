import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MarkdownEditor } from '@/components/ui/markdown-editor';

// Mock the marked library
jest.mock('marked', () => ({
  marked: {
    parse: jest.fn((markdown: string) => Promise.resolve(`<p>${markdown.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`))
  }
}));

describe('MarkdownEditor', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders in edit mode by default', () => {
    render(
      <MarkdownEditor
        value=""
        onChange={mockOnChange}
        label="Test Editor"
      />
    );

    expect(screen.getByText('Test Editor')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toHaveClass('bg-brand-500');
    expect(screen.getByRole('button', { name: 'Preview' })).toHaveClass('bg-white');
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('calls onChange when typing in edit mode', () => {
    render(
      <MarkdownEditor
        value=""
        onChange={mockOnChange}
        label="Test Editor"
      />
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Hello **world**' } });

    expect(mockOnChange).toHaveBeenCalledWith('Hello **world**');
  });

  test('switches to preview mode and renders markdown', async () => {
    render(
      <MarkdownEditor
        value="Hello **world**"
        onChange={mockOnChange}
        label="Test Editor"
      />
    );

    const previewButton = screen.getByRole('button', { name: 'Preview' });
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('world')).toBeInTheDocument();
    });

    // Should not show textarea in preview mode
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  test('preview button is disabled when content is empty', () => {
    render(
      <MarkdownEditor
        value=""
        onChange={mockOnChange}
        label="Test Editor"
      />
    );

    const previewButton = screen.getByRole('button', { name: 'Preview' });
    expect(previewButton).toBeDisabled();
  });

  test('shows markdown help in edit mode', () => {
    render(
      <MarkdownEditor
        value=""
        onChange={mockOnChange}
        label="Test Editor"
      />
    );

    expect(screen.getByText('Markdown syntax help')).toBeInTheDocument();
  });

  test('shows error message when provided', () => {
    render(
      <MarkdownEditor
        value=""
        onChange={mockOnChange}
        label="Test Editor"
        error="This field is required"
      />
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  test('shows required indicator when required prop is true', () => {
    render(
      <MarkdownEditor
        value=""
        onChange={mockOnChange}
        label="Test Editor"
        required
      />
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });
});