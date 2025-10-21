import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import Levels from '@/app/dashboard/levels/page';
import LevelDetail from '@/app/dashboard/levels/[id]/page';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('@/lib/api/levels', () => ({
  getAdminLevels: jest.fn(),
  getLevelLessons: jest.fn(),
}));

jest.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    isAuthenticated: true,
    hasCheckedAuth: true,
    checkAuth: jest.fn(),
  }),
}));

// Mock child components to focus on navigation
jest.mock('@/app/dashboard/levels/components/LevelFilters', () => {
  return function MockLevelFilters() {
    return <div data-testid="level-filters" />;
  };
});

jest.mock('@/app/dashboard/levels/components/LevelTable', () => {
  return function MockLevelTable() {
    return <div data-testid="level-table" />;
  };
});

jest.mock('@/app/dashboard/levels/components/LevelPagination', () => {
  return function MockLevelPagination() {
    return <div data-testid="level-pagination" />;
  };
});

jest.mock('@/app/dashboard/levels/components/LessonTable', () => {
  return function MockLessonTable() {
    return <div data-testid="lesson-table" />;
  };
});

jest.mock('@/app/dashboard/levels/components/LessonReorderControls', () => {
  return function useLessonReorderControls() {
    return { reorderLesson: jest.fn() };
  };
});

const mockPush = jest.fn();

describe('Navigation Buttons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  test('Add New Level button navigates to correct route', async () => {
    const { getAdminLevels } = await import('@/lib/api/levels');
    getAdminLevels.mockResolvedValue({
      results: [],
      meta: { current_page: 1, total_pages: 1, total_count: 0 }
    });

    render(<Levels />);

    const addButton = await screen.findByRole('button', { name: /add new level/i });
    expect(addButton).toBeInTheDocument();

    fireEvent.click(addButton);

    expect(mockPush).toHaveBeenCalledWith('/dashboard/levels/new');
  });

  test('Add New Lesson button navigates to correct route with level ID', async () => {
    const { useParams } = await import('next/navigation');
    const { getLevelLessons } = await import('@/lib/api/levels');
    
    useParams.mockReturnValue({ id: '123' });
    getLevelLessons.mockResolvedValue([]);

    render(<LevelDetail />);

    const addButton = await screen.findByRole('button', { name: /add new lesson/i });
    expect(addButton).toBeInTheDocument();

    fireEvent.click(addButton);

    expect(mockPush).toHaveBeenCalledWith('/dashboard/levels/123/lessons/new');
  });

  test('navigation buttons are properly positioned in UI layout', async () => {
    const { getAdminLevels } = await import('@/lib/api/levels');
    getAdminLevels.mockResolvedValue({
      results: [],
      meta: { current_page: 1, total_pages: 1, total_count: 0 }
    });

    render(<Levels />);

    // Check that button is in the header area with the title
    const header = screen.getByText(/level management/i).closest('div');
    const addButton = await screen.findByRole('button', { name: /add new level/i });
    
    expect(header).toContainElement(addButton);
    
    // Verify the layout structure
    expect(header).toHaveClass('flex', 'items-center', 'justify-between');
  });

  test('buttons are accessible with proper ARIA labels', async () => {
    const { getAdminLevels } = await import('@/lib/api/levels');
    getAdminLevels.mockResolvedValue({
      results: [],
      meta: { current_page: 1, total_pages: 1, total_count: 0 }
    });

    render(<Levels />);

    const addButton = await screen.findByRole('button', { name: /add new level/i });
    
    // Button should be accessible by role and name
    expect(addButton).toBeInTheDocument();
    expect(addButton).toHaveAttribute('type', 'button');
    
    // Should be keyboard accessible
    addButton.focus();
    expect(document.activeElement).toBe(addButton);
  });
});