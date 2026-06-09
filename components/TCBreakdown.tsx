import React from 'react';

interface TCBreakdownProps {
  base: number;
  bonus: number;
  equity: number;
  className?: string;
  showDetails?: boolean;
}

export default function TCBreakdown({
  base,
  bonus,
  equity,
  className = '',
  showDetails = true,
}: TCBreakdownProps) {
  const total = base + bonus + equity;
  const basePct = total > 0 ? (base / total) * 100 : 0;
  const bonusPct = total > 0 ? (bonus / total) * 100 : 0;
  const equityPct = total > 0 ? (equity / total) * 100 : 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Stacked Bar */}
      <div className="w-full h-3 bg-border-dark rounded-full overflow-hidden flex">
        {basePct > 0 && (
          <div
            style={{ width: `${basePct}%` }}
            className="h-full bg-primary transition-all duration-500 hover:opacity-80"
            title={`Base: ${formatCurrency(base)} (${basePct.toFixed(0)}%)`}
          />
        )}
        {bonusPct > 0 && (
          <div
            style={{ width: `${bonusPct}%` }}
            className="h-full bg-secondary transition-all duration-500 hover:opacity-80"
            title={`Bonus: ${formatCurrency(bonus)} (${bonusPct.toFixed(0)}%)`}
          />
        )}
        {equityPct > 0 && (
          <div
            style={{ width: `${equityPct}%` }}
            className="h-full bg-success transition-all duration-500 hover:opacity-80"
            title={`Equity: ${formatCurrency(equity)} (${equityPct.toFixed(0)}%)`}
          />
        )}
      </div>

      {/* Legend details */}
      {showDetails && (
        <div className="flex flex-wrap items-center justify-between mt-3 text-xs gap-3">
          <div className="flex items-center gap-4">
            {/* Base */}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-text-muted">Base:</span>
              <span className="text-text-primary font-medium">{formatCurrency(base)}</span>
              <span className="text-[10px] text-text-muted">({basePct.toFixed(0)}%)</span>
            </div>
            {/* Bonus */}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
              <span className="text-text-muted">Bonus:</span>
              <span className="text-text-primary font-medium">{formatCurrency(bonus)}</span>
              <span className="text-[10px] text-text-muted">({bonusPct.toFixed(0)}%)</span>
            </div>
            {/* Equity */}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-success" />
              <span className="text-text-muted">Equity:</span>
              <span className="text-text-primary font-medium">{formatCurrency(equity)}</span>
              <span className="text-[10px] text-text-muted">({equityPct.toFixed(0)}%)</span>
            </div>
          </div>
          
          <div className="text-text-primary font-bold">
            Total: <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{formatCurrency(total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
