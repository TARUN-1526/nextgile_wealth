import React, { useState } from 'react';
import { FreshnessStatus } from '../../types';
import { CALCULATION_REGISTRY } from '../../data/mockData';
import { CalculationTransparencyModal } from './CalculationTransparencyModal';
import { Info, Sparkles, Clock, AlertCircle } from 'lucide-react';

interface FinancialFigureProps {
  value: number;
  format?: 'currency' | 'percent' | 'compactCurrency' | 'shares' | 'number';
  asOf?: string;
  freshness?: FreshnessStatus | string;
  isCalculated?: boolean;
  calculationId?: string;
  isScenario?: boolean;
  scenarioLabel?: string;
  showGainLossColor?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showAsOfInline?: boolean;
}

export const FinancialFigure: React.FC<FinancialFigureProps> = ({
  value,
  format = 'currency',
  asOf = 'Today 4:00 PM EST',
  freshness = 'live',
  isCalculated = false,
  calculationId,
  isScenario = false,
  scenarioLabel = 'Scenario',
  showGainLossColor = false,
  size = 'md',
  className = '',
  showAsOfInline = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Format value
  const formatValue = (num: number): string => {
    if (format === 'percent') {
      const sign = num > 0 ? '+' : '';
      return `${sign}${num.toFixed(2)}%`;
    }
    if (format === 'compactCurrency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(num);
    }
    if (format === 'shares') {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num);
    }
    if (format === 'number') {
      return new Intl.NumberFormat('en-US').format(num);
    }
    // standard currency
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
    return formatted;
  };

  const getFreshnessBadge = (status?: FreshnessStatus | string) => {
    switch (status) {
      case 'live':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE
          </span>
        );
      case '5m':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
            <Clock className="w-2.5 h-2.5" />
            FRESH (5m)
          </span>
        );
      case 'today_932am':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
            <Clock className="w-2.5 h-2.5" />
            As of 9:32 AM
          </span>
        );
      case 'stale_3d':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
            <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
            STALE (3d)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
            <Clock className="w-2.5 h-2.5" />
            {status ? status.toUpperCase() : 'VERIFIED'}
          </span>
        );
    }
  };

  // Typography size classes
  const sizeClasses = {
    xs: 'text-xs font-semibold',
    sm: 'text-sm font-semibold',
    md: 'text-base font-semibold',
    lg: 'text-xl font-bold tracking-tight',
    xl: 'text-2xl font-bold tracking-tight',
    '2xl': 'text-3xl font-extrabold tracking-tight',
  };

  const colorClass = showGainLossColor
    ? value > 0
      ? 'text-emerald-600 dark:text-emerald-400'
      : value < 0
      ? 'text-rose-600 dark:text-rose-400'
      : 'text-slate-800'
    : isScenario
    ? 'text-emerald-950 font-bold'
    : 'text-slate-900';

  const calcDetails = calculationId ? CALCULATION_REGISTRY[calculationId] : null;

  return (
    <div className={`inline-flex flex-col gap-0.5 ${className}`}>
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Scenario tag if simulation */}
        {isScenario && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold tracking-wide uppercase">
            <Sparkles className="w-2.5 h-2.5" />
            {scenarioLabel}
          </span>
        )}

        {/* The Value */}
        <span className={`${sizeClasses[size]} ${colorClass} font-mono tabular-nums`}>
          {formatValue(value)}
        </span>

        {/* Calculation Info Button */}
        {(isCalculated || calculationId) && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors focus:outline-hidden"
            title="View calculation assumptions and formula"
          >
            <Info className="w-3 h-3" />
            <span>Calc</span>
          </button>
        )}

        {/* Inline Freshness Badge if requested */}
        {showAsOfInline && getFreshnessBadge(freshness)}
      </div>

      {/* Freshness & As-of subtitle */}
      {!showAsOfInline && (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-normal">
          <span>{asOf}</span>
          <span className="text-slate-300">•</span>
          {getFreshnessBadge(freshness)}
        </div>
      )}

      {/* Modal for calculation transparency */}
      {isModalOpen && calcDetails && (
        <CalculationTransparencyModal
          calculation={calcDetails}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
