import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TabNavigation from '@/app/dashboard/email-templates/components/TabNavigation';

describe('TabNavigation', () => {
  const mockOnTabChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders both tab buttons', () => {
    render(
      <TabNavigation
        activeTab="templates"
        onTabChange={mockOnTabChange}
      />
    );

    expect(screen.getByText('Templates')).toBeInTheDocument();
    expect(screen.getByText('Summary')).toBeInTheDocument();
  });

  test('highlights active tab correctly', () => {
    render(
      <TabNavigation
        activeTab="templates"
        onTabChange={mockOnTabChange}
      />
    );

    const templatesButton = screen.getByText('Templates');
    const summaryButton = screen.getByText('Summary');

    // Active tab should have different styling
    expect(templatesButton).toHaveClass('text-gray-900', 'bg-white');
    expect(summaryButton).toHaveClass('text-gray-500');
  });

  test('highlights summary tab when active', () => {
    render(
      <TabNavigation
        activeTab="summary"
        onTabChange={mockOnTabChange}
      />
    );

    const templatesButton = screen.getByText('Templates');
    const summaryButton = screen.getByText('Summary');

    expect(summaryButton).toHaveClass('text-gray-900', 'bg-white');
    expect(templatesButton).toHaveClass('text-gray-500');
  });

  test('calls onTabChange when templates tab is clicked', () => {
    render(
      <TabNavigation
        activeTab="summary"
        onTabChange={mockOnTabChange}
      />
    );

    const templatesButton = screen.getByText('Templates');
    fireEvent.click(templatesButton);

    expect(mockOnTabChange).toHaveBeenCalledWith('templates');
  });

  test('calls onTabChange when summary tab is clicked', () => {
    render(
      <TabNavigation
        activeTab="templates"
        onTabChange={mockOnTabChange}
      />
    );

    const summaryButton = screen.getByText('Summary');
    fireEvent.click(summaryButton);

    expect(mockOnTabChange).toHaveBeenCalledWith('summary');
  });

  test('tabs are keyboard accessible', () => {
    render(
      <TabNavigation
        activeTab="templates"
        onTabChange={mockOnTabChange}
      />
    );

    const templatesButton = screen.getByText('Templates');
    const summaryButton = screen.getByText('Summary');

    // Should be focusable
    templatesButton.focus();
    expect(document.activeElement).toBe(templatesButton);

    summaryButton.focus();
    expect(document.activeElement).toBe(summaryButton);
  });

  test('renders with proper button roles', () => {
    render(
      <TabNavigation
        activeTab="templates"
        onTabChange={mockOnTabChange}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent('Templates');
    expect(buttons[1]).toHaveTextContent('Summary');
  });
});