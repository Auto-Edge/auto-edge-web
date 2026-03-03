import React from 'react';

interface StatusBadgeProps {
  status: string | null;
}

const statusStyles: Record<string, string> = {
  Complete: 'text-green-400',
  Completed: 'text-green-400',
  Failed: 'text-red-400',
  Processing: 'text-blue-400',
  Pending: 'text-yellow-400',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  if (!status) return null;

  const colorClass = statusStyles[status] || 'text-slate-400';

  return (
    <span className={`text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
