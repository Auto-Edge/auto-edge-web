import React from 'react';

interface LoadingSpinnerProps {
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className = '' }) => {
  return (
    <div
      className={`w-5 h-5 border-2 border-slate-600 border-t-slate-300 rounded-full animate-spin ${className}`}
    />
  );
};

export default LoadingSpinner;
