import React, { useState } from 'react';
import { Holding } from '../../../types';
import { FinancialFigure } from '../../common/FinancialFigure';
import { PrototypeBadge } from '../../common/PrototypeBadge';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import {
  ShieldAlert,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Globe,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface AllocationTabProps {
  holdings: Holding[];
  totalAssets: number;
  onOpenCalculationModal?: (calcId: string) => void;
  onOpenApprovalModal?: () => void;
}

export const AllocationTab: React.FC<AllocationTabProps> = ({
  holdings,
  totalAssets,
  onOpenCalculationModal,
  onOpenApprovalModal,
}) => {
  const [viewType, setViewType] = useState<'asset' | 'sector' | 'geography'>('asset');

  // Compute actual asset classes
  const totalMarketValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);

  // Asset class buckets
  const rawAssetClasses: Record<string, number> = {
    'US Equity': 0,
    'Intl Equity': 0,
    'Fixed Income': 0,
    'Alternatives': 0,
    'Cash & Sweeps': totalAssets > totalMarketValue ? totalAssets - totalMarketValue : 180000,
  };

  holdings.forEach((h) => {
    const cls = h.assetClass;
    if (rawAssetClasses[cls] !== undefined) {
      rawAssetClasses[cls] += h.marketValue;
    } else {
      rawAssetClasses['US Equity'] += h.marketValue;
    }
  });

  const totalCalculatedValue = Object.values(rawAssetClasses).reduce((sum, val) => sum + val, 0);

  // Target vs Actual with Rebalance Drift
  const assetAllocationData = [
    {
      name: 'US Equity',
      current: rawAssetClasses['US Equity'],
      currentPercent: (rawAssetClasses['US Equity'] / totalCalculatedValue) * 100,
      targetPercent: 50.0,
      color: '#3b82f6',
    },
    {
      name: 'Intl Equity',
      current: rawAssetClasses['Intl Equity'],
      currentPercent: (rawAssetClasses['Intl Equity'] / totalCalculatedValue) * 100,
      targetPercent: 15.0,
      color: '#06b6d4',
    },
    {
      name: 'Fixed Income',
      current: rawAssetClasses['Fixed Income'],
      currentPercent: (rawAssetClasses['Fixed Income'] / totalCalculatedValue) * 100,
      targetPercent: 22.0,
      color: '#10b981',
    },
    {
      name: 'Alternatives',
      current: rawAssetClasses['Alternatives'],
      currentPercent: (rawAssetClasses['Alternatives'] / totalCalculatedValue) * 100,
      targetPercent: 8.0,
      color: '#8b5cf6',
    },
    {
      name: 'Cash & Sweeps',
      current: rawAssetClasses['Cash & Sweeps'],
      currentPercent: (rawAssetClasses['Cash & Sweeps'] / totalCalculatedValue) * 100,
      targetPercent: 5.0,
      color: '#f59e0b',
    },
  ];

  // Sector breakdown
  const sectorMap: Record<string, number> = {};
  holdings.forEach((h) => {
    const sector = h.sector || 'Broad Market Blend';
    sectorMap[sector] = (sectorMap[sector] || 0) + h.marketValue;
  });

  const sectorData = Object.entries(sectorMap)
    .map(([sector, val]) => ({
      sector,
      value: val,
      percent: (val / totalMarketValue) * 100,
    }))
    .sort((a, b) => b.value - a.value);

  // Geography breakdown
  const geoMap: Record<string, number> = {
    'US Domestic': 0,
    'Developed International': 0,
    'Emerging Markets': 0,
    'Global Blend': 0,
  };

  holdings.forEach((h) => {
    if (h.geography === 'US') geoMap['US Domestic'] += h.marketValue;
    else if (h.geography === 'Developed Intl') geoMap['Developed International'] += h.marketValue;
    else if (h.geography === 'Emerging Markets') geoMap['Emerging Markets'] += h.marketValue;
    else geoMap['Global Blend'] += h.marketValue;
  });

  const geoData = Object.entries(geoMap)
    .filter(([_, v]) => v > 0)
    .map(([name, val]) => ({
      name,
      value: val,
      percent: (val / totalMarketValue) * 100,
    }));

  const geoColors = ['#059669', '#3b82f6', '#8b5cf6', '#f59e0b'];

  // Concentration Analysis: Top 5 holdings & single stock warnings
  const sortedHoldings = [...holdings].sort((a, b) => b.marketValue - a.marketValue);
  const topHoldings = sortedHoldings.slice(0, 5).map((h) => ({
    ...h,
    portfolioWeight: (h.marketValue / totalMarketValue) * 100,
  }));

  const top5TotalWeight = topHoldings.reduce((sum, h) => sum + h.portfolioWeight, 0);

  // Single stock concentration warning (> 10% on single non-index company)
  const concentratedPositions = topHoldings.filter(
    (h) => h.portfolioWeight >= 10.0 && !h.name.includes('ETF') && !h.name.includes('Index') && !h.name.includes('Trust')
  );

  return (
    <div className="space-y-6">
      {/* Top Banner: View Selector & Drift Summary */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">
              Portfolio Allocation & Exposure Architecture
            </h3>
            <PrototypeBadge label="Strategic IPS Target" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Target vs current drift monitoring, multi-sector diversification, and concentration thresholds
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setViewType('asset')}
              className={`px-3 py-1 rounded transition-colors ${
                viewType === 'asset'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Asset Class
            </button>
            <button
              onClick={() => setViewType('sector')}
              className={`px-3 py-1 rounded transition-colors ${
                viewType === 'sector'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sector Weighting
            </button>
            <button
              onClick={() => setViewType('geography')}
              className={`px-3 py-1 rounded transition-colors ${
                viewType === 'geography'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Geography
            </button>
          </div>
          {onOpenApprovalModal && (
            <button
              onClick={onOpenApprovalModal}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              Rebalance IPS
            </button>
          )}
        </div>
      </div>

      {/* Main Visual Panels */}
      {viewType === 'asset' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Donut Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Current Asset Distribution</h4>
              <p className="text-[11px] text-slate-500">Total Valuation: ${totalCalculatedValue.toLocaleString()}</p>
            </div>
            <div className="h-52 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetAllocationData}
                    dataKey="current"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={2}
                  >
                    {assetAllocationData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Current Value']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 text-xs">
              {assetAllocationData.map((a) => (
                <div key={a.name} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: a.color }} />
                    <span className="text-slate-700">{a.name}</span>
                  </div>
                  <span className="font-mono font-semibold text-slate-900">
                    {a.currentPercent.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Current vs Target Comparison Table & Drift Bars */}
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Target vs Current Allocation Drift</h4>
                <p className="text-[11px] text-slate-500">IPS Rebalance Tolerance Band: ±5.0%</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100/75 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Asset Class</th>
                    <th className="py-2.5 px-3 text-right">Current Value</th>
                    <th className="py-2.5 px-3 text-right">Current %</th>
                    <th className="py-2.5 px-3 text-right">Target %</th>
                    <th className="py-2.5 px-3 text-right">Drift</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {assetAllocationData.map((a) => {
                    const drift = a.currentPercent - a.targetPercent;
                    const exceedsThreshold = Math.abs(drift) >= 5.0;

                    return (
                      <tr key={a.name} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-900 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: a.color }} />
                          {a.name}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-medium">
                          ${a.current.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          {a.currentPercent.toFixed(1)}%
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-600">
                          {a.targetPercent.toFixed(1)}%
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          <span
                            className={`font-semibold ${
                              drift > 0 ? 'text-emerald-700' : drift < 0 ? 'text-rose-700' : 'text-slate-600'
                            }`}
                          >
                            {drift > 0 ? '+' : ''}
                            {drift.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {exceedsThreshold ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Drift Alert
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Within Band
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {viewType === 'sector' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h4 className="font-bold text-slate-900 text-sm mb-1">Sector Allocation & Exposure Breakdown</h4>
          <p className="text-xs text-slate-500 mb-4">GICS economic sector weightings across equity and fixed income holdings</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              {sectorData.map((sec) => (
                <div key={sec.sector} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">{sec.sector}</span>
                    <span className="font-mono font-semibold text-slate-900">
                      ${sec.value.toLocaleString()} ({sec.percent.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all"
                      style={{ width: `${sec.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="sector" stroke="#94a3b8" fontSize={10} width={120} tickLine={false} />
                  <Tooltip
                    formatter={(val: any) => [`${Number(val).toFixed(1)}%`, 'Sector Weight']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="percent" fill="#059669" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {viewType === 'geography' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h4 className="font-bold text-slate-900 text-sm mb-1">Geographic Capital Allocation</h4>
            <p className="text-xs text-slate-500 mb-4">Domestic vs global developed and emerging market jurisdictions</p>
            <div className="space-y-4">
              {geoData.map((g, idx) => (
                <div key={g.name} className="p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">{g.name}</span>
                      <span className="text-xs text-slate-500">${g.value.toLocaleString()} invested</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-slate-900 text-base">
                    {g.percent.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <h4 className="font-bold text-slate-900 text-sm mb-1">Global Exposure Share</h4>
            <div className="h-56 w-full my-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={geoData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {geoData.map((entry, idx) => (
                      <Cell key={entry.name} fill={geoColors[idx % geoColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Invested Market Value']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Concentration Analysis Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 bg-slate-50/75 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 text-sm">Portfolio Concentration & Single-Asset Risk Analysis</h4>
              {onOpenCalculationModal && (
                <button
                  onClick={() => onOpenCalculationModal('calc_concentration_risk')}
                  className="text-slate-400 hover:text-emerald-700"
                  title="View Concentration Formula"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Top 5 positions comprise <span className="font-bold text-slate-800">{top5TotalWeight.toFixed(1)}%</span> of total household liquid investments
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 text-slate-800 self-start sm:self-auto">
            10.0% Single-Stock Threshold
          </span>
        </div>

        {/* Warning Banner if any single stock exceeds 10% */}
        {concentratedPositions.length > 0 && (
          <div className="p-4 bg-amber-50 border-b border-amber-200 flex items-start gap-3 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Single-Stock Concentration Warning:</span>
              <p className="mt-0.5 text-amber-800">
                {concentratedPositions.map((p) => `${p.symbol} (${p.portfolioWeight.toFixed(1)}%)`).join(', ')} exceeds the fiduciary 10.0% single-security exposure guideline. Consider establishing a structured pre-scheduled diversification program or collar strategy.
              </p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100/75 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Rank & Symbol</th>
                <th className="py-2.5 px-4">Security Name</th>
                <th className="py-2.5 px-4">Asset Class</th>
                <th className="py-2.5 px-4 text-right">Market Value</th>
                <th className="py-2.5 px-4 text-right">Portfolio Weight</th>
                <th className="py-2.5 px-4 text-center">Fiduciary Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {topHoldings.map((h, idx) => {
                const isSingleStockWarning =
                  h.portfolioWeight >= 10.0 &&
                  !h.name.includes('ETF') &&
                  !h.name.includes('Index') &&
                  !h.name.includes('Trust');

                return (
                  <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      {h.symbol}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{h.name}</td>
                    <td className="py-3 px-4 text-slate-600">{h.assetClass}</td>
                    <td className="py-3 px-4 text-right font-mono font-medium">
                      ${h.marketValue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {h.portfolioWeight.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isSingleStockWarning ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          Concentrated Exposure
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          Diversified / Core
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
