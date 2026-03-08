import React from 'react';

interface LoadingSpinnerProps {
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = React.memo(({ className = '' }) => {
  return (
    <div
      className={`spinner ${className}`}
    />
  );
});

export default LoadingSpinner;
