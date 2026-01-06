import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { Input } from '../Input';

describe('Input', () => {
  describe('Rendering', () => {
    test('should render input field', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    test('should render with label', () => {
      render(<Input label="Test Label" />);
      
      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    test('should render with required indicator', () => {
      render(<Input label="Required Field" required />);
      
      expect(screen.getByText('*')).toBeInTheDocument();
      expect(screen.getByText('*')).toHaveClass('text-red-500');
    });

    test('should render with helper text', () => {
      render(<Input helperText="This is helper text" />);
      
      expect(screen.getByText('This is helper text')).toBeInTheDocument();
      expect(screen.getByText('This is helper text')).toHaveClass('text-gray-500');
    });

    test('should render with error message', () => {
      render(<Input error="This is an error" />);
      
      expect(screen.getByText('This is an error')).toBeInTheDocument();
      expect(screen.getByText('This is an error')).toHaveClass('text-red-600');
    });

    test('should prioritize error over helper text', () => {
      render(<Input error="Error message" helperText="Helper text" />);
      
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    });

    test('should apply custom className', () => {
      render(<Input className="custom-class" />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveClass('custom-class');
    });
  });

  describe('Input Types', () => {
    test('should render text input by default', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveAttribute('type', 'text');
    });

    test('should render password input', () => {
      render(<Input type="password" />);
      const input = screen.getByDisplayValue('');
      
      expect(input).toHaveAttribute('type', 'password');
    });

    test('should render email input', () => {
      render(<Input type="email" />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveAttribute('type', 'email');
    });

    test('should render number input', () => {
      render(<Input type="number" />);
      const input = screen.getByRole('spinbutton');
      
      expect(input).toHaveAttribute('type', 'number');
    });
  });

  describe('States', () => {
    test('should show error state styling', () => {
      render(<Input error="Error message" />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveClass('border-red-500', 'focus:ring-red-500');
    });

    test('should show normal state styling', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveClass('border-gray-300', 'focus:ring-blue-500');
    });

    test('should be disabled when disabled prop is true', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:bg-gray-100', 'disabled:cursor-not-allowed');
    });

    test('should show placeholder text', () => {
      render(<Input placeholder="Enter text here" />);
      const input = screen.getByPlaceholderText('Enter text here');
      
      expect(input).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    test('should handle value changes', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      
      await user.type(input, 'test value');
      
      expect(handleChange).toHaveBeenCalled();
      expect(input).toHaveValue('test value');
    });

    test('should handle focus and blur events', async () => {
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();
      const user = userEvent.setup();
      
      render(<Input onFocus={handleFocus} onBlur={handleBlur} />);
      const input = screen.getByRole('textbox');
      
      await user.click(input);
      expect(handleFocus).toHaveBeenCalledTimes(1);
      
      await user.tab();
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    test('should handle keyboard events', () => {
      const handleKeyDown = vi.fn();
      
      render(<Input onKeyDown={handleKeyDown} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });

    test('should not be interactive when disabled', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      render(<Input onChange={handleChange} disabled />);
      const input = screen.getByRole('textbox');
      
      await user.type(input, 'test');
      expect(handleChange).not.toHaveBeenCalled();
      expect(input).toHaveValue('');
    });
  });

  describe('Accessibility', () => {
    test('should have proper label association', () => {
      render(<Input label="Test Label" />);
      const input = screen.getByLabelText('Test Label');
      
      expect(input).toBeInTheDocument();
    });

    test('should generate unique IDs when not provided', () => {
      render(
        <div>
          <Input label="First Input" />
          <Input label="Second Input" />
        </div>
      );
      
      const firstInput = screen.getByLabelText('First Input');
      const secondInput = screen.getByLabelText('Second Input');
      
      expect(firstInput.id).toBeTruthy();
      expect(secondInput.id).toBeTruthy();
      expect(firstInput.id).not.toBe(secondInput.id);
    });

    test('should use provided ID', () => {
      render(<Input label="Custom ID Input" id="custom-input-id" />);
      const input = screen.getByLabelText('Custom ID Input');
      
      expect(input).toHaveAttribute('id', 'custom-input-id');
    });

    test('should support ARIA attributes', () => {
      render(
        <Input 
          aria-describedby="help-text"
          aria-required="true"
          aria-invalid="true"
        />
      );
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveAttribute('aria-describedby', 'help-text');
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Responsive Design', () => {
    test('should have responsive width classes', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveClass('w-full');
    });

    test('should have proper spacing classes', () => {
      render(<Input label="Spaced Input" />);
      const container = screen.getByText('Spaced Input').closest('div');
      
      expect(container).toHaveClass('space-y-1');
    });
  });

  describe('Form Integration', () => {
    test('should work with form submission', () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());
      
      render(
        <form onSubmit={handleSubmit}>
          <Input name="test-input" />
          <button type="submit">Submit</button>
        </form>
      );
      
      const input = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button');
      
      expect(input).toHaveAttribute('name', 'test-input');
      
      fireEvent.click(submitButton);
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    test('should support defaultValue', () => {
      render(<Input defaultValue="default text" />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveValue('default text');
    });

    test('should support controlled value', () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('controlled');
        return (
          <Input 
            value={value} 
            onChange={(e) => setValue(e.target.value)} 
          />
        );
      };
      
      render(<TestComponent />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveValue('controlled');
    });
  });
});