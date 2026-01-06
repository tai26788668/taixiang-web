import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect } from 'vitest';
import { TimeSelector } from '../TimeSelector';

// Test form component to verify integration
const TestForm: React.FC = () => {
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form>
      <div>
        <label htmlFor="startTime">開始時間</label>
        <TimeSelector
          id="startTime"
          name="startTime"
          value={formData.startTime}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div>
        <label htmlFor="endTime">結束時間</label>
        <TimeSelector
          id="endTime"
          name="endTime"
          value={formData.endTime}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div data-testid="form-data">
        Start: {formData.startTime}, End: {formData.endTime}
      </div>
    </form>
  );
};

describe('TimeSelector Integration Tests', () => {
  test('should integrate properly with form state management', async () => {
    const user = userEvent.setup();
    
    render(<TestForm />);

    // Verify initial state
    expect(screen.getByTestId('form-data')).toHaveTextContent('Start: , End:');

    // Select start time
    const startTimeSelect = screen.getByLabelText('開始時間');
    await user.selectOptions(startTimeSelect, '09:30');

    // Verify start time is updated
    expect(screen.getByTestId('form-data')).toHaveTextContent('Start: 09:30, End:');

    // Select end time
    const endTimeSelect = screen.getByLabelText('結束時間');
    await user.selectOptions(endTimeSelect, '17:45');

    // Verify both times are updated
    expect(screen.getByTestId('form-data')).toHaveTextContent('Start: 09:30, End: 17:45');
  });

  test('should handle next day time selections', async () => {
    const user = userEvent.setup();
    
    render(<TestForm />);

    // Select next day start time
    const startTimeSelect = screen.getByLabelText('開始時間');
    await user.selectOptions(startTimeSelect, '23:30');

    // Select next day end time
    const endTimeSelect = screen.getByLabelText('結束時間');
    await user.selectOptions(endTimeSelect, '02:15(+1)');

    // Verify next day times are handled correctly
    expect(screen.getByTestId('form-data')).toHaveTextContent('Start: 23:30, End: 02:15(+1)');
  });

  test('should display all 125 time options correctly', () => {
    render(<TestForm />);

    const startTimeSelect = screen.getByLabelText('開始時間');
    const options = startTimeSelect.querySelectorAll('option');
    
    // Should have 126 options (125 time options + 1 placeholder)
    expect(options).toHaveLength(126);
    
    // Check first few current day options
    expect(options[1]).toHaveTextContent('00:00');
    expect(options[2]).toHaveTextContent('00:15');
    expect(options[3]).toHaveTextContent('00:30');
    expect(options[4]).toHaveTextContent('00:45');
    
    // Check last current day option (23:45)
    expect(options[96]).toHaveTextContent('23:45');
    
    // Check first next day option
    expect(options[97]).toHaveTextContent('00:00(+1)');
    
    // Check last next day option (07:00(+1))
    expect(options[125]).toHaveTextContent('07:00(+1)');
  });

  test('should maintain accessibility features', () => {
    render(<TestForm />);

    const startTimeSelect = screen.getByLabelText('開始時間');
    const endTimeSelect = screen.getByLabelText('結束時間');

    // Check accessibility attributes
    expect(startTimeSelect).toHaveAttribute('aria-label', '選擇時間');
    expect(endTimeSelect).toHaveAttribute('aria-label', '選擇時間');
    
    // Check that selects are properly labeled
    expect(startTimeSelect).toHaveAttribute('id', 'startTime');
    expect(endTimeSelect).toHaveAttribute('id', 'endTime');
  });
});