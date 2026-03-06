import React from 'react';

interface StatusBadgeProps {
  status: string | null;
}

const statusStyles: Record<string, string> = {
  Complete: 'status-complete',
  Completed: 'status-complete',
  Failed: 'status-failed',
  Processing: 'status-processing',
  Pending: 'status-pending',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  if (!status) return null;

  const colorClass = statusStyles[status] || 'status-default';

  return (
    <span className={`status-badge ${colorClass}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
