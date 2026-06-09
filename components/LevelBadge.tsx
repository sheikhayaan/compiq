import React from 'react';

export type LevelTier = 'Junior' | 'Mid' | 'Senior' | 'Staff' | 'Principal';

interface LevelBadgeProps {
  tier: LevelTier;
  className?: string;
}

export default function LevelBadge({ tier, className = '' }: LevelBadgeProps) {
  const badgeStyles: Record<LevelTier, string> = {
    Junior: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/50',
    Mid: 'bg-blue-950/60 text-blue-400 border-blue-900/50',
    Senior: 'bg-indigo-950/60 text-indigo-400 border-indigo-900/50',
    Staff: 'bg-purple-950/60 text-purple-400 border-purple-900/50',
    Principal: 'bg-amber-950/60 text-amber-400 border-amber-900/50',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        badgeStyles[tier] || badgeStyles['Junior']
      } ${className}`}
    >
      {tier}
    </span>
  );
}
