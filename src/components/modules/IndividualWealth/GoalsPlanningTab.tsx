import React, { useState } from 'react';
import { Account, Goal } from '../../../types';
import { FinancialFigure } from '../../common/FinancialFigure';
import { PrototypeBadge } from '../../common/PrototypeBadge';
import {
  Target,
  CheckCircle2,
  Calendar,
  Sparkles,
  TrendingUp,
  Sliders,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Info,
  DollarSign,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface GoalsPlanningTabProps {
  goals: Goal[];
  accounts: Account[];
  onOpenCalculationModal?: (calcId: string) => void;
  onOpenApprovalModal?: () => void;
}

export const GoalsPlanningTab: React.FC<GoalsPlanningTabProps> = ({
  goals,
  accounts,
  onOpenCalculationModal,
  onOpenApprovalModal,
}) => {
  const [selectedGoalId, setSelectedGoalId] = useState<string>(
    goals.length > 0 ? goals[0].id : ''
  );

  // Scenario Simulator State (strictly client-side what-if simulation, clearly separated from actual data)
  const [returnAssumption, setReturnAssumption] = useState<number>(6.5); // %
  const [extraMonthlyContribution, setExtraMonthlyContribution] = useState<number>(1000); // $

  const currentGoal = goals.find((g) => g.id === selectedGoalId) || goals[0];

  // Lookup linked accounts
  const linkedAccountDetails = accounts.filter(
    (acc) => currentGoal?.linkedAccountIds?.includes(acc.id)
  );

  // Generate Monte Carlo projection curves for the selected goal
  const baselineCurves = currentGoal?.milestones?.map((m) => {
    const returnMultiplier = 1 + (returnAssumption - 6.5) * 0.05;
    const extraSavingsAcc = (extraMonthlyContribution * 12 * (m.year - 2026));
    const simulatedValue = Math.round(m.projectedValue * returnMultiplier + extraSavingsAcc);
    const conservativeValue = Math.round(simulatedValue * 0.88);
    const optimisticValue = Math.round(simulatedValue * 1.14);

    return {
      year: m.year.toString(),
      baseline: m.projectedValue,
      simulated: simulatedValue,
      conservative: conservativeValue,
      optimistic: optimisticValue,
      target: currentGoal.targetAmount,
    };
  }) || [];

  return (
    <div className="space-y-6">
      {/* Actual vs Scenario Separation Notice */}
      <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-start gap-3 text-xs text-emerald-900">
        <ShieldAlert className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Actual vs. Scenario Data Separation Protocol:</span>
          <p className="mt-0.5 text-emerald-800">
            Current account funding is backed by settled custodial book-of-record feeds. What-if scenarios and Monte Carlo models are isolated planning simulations. Running forecasts will <span className="font-semibold underline">never</span> modify or alter actual book-of-record accounts.
          </p>
        </div>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {goals.map((g) => {
          const isSelected = g.id === selectedGoalId;
          return (
            <div
              key={g.id}
              onClick={() => setSelectedGoalId(g.id)}
              className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/20 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                    {g.category.replace('_', ' ')}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      g.probabilityOfSuccess >= 90
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {g.probabilityOfSuccess}% Success
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm mb-1 leading-snug">
                  {g.title}
                </h4>
                <span className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                  <Calendar className="w-3.5 h-3.5" /> Target Date: {g.targetDate}
                </span>

                {/* Funding Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600">Funded: {g.fundingPercent.toFixed(1)}%</span>
                    <span className="text-slate-900 font-mono">
                      ${g.currentFunding.toLocaleString()} / ${g.targetAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        g.fundingPercent >= 85 ? 'bg-emerald-600' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(g.fundingPercent, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Monthly: <strong className="text-slate-800 font-mono">${g.monthlyContribution.toLocaleString()}/mo</strong></span>
                <span className="text-emerald-700 font-semibold">{g.status}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Goal Deep Dive */}
      {currentGoal && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Header */}
          <div className="p-5 bg-slate-50/75 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">{currentGoal.title}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  {currentGoal.probabilityOfSuccess}% Confidence Level
                </span>
                {onOpenCalculationModal && (
                  <button
                    onClick={() => onOpenCalculationModal('calc_monte_carlo')}
                    className="text-slate-400 hover:text-emerald-700"
                    title="View Monte Carlo Calculation Method"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Stochastic 1,000-run simulation incorporating inflation (2.6%), tax sequencing, and cash milestones
              </p>
            </div>

            {onOpenApprovalModal && (
              <button
                onClick={onOpenApprovalModal}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors self-start md:self-auto"
              >
                Submit Milestone or Contribution Change
              </button>
            )}
          </div>

          <div className="p-5 space-y-6">
            {/* Linked Accounts & Milestone Roadmap */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Linked Accounts */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-700" />
                  Assigned Funding Accounts ({linkedAccountDetails.length})
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  These custodial accounts are designated to fulfill this specific financial milestone:
                </p>
                <div className="space-y-2">
                  {linkedAccountDetails.map((acc) => (
                    <div
                      key={acc.id}
                      className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-slate-900 text-xs block">{acc.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {acc.accountNumberMasked} • {acc.custodian}
                        </span>
                      </div>
                      <FinancialFigure
                        value={acc.balance}
                        size="sm"
                        asOf={acc.asOf}
                        freshness={acc.freshness}
                        showAsOfInline={false}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestone Roadmap */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-700" />
                  Target Milestone Roadmap
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Scheduled funding targets leading up to target completion date ({currentGoal.targetDate}):
                </p>
                <div className="space-y-2">
                  {currentGoal.milestones?.map((m) => (
                    <div
                      key={m.year}
                      className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        {m.achieved ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                        )}
                        <span className="font-bold text-slate-900">Year {m.year} Milestone</span>
                        {m.achieved && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Achieved
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-bold text-slate-800">
                        ${m.projectedValue.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive What-if Scenario Simulator Panel */}
            <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-700" />
                  <h4 className="font-bold text-slate-900 text-sm">
                    Interactive What-If Scenario Modeler
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                    SIMULATED SCENARIO ONLY
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  Does not alter live custodian books
                </span>
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">Expected Nominal Portfolio Return:</span>
                    <span className="font-mono text-emerald-700">{returnAssumption}%</span>
                  </div>
                  <input
                    type="range"
                    min="4.0"
                    max="9.5"
                    step="0.25"
                    value={returnAssumption}
                    onChange={(e) => setReturnAssumption(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>4.0% (Conservative)</span>
                    <span>6.5% (Baseline)</span>
                    <span>9.5% (Aggressive)</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">Simulated Extra Monthly Savings:</span>
                    <span className="font-mono text-emerald-700">+${extraMonthlyContribution.toLocaleString()}/mo</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="250"
                    value={extraMonthlyContribution}
                    onChange={(e) => setExtraMonthlyContribution(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>$0</span>
                    <span>+$2,500/mo</span>
                    <span>+$5,000/mo</span>
                  </div>
                </div>
              </div>

              {/* Projection Area Chart */}
              <div className="h-60 w-full bg-white p-3 rounded-lg border border-slate-200">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={baselineCurves} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip
                      formatter={(val: any) => [`$${Number(val).toLocaleString()}`]}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        color: '#fff',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="optimistic"
                      name="Optimistic (75th Pct)"
                      stroke="#a7f3d0"
                      fill="#a7f3d0"
                      fillOpacity={0.2}
                    />
                    <Area
                      type="monotone"
                      dataKey="simulated"
                      name="Simulated Scenario"
                      stroke="#059669"
                      strokeWidth={2.5}
                      fill="#059669"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="conservative"
                      name="Conservative (25th Pct)"
                      stroke="#cbd5e1"
                      fill="#cbd5e1"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
