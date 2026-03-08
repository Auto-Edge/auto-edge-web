import React from 'react';

interface ErrorMessageProps {
  message: string | null;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = React.memo(({ message }) => {
  if (!message) return null;

  return (
    <p className="error-message">{message}</p>
  );
});

export default ErrorMessage;
