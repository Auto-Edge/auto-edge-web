import React, { ReactNode } from 'react';

interface JobGridProps {
  children: ReactNode;
}

export const JobGrid: React.FC<JobGridProps> = ({ children }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  );
};

export default JobGrid;
