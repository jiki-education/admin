import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SummaryFilters from '@/app/dashboard/email-templates/components/SummaryFilters';
import type { SummaryFilters as SummaryFiltersType } from '@/app/dashboard/email-templates/components/SummaryFilters';

describe('SummaryFilters', () => {
  const mockTemplateTypes = [
    { value: 'welcome', label: 'Welcome' },
    { value: 'level_completion', label: 'Level Completion' },
    { value: 'password_reset', label: 'Password Reset' }
  ];

  const mockOnFiltersChange = jest.fn();
  const mockOnClearFilters = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all filter inputs', () => {
    render(
      <SummaryFilters
        filters={{}}
        onFiltersChange={mockOnFiltersChange}
        templateTypes={mockTemplateTypes}
        onClearFilters={mockOnClearFilters}
      />
    );

    expect(screen.getByLabelText('Template Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Locale Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Search Template Slug')).toBeInTheDocument();
  });

  test('template type filter shows correct options', () => {
    render(
      <SummaryFilters
        filters={{}}
        onFiltersChange={mockOnFiltersChange}
        templateTypes={mockTemplateTypes}
        onClearFilters={mockOnClearFilters}
      />
    );

    const typeSelect = screen.getByLabelText('Template Type');
    expect(typeSelect).toHaveValue('');
    
    // Check that options exist (though not all may be visible without opening dropdown)
    expect(screen.getByText('All Types')).toBeInTheDocument();
  });

  test('locale status filter has correct options', () => {
    render(
      <SummaryFilters
        filters={{}}
        onFiltersChange={mockOnFiltersChange}
        templateTypes={mockTemplateTypes}
        onClearFilters={mockOnClearFilters}
      />
    );

    const statusSelect = screen.getByLabelText('Locale Status');
    expect(statusSelect).toHaveValue('all');
    
    expect(screen.getByText('All Templates')).toBeInTheDocument();
    expect(screen.getByText('Complete (all locales implemented)')).toBeInTheDocument();
    expect(screen.getByText('Has Missing Locales')).toBeInTheDocument();
    expect(screen.getByText('Has WIP Locales')).toBeInTheDocument();
  });

  test('calls onFiltersChange when template type is selected', () => {
    render(
      <SummaryFilters
        filters={{}}
        onFiltersChange={mockOnFiltersChange}
        templateTypes={mockTemplateTypes}
        onClearFilters={mockOnClearFilters}
      />
    );

    const typeSelect = screen.getByLabelText('Template Type');
    fireEvent.change(typeSelect, { target: { value: 'welcome' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({ type: 'welcome' });
  });

  test('calls onFiltersChange when locale status is selected', () => {
    render(
      <SummaryFilters
        filters={{}}
        onFiltersChange={mockOnFiltersChange}
        templateTypes={mockTemplateTypes}
        onClearFilters={mockOnClearFilters}
      />
    );

    const statusSelect = screen.getByLabelText('Locale Status');
    fireEvent.change(statusSelect, { target: { value: 'missing' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({ localeStatus: 'missing' });
  });

  test('calls onFiltersChange when search text is entered', () => {
    render(
      <SummaryFilters
        filters={{}}
        onFiltersChange={mockOnFiltersChange}
        templateTypes={mockTemplateTypes}
        onClearFilters={mockOnClearFilters}
      />
    );

    const searchInput = screen.getByLabelText('Search Template Slug');
    fireEvent.change(searchInput, { target: { value: 'signup' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({ search: 'signup' });
  });

  test('shows clear filters button when filters are active', () => {
    const filters: SummaryFiltersType = { type: 'welcome', search: 'test' };
    
    render(
      <SummaryFilters
        filters={filters}
        onFiltersChange={mockOnFiltersChange}
        templateTypes={mockTemplateTypes}
        onClearFilters={mockOnClearFilters}
      />
    );

    expect(screen.getByText('Clear Filters')).toBeInTheDocument();
  });

  test('hides clear filters button when no filters are active', () => {
    render(
      <SummaryFilters
        filters={{}}
        onFiltersChange={mockOnFiltersChange}
        templateTypes={mockTemplateTypes}
        onClearFilters={mockOnClearFilters}
      />
    );

    expect(screen.queryByText('Clear Filters')).not.toBeInTheDocument();
  });

  test('calls onClearFilters when clear button is clicked', () => {
    const filters: SummaryFiltersType = { type: 'welcome' };
    
    render(
      <SummaryFilters
        filters={filters}
        onFiltersChange={mockOnFiltersChange}
        templateTypes={mockTemplateTypes}
        onClearFilters={mockOnClearFilters}
      />
    );

    const clearButton = screen.getByText('Clear Filters');
    fireEvent.click(clearButton);

    expect(mockOnClearFilters).toHaveBeenCalled();
  });

  test('displays current filter values', () => {
    const filters: SummaryFiltersType = {
      type: 'welcome',
      localeStatus: 'missing',
      search: 'signup'
    };
    
    render(
      <SummaryFilters
        filters={filters}
        onFiltersChange={mockOnFiltersChange}
        templateTypes={mockTemplateTypes}
        onClearFilters={mockOnClearFilters}
      />
    );

    const typeSelect = screen.getByLabelText('Template Type');
    const statusSelect = screen.getByLabelText('Locale Status');
    const searchInput = screen.getByLabelText('Search Template Slug');

    expect(typeSelect.value).toBe('welcome');
    expect(statusSelect.value).toBe('missing');
    expect(searchInput.value).toBe('signup');
  });
});