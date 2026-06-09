import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: 'indigo' | 'cyan' | 'green' | 'none';
  className?: string;
}

export default function StatCard({
  title,
  value,
  subtext,
  trend,
  accentColor = 'none',
  className = '',
}: StatCardProps) {
  const borderColors = {
    indigo: 'border-l-4 border-l-primary',
    cyan: 'border-l-4 border-l-secondary',
    green: 'border-l-4 border-l-success',
    none: '',
  };

  return (
    <div
      className={`glass glass-hover p-6 rounded-xl flex flex-col justify-between ${
        borderColors[accentColor]
      } ${className}`}
    >
      <div>
        <p className="text-xs font-semibold tracking-wider text-text-muted uppercase mb-1">
          {title}
        </p>
        <h3 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
          {value}
        </h3>
      </div>
      {(subtext || trend) && (
        <div className="flex items-center gap-2 mt-4 text-xs">
          {trend && (
            <span
              className={`font-semibold ${
                trend.isPositive ? 'text-success' : 'text-red-500'
              }`}
            >
              {trend.value}
            </span>
          )}
          {subtext && <span className="text-text-muted">{subtext}</span>}
        </div>
      )}
    </div>
  );
}
