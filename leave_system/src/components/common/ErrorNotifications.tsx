import React from 'react';
import { useError } from '../../providers/ErrorProvider';
import { ErrorDisplay, SuccessDisplay } from './ErrorDisplay';

export const ErrorNotifications: React.FC = () => {
  const { errors, removeError } = useError();

  if (errors.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {errors.map(error => {
        if (error.type === 'success') {
          return (
            <SuccessDisplay
              key={error.id}
              message={error.message}
              onDismiss={() => removeError(error.id)}
              className="shadow-lg"
            />
          );
        }

        return (
          <ErrorDisplay
            key={error.id}
            error={error.message}
            type={error.type}
            title={error.title}
            onDismiss={() => removeError(error.id)}
            className="shadow-lg"
          />
        );
      })}
    </div>
  );
};