import React from 'react';
import { CalculationDetails } from '../../types';
import { PrototypeBadge } from './PrototypeBadge';
import { X, CheckCircle2, AlertTriangle, Calculator, FileText, UserCheck } from 'lucide-react';

interface CalculationTransparencyModalProps {
  calculation: CalculationDetails | null;
  onClose: () => void;
}

export const CalculationTransparencyModal: React.FC<CalculationTransparencyModalProps> = ({
  calculation,
  onClose,
}) => {
  if (!calculation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">{calculation.name}</h3>
              <p className="text-xs text-slate-500">Methodology, assumptions, and calculation breakdown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-sm max-h-[75vh] overflow-y-auto">
          {/* Metadata & Prototype Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">As-of Date & Time:</span>
              <span className="text-xs font-semibold text-slate-800">{calculation.asOf}</span>
            </div>
            {calculation.isPrototype && <PrototypeBadge label="Prototype / Mock Formula" />}
          </div>

          {/* Formula in Plain Language */}
          <div>
            <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Method & Formula (Plain Language)
            </h4>
            <div className="p-3.5 bg-slate-900 text-slate-100 font-mono text-xs rounded-lg leading-relaxed">
              {calculation.methodFormula}
            </div>
          </div>

          {/* Key Assumptions */}
          <div>
            <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Key Assumptions
            </h4>
            <ul className="space-y-1.5">
              {calculation.keyAssumptions.map((assumption, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-700 text-xs leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span>{assumption}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Relevant Fees & Taxes */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-lg">
            <h4 className="text-xs font-semibold text-blue-900 mb-1">Relevant Fees & Tax Assumptions</h4>
            <p className="text-xs text-blue-800 leading-relaxed">{calculation.relevantFeesTaxes}</p>
          </div>

          {/* Limitations & Uncertainty */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200/70 rounded-lg flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-amber-900 mb-0.5">Limitations & Uncertainty</h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                {calculation.limitationsUncertainty}
              </p>
            </div>
          </div>

          {/* Advisor Reviewed Status */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-slate-600" />
              <span className="text-xs text-slate-600 font-medium">Advisor Review Status:</span>
            </div>
            {calculation.advisorReviewed ? (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Reviewed by {calculation.reviewedBy} ({calculation.reviewedDate})</span>
              </div>
            ) : (
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                Pending Advisor Sign-off
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-xs"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
