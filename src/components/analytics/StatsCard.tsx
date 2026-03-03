import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  highlight?: boolean;
  large?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  icon,
  highlight = false,
  large = false,
}) => {
  return (
    <div
      className={`bg-slate-900 border rounded-xl p-4 ${
        highlight ? 'border-blue-800' : 'border-slate-800'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon && (
          <span className={highlight ? 'text-blue-400' : 'text-slate-500'}>
            {icon}
          </span>
        )}
        <p className="text-xs text-slate-500 uppercase font-medium">{label}</p>
      </div>
      <p
        className={`font-bold text-white ${
          large ? 'text-3xl' : 'text-2xl'
        }`}
      >
        {value}
      </p>
    </div>
  );
};

export default StatsCard;
