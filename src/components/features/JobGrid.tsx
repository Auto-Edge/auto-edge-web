import React, { ReactNode } from 'react';

interface JobGridProps {
  children: ReactNode;
}

export const JobGrid: React.FC<JobGridProps> = ({ children }) => {
  return (
    <div className="job-grid">
      {children}
    </div>
  );
};

export default JobGrid;
