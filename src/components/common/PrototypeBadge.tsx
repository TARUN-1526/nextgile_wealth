import React from 'react';
import { Info } from 'lucide-react';

interface PrototypeBadgeProps {
  label?: string;
  variant?: 'logic' | 'calculation' | 'simulation';
  className?: string;
}

export const PrototypeBadge: React.FC<PrototypeBadgeProps> = ({
  label,
  variant = 'logic',
  className = '',
}) => {
  const text = label || (variant === 'calculation' ? 'Mock Calculation' : variant === 'simulation' ? 'Simulation / Scenario' : 'Prototype Logic');

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium tracking-tight px-2 py-0.5 rounded-md border border-amber-300/80 bg-amber-50 text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-300 ${className}`}
      title="Simplified simulation logic for prototype demonstration. Not intended as binding legal, tax, or investment advice."
    >
      <Info className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
      <span>{text}</span>
    </span>
  );
};
