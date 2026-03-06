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
      className={`stats-card ${
        highlight ? 'stats-card-highlight' : ''
      }`}
    >
      <div className="stats-card-header">
        {icon && (
          <span className={highlight ? 'stats-card-icon-highlight' : 'stats-card-icon'}>
            {icon}
          </span>
        )}
        <p className="stats-card-label">{label}</p>
      </div>
      <p
        className={`stats-card-value ${
          large ? 'stats-card-value-lg' : ''
        }`}
      >
        {value}
      </p>
    </div>
  );
};

export default StatsCard;
