import React from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';

const RouteError: React.FC = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  let title = 'Something went wrong';
  let message = 'An unexpected error occurred.';

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message = error.data?.message || 'The page you were looking for could not be found.';
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="empty-state">
      <h1 className="page-title">{title}</h1>
      <p className="text-red-400 mb-4">{message}</p>
      <button onClick={() => navigate('/')} className="btn btn-secondary">
        Go Home
      </button>
    </div>
  );
};

export default RouteError;
