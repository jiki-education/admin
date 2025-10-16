import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LessonForm from '@/app/dashboard/levels/components/LessonForm';

// Mock the JSONEditor component to test its integration
jest.mock('@/app/dashboard/levels/components/JSONEditor', () => {
  return function MockJSONEditor({ value, onChange, onValidation, placeholder }: any) {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      onChange(newValue);
      
      // Simulate real JSON validation logic
      if (!newValue.trim()) {
        onValidation(null); // Empty is valid
        return;
      }
      
      try {
        JSON.parse(newValue);
        onValidation(null); // Valid JSON
      } catch (error) {
        onValidation('Invalid JSON format'); // Invalid JSON
      }
    };

    return (
      <div data-testid="json-editor-wrapper">
        <textarea
          data-testid="json-editor"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="json-editor-textarea"
        />
      </div>
    );
  };
});

const mockOnSave = jest.fn();
const mockOnCancel = jest.fn();

describe('JSON Editor Validation Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });


  test('allows empty JSON data and treats it as valid', async () => {
    render(
      <LessonForm
        mode="create"
        levelId={1}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/title/i), { 
      target: { value: 'Test Lesson' } 
    });
    fireEvent.change(screen.getByLabelText(/description/i), { 
      target: { value: 'Test description' } 
    });

    const jsonEditor = screen.getByTestId('json-editor');
    
    // Leave JSON empty
    fireEvent.change(jsonEditor, { target: { value: '' } });

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /create lesson/i });
      expect(submitButton).not.toBeDisabled();
      expect(screen.queryByText(/invalid json/i)).not.toBeInTheDocument();
    });
  });

  test('properly parses and submits valid JSON data', async () => {
    const mockSave = jest.fn().mockResolvedValue({});
    
    render(
      <LessonForm
        mode="create"
        levelId={1}
        onSave={mockSave}
        onCancel={mockOnCancel}
      />
    );

    // Fill in all fields including JSON
    fireEvent.change(screen.getByLabelText(/title/i), { 
      target: { value: 'Test Lesson' } 
    });
    fireEvent.change(screen.getByLabelText(/description/i), { 
      target: { value: 'Test description' } 
    });

    const jsonEditor = screen.getByTestId('json-editor');
    const complexJsonData = JSON.stringify({
      difficulty: 'intermediate',
      prerequisites: ['basic-concepts'],
      estimatedTime: 45,
      resources: {
        documentation: 'https://example.com/docs',
        exercises: ['exercise-1', 'exercise-2']
      }
    }, null, 2);

    fireEvent.change(jsonEditor, { target: { value: complexJsonData } });

    const submitButton = screen.getByRole('button', { name: /create lesson/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({
        data: {
          difficulty: 'intermediate',
          prerequisites: ['basic-concepts'],
          estimatedTime: 45,
          resources: {
            documentation: 'https://example.com/docs',
            exercises: ['exercise-1', 'exercise-2']
          }
        }
      }));
    });
  });

});