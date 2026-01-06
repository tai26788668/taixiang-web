import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { Select } from '../Select';

const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3', disabled: true },
];

describe('Select', () => {
  describe('Rendering', () => {
    test('should render select field', () => {
      render(<Select options={mockOptions} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    test('should render with label', () => {
      render(<Select label="Test Label" options={mockOptions} />);
      
      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    test('should render with required indicator', () => {
      render(<Select label="Required Field" options={mockOptions} required />);
      
      expect(screen.getByText('*')).toBeInTheDocument();
      expect(screen.getByText('*')).toHaveClass('text-red-500');
    });

    test('should render with helper text', () => {
      render(<Select options={mockOptions} helperText="This is helper text" />);
      
      expect(screen.getByText('This is helper text')).toBeInTheDocument();
      expect(screen.getByText('This is helper text')).toHaveClass('text-gray-500');
    });

    test('should render with error message', () => {
      render(<Select options={mockOptions} error="This is an error" />);
      
      expect(screen.getByText('This is an error')).toBeInTheDocument();
      expect(screen.getByText('This is an error')).toHaveClass('text-red-600');
    });

    test('should prioritize error over helper text', () => {
      render(<Select options={mockOptions} error="Error message" helperText="Helper text" />);
      
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    });

    test('should apply custom className', () => {
      render(<Select options={mockOptions} className="custom-class" />);
      const select = screen.getByRole('combobox');
      
      expect(select).toHaveClass('custom-class');
    });
  });

  describe('Options', () => {
    test('should render all options', () => {
      render(<Select options={mockOptions} />);
      
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    test('should render placeholder option when provided', () => {
      render(<Select options={mockOptions} placeholder="Choose an option" />);
      
      expect(screen.getByText('Choose an option')).toBeInTheDocument();
      const placeholderOption = screen.getByRole('option', { name: 'Choose an option' });
      expect(placeholderOption).toHaveAttribute('value', '');
      expect(placeholderOption).toBeDisabled();
    });

    test('should handle disabled options', () => {
      render(<Select options={mockOptions} />);
      
      const disabledOption = screen.getByRole('option', { name: 'Option 3' });
      expect(disabledOption).toBeDisabled();
    });

    test('should render options with correct values', () => {
      render(<Select options={mockOptions} />);
      
      const option1 = screen.getByRole('option', { name: 'Option 1' });
      const option2 = screen.getByRole('option', { name: 'Option 2' });
      
      expect(option1).toHaveAttribute('value', 'option1');
      expect(option2).toHaveAttribute('value', 'option2');
    });
  });

  describe('States', () => {
    test('should show error state styling', () => {
      render(<Select options={mockOptions} error="Error message" />);
      const select = screen.getByRole('combobox');
      
      expect(select).toHaveClass('border-red-500', 'focus:ring-red-500');
    });

    test('should show normal state styling', () => {
      render(<Select options={mockOptions} />);
      const select = screen.getByRole('combobox');
      
      expect(select).toHaveClass('border-gray-300', 'focus:ring-blue-500');
    });

    test('should be disabled when disabled prop is true', () => {
      render(<Select options={mockOptions} disabled />);
      const select = screen.getByRole('combobox');
      
      expect(select).toBeDisabled();
      expect(select).toHaveClass('disabled:bg-gray-100', 'disabled:cursor-not-allowed');
    });
  });

  describe('Interactions', () => {
    test('should handle value changes', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      render(<Select options={mockOptions} onChange={handleChange} />);
      const select = screen.getByRole('combobox');
      
      await user.selectOptions(select, 'option2');
      
      expect(handleChange).toHaveBeenCalled();
      expect(select).toHaveValue('option2');
    });

    test('should handle focus and blur events', async () => {
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();
      const user = userEvent.setup();
      
      render(<Select options={mockOptions} onFocus={handleFocus} onBlur={handleBlur} />);
      const select = screen.getByRole('combobox');
      
      await user.click(select);
      expect(handleFocus).toHaveBeenCalledTimes(1);
      
      await user.tab();
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    test('should handle keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(<Select options={mockOptions} />);
      const select = screen.getByRole('combobox');
      
      await user.click(select);
      await user.keyboard('{ArrowDown}');
      
      // First option should be selected after arrow down
      expect(select).toHaveValue('option1');
    });

    test('should not be interactive when disabled', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      render(<Select options={mockOptions} onChange={handleChange} disabled />);
      const select = screen.getByRole('combobox');
      
      await user.click(select);
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('should have proper label association', () => {
      render(<Select label="Test Label" options={mockOptions} />);
      const select = screen.getByLabelText('Test Label');
      
      expect(select).toBeInTheDocument();
    });

    test('should generate unique IDs when not provided', () => {
      render(
        <div>
          <Select label="First Select" options={mockOptions} />
          <Select label="Second Select" options={mockOptions} />
        </div>
      );
      
      const firstSelect = screen.getByLabelText('First Select');
      const secondSelect = screen.getByLabelText('Second Select');
      
      expect(firstSelect.id).toBeTruthy();
      expect(secondSelect.id).toBeTruthy();
      expect(firstSelect.id).not.toBe(secondSelect.id);
    });

    test('should use provided ID', () => {
      render(<Select label="Custom ID Select" options={mockOptions} id="custom-select-id" />);
      const select = screen.getByLabelText('Custom ID Select');
      
      expect(select).toHaveAttribute('id', 'custom-select-id');
    });

    test('should support ARIA attributes', () => {
      render(
        <Select 
          options={mockOptions}
          aria-describedby="help-text"
          aria-required="true"
          aria-invalid="true"
        />
      );
      const select = screen.getByRole('combobox');
      
      expect(select).toHaveAttribute('aria-describedby', 'help-text');
      expect(select).toHaveAttribute('aria-required', 'true');
      expect(select).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Responsive Design', () => {
    test('should have responsive width classes', () => {
      render(<Select options={mockOptions} />);
      const select = screen.getByRole('combobox');
      
      expect(select).toHaveClass('w-full');
    });

    test('should have proper spacing classes', () => {
      render(<Select label="Spaced Select" options={mockOptions} />);
      const container = screen.getByText('Spaced Select').closest('div');
      
      expect(container).toHaveClass('space-y-1');
    });
  });

  describe('Form Integration', () => {
    test('should work with form submission', () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());
      
      render(
        <form onSubmit={handleSubmit}>
          <Select name="test-select" options={mockOptions} />
          <button type="submit">Submit</button>
        </form>
      );
      
      const select = screen.getByRole('combobox');
      const submitButton = screen.getByRole('button');
      
      expect(select).toHaveAttribute('name', 'test-select');
      
      fireEvent.click(submitButton);
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    test('should support defaultValue', () => {
      render(<Select options={mockOptions} defaultValue="option2" />);
      const select = screen.getByRole('combobox');
      
      expect(select).toHaveValue('option2');
    });

    test('should support controlled value', () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('option1');
        return (
          <Select 
            options={mockOptions}
            value={value} 
            onChange={(e) => setValue(e.target.value)} 
          />
        );
      };
      
      render(<TestComponent />);
      const select = screen.getByRole('combobox');
      
      expect(select).toHaveValue('option1');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty options array', () => {
      render(<Select options={[]} />);
      const select = screen.getByRole('combobox');
      
      expect(select).toBeInTheDocument();
      expect(select.children).toHaveLength(0);
    });

    test('should handle options with empty values', () => {
      const optionsWithEmpty = [
        { value: '', label: 'Empty Option' },
        { value: 'option1', label: 'Option 1' },
      ];
      
      render(<Select options={optionsWithEmpty} />);
      
      expect(screen.getByText('Empty Option')).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    test('should handle options with special characters', () => {
      const specialOptions = [
        { value: 'special&chars', label: 'Special & Characters' },
        { value: 'unicode🚀', label: 'Unicode 🚀 Option' },
      ];
      
      render(<Select options={specialOptions} />);
      
      expect(screen.getByText('Special & Characters')).toBeInTheDocument();
      expect(screen.getByText('Unicode 🚀 Option')).toBeInTheDocument();
    });
  });
});