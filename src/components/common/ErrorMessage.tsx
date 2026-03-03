import React from 'react';

interface ErrorMessageProps {
  message: string | null;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <p className="text-red-400 text-sm mb-3">{message}</p>
  );
};

export default ErrorMessage;
