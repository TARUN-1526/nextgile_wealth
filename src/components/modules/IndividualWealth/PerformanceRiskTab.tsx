import React, { useState } from 'react';
import { PrototypeBadge } from '../../common/PrototypeBadge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  Shield,
  HelpCircle,
  Activity,
  Award,
  ArrowUpRight,
  Info,
} from 'lucide-react';

interface PerformanceRiskTabProps {
  onOpenCalculationModal?: (calcId: string) => void;
}

export const PerformanceRiskTab: React.FC<PerformanceRiskTabProps> = ({
  onOpenCalculationModal,
}) => {
  // Returns across standard GIPS compliant time horizons
  const performanceReturns = [
    { period: '1 Month', portfolio: 1.42, benchmark6040: 1.15, sp500: 1.80 },
    { period: '3 Months', portfolio: 4.65, benchmark6040: 3.80, sp500: 5.20 },
    { period: 'YTD', portfolio: 9.84, benchmark6040: 7.92, sp500: 11.45 },
    { period: '1 Year', portfolio: 14.20, benchmark6040: 11.10, sp500: 17.80 },
    { period: '3 Years (Ann.)', portfolio: 8.95, benchmark6040: 6.75, sp500: 10.20 },
    { period: 'Since Inception', portfolio: 10.12, benchmark6040: 8.05, sp500: 11.90 },
  ];

  // Cumulative growth of $10,000 illustrative historical chart
  const growthData = [
    { month: 'Sep 23', portfolio: 10000, benchmark: 10000, sp500: 10000 },
    { month: 'Dec 23', portfolio: 10450, benchmark: 10320, sp500: 10620 },
    { month: 'Mar 24', portfolio: 10980, benchmark: 10710, sp500: 11340 },
    { month: 'Jun 24', portfolio: 11250, benchmark: 10920, sp500: 11780 },
    { month: 'Sep 24', portfolio: 11620, benchmark: 11240, sp500: 12210 },
    { month: 'Dec 24', portfolio: 12100, benchmark: 11580, sp500: 12850 },
    { month: 'Mar 25', portfolio: 12450, benchmark: 11840, sp500: 13320 },
    { month: 'Jun 25', portfolio: 12880, benchmark: 12150, sp500: 13910 },
    { month: 'Sep 25', portfolio: 13240, benchmark: 12420, sp500: 14380 },
    { month: 'Dec 25', portfolio: 13780, benchmark: 12810, sp500: 15120 },
    { month: 'Mar 26', portfolio: 14120, benchmark: 13050, sp500: 15580 },
    { month: 'Sep 26', portfolio: 14820, benchmark: 13590, sp500: 16420 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">
              Performance Attribution & Modern Portfolio Theory (MPT) Risk
            </h3>
            <PrototypeBadge label="GIPS Time-Weighted Return (TWR)" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional net-of-fee returns compared against custom 60/40 blended benchmark and S&P 500 TR
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onOpenCalculationModal && (
            <button
              onClick={() => onOpenCalculationModal('calc_benchmark_alpha')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Alpha Formula & Fees
            </button>
          )}
        </div>
      </div>

      {/* 4 MPT Risk Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Beta */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
            Portfolio Beta (vs S&P 500)
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">0.92</span>
            <span className="text-xs font-semibold text-emerald-700">Defensive Tilt</span>
          </div>
          <span className="text-xs text-slate-500 mt-2 block">
            8% less systematic market volatility
          </span>
        </div>

        {/* Sharpe Ratio */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
              Sharpe Ratio (36M)
            </span>
            {onOpenCalculationModal && (
              <button
                onClick={() => onOpenCalculationModal('calc_portfolio_risk')}
                className="text-slate-400 hover:text-emerald-700"
                title="View Sharpe Ratio Formula"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-700">1.48</span>
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Top Quartile
            </span>
          </div>
          <span className="text-xs text-slate-500 mt-2 block">
            Benchmark 60/40: 1.18 • Risk-Free: 4.85%
          </span>
        </div>

        {/* Annualized Volatility */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
            Standard Deviation (36M)
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">11.20%</span>
            <span className="text-xs text-slate-500">Ann. Volatility</span>
          </div>
          <span className="text-xs text-slate-500 mt-2 block">
            vs S&P 500 15.40% • 60/40 10.80%
          </span>
        </div>

        {/* Maximum Drawdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
            Max Drawdown (3 Year)
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">-9.80%</span>
            <span className="text-xs font-semibold text-emerald-700">Capital Protected</span>
          </div>
          <span className="text-xs text-slate-500 mt-2 block">
            vs S&P 500 -14.20% in market correction
          </span>
        </div>
      </div>

      {/* Returns Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 bg-slate-50/75 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Time-Weighted Returns vs Benchmarks</h4>
            <p className="text-xs text-slate-500">Net of all custodial and management advisory fees</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span className="text-slate-700 font-medium">Household Portfolio</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span className="text-slate-700 font-medium">Blended 60/40</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-slate-700 font-medium">S&P 500 TR</span>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100/75 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Performance Period</th>
                <th className="py-3 px-4 text-right">Household Portfolio</th>
                <th className="py-3 px-4 text-right">Blended 60/40 Benchmark</th>
                <th className="py-3 px-4 text-right">S&P 500 Index</th>
                <th className="py-3 px-4 text-right">Alpha vs 60/40</th>
                <th className="py-3 px-4 text-center">Fiduciary Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {performanceReturns.map((r) => {
                const alpha = r.portfolio - r.benchmark6040;
                return (
                  <tr key={r.period} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{r.period}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                      +{r.portfolio.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      +{r.benchmark6040.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      +{r.sp500.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-700">
                      +{alpha.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        Outperforming Target
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cumulative Growth of $10,000 Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h4 className="font-bold text-slate-900 text-sm mb-1">Cumulative Growth of $10,000 (3-Year Track)</h4>
        <p className="text-xs text-slate-500 mb-4">Hypothetical growth showing risk-adjusted consistency across market cycles</p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                domain={['dataMin - 500', 'dataMax + 500']}
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
              <Line
                type="monotone"
                dataKey="portfolio"
                name="Household Portfolio"
                stroke="#059669"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="benchmark"
                name="Blended 60/40"
                stroke="#94a3b8"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="sp500"
                name="S&P 500 TR"
                stroke="#3b82f6"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
