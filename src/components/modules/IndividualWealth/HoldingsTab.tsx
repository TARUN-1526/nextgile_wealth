import React, { useState } from 'react';
import { Account, Holding } from '../../../types';
import { FinancialFigure } from '../../common/FinancialFigure';
import { PrototypeBadge } from '../../common/PrototypeBadge';
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  TrendingUp,
  DollarSign,
  PieChart,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

interface HoldingsTabProps {
  holdings: Holding[];
  accounts: Account[];
  onOpenCalculationModal?: (calcId: string) => void;
  onOpenApprovalModal?: () => void;
}

export const HoldingsTab: React.FC<HoldingsTabProps> = ({
  holdings,
  accounts,
  onOpenCalculationModal,
  onOpenApprovalModal,
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('ALL');
  const [selectedAssetClass, setSelectedAssetClass] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter logic
  const filteredHoldings = holdings.filter((hld) => {
    const matchAccount = selectedAccountId === 'ALL' || hld.accountId === selectedAccountId;
    const matchClass = selectedAssetClass === 'ALL' || hld.assetClass === selectedAssetClass;
    const matchSearch =
      hld.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hld.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hld.sector.toLowerCase().includes(searchQuery.toLowerCase());
    return matchAccount && matchClass && matchSearch;
  });

  // Aggregated totals
  const totalMarketValue = filteredHoldings.reduce((sum, h) => sum + h.marketValue, 0);
  const totalCostBasis = filteredHoldings.reduce((sum, h) => sum + h.costBasis, 0);
  const totalGainLoss = totalMarketValue - totalCostBasis;
  const totalGainLossPercent = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;

  // Projected annual dividend / coupon income
  const totalProjectedIncome = filteredHoldings.reduce(
    (sum, h) => sum + (h.marketValue * (h.dividendYield || 0)) / 100,
    0
  );
  const blendedYield = totalMarketValue > 0 ? (totalProjectedIncome / totalMarketValue) * 100 : 0;

  // Weighted ESG Score
  const weightedEsg =
    totalMarketValue > 0
      ? filteredHoldings.reduce((sum, h) => sum + (h.esgScore || 75) * h.marketValue, 0) /
        totalMarketValue
      : 80;

  const assetClasses = ['ALL', 'US Equity', 'Intl Equity', 'Fixed Income', 'Alternatives'];

  return (
    <div className="space-y-6">
      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Market Value */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
            Portfolio Market Value
          </span>
          <div className="mt-2">
            <FinancialFigure
              value={totalMarketValue}
              size="xl"
              asOf="Today 4:00 PM EST"
              freshness="live"
            />
          </div>
          <span className="text-xs text-slate-500 mt-2 block">
            {filteredHoldings.length} Positions Valued Live
          </span>
        </div>

        {/* Total Cost Basis */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
            Aggregated Cost Basis
          </span>
          <div className="mt-2">
            <FinancialFigure
              value={totalCostBasis}
              size="xl"
              asOf="Book of record"
              freshness="live"
            />
          </div>
          <span className="text-xs text-slate-500 mt-2 block">
            Adjusted FIFO tax-lot basis
          </span>
        </div>

        {/* Unrealized Gain/Loss */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
              Unrealized Gain / Loss
            </span>
            {onOpenCalculationModal && (
              <button
                onClick={() => onOpenCalculationModal('calc_unrealized_gain_loss')}
                className="text-slate-400 hover:text-emerald-700"
                title="View Calculation Methodology"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="mt-2">
            <FinancialFigure
              value={totalGainLoss}
              size="xl"
              asOf="Today 4:00 PM EST"
              freshness="live"
              showGainLossColor={true}
              isCalculated={true}
              calculationId="calc_unrealized_gain_loss"
            />
          </div>
          <span
            className={`text-xs font-semibold mt-2 block ${
              totalGainLoss >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {totalGainLoss >= 0 ? '+' : ''}
            {totalGainLossPercent.toFixed(2)}% Return on Capital
          </span>
        </div>

        {/* Projected Dividend Income */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
              Projected Annual Income
            </span>
            {onOpenCalculationModal && (
              <button
                onClick={() => onOpenCalculationModal('calc_projected_income')}
                className="text-slate-400 hover:text-emerald-700"
                title="View Income Methodology"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="mt-2">
            <FinancialFigure
              value={totalProjectedIncome}
              size="xl"
              asOf="Forward 12 Mo Est."
              freshness="live"
              isCalculated={true}
              calculationId="calc_projected_income"
            />
          </div>
          <span className="text-xs text-slate-500 mt-2 block">
            Blended Yield: <span className="font-semibold text-slate-800">{blendedYield.toFixed(2)}%</span> • ESG: <span className="font-semibold text-emerald-700">{weightedEsg.toFixed(1)}/100</span>
          </span>
        </div>
      </div>

      {/* Main Holdings Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Header & Search Controls */}
        <div className="p-5 bg-slate-50/75 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Security Holdings & Performance Attribution</h3>
              <PrototypeBadge label="Daily Pricing Feed" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Individual positions with cost basis lots, unrealized returns, income yields, and ESG ratings
            </p>
          </div>
          {onOpenApprovalModal && (
            <button
              onClick={onOpenApprovalModal}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors self-start md:self-auto flex items-center gap-1.5"
            >
              <DollarSign className="w-3.5 h-3.5" />
              Submit Trade or Harvest Request
            </button>
          )}
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ticker, name, or sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-slate-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Account Selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Account:</span>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              >
                <option value="ALL">All Authorized Accounts ({accounts.length})</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.accountNumberMasked})
                  </option>
                ))}
              </select>
            </div>

            {/* Asset Class Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {assetClasses.map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSelectedAssetClass(cls)}
                  className={`px-2.5 py-0.5 rounded text-xs font-semibold transition-colors ${
                    selectedAssetClass === cls
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100/75 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Symbol & Description</th>
                <th className="py-3 px-4">Asset Class & Sector</th>
                <th className="py-3 px-4">Geography</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4 text-right">Current Price</th>
                <th className="py-3 px-4 text-right">Market Value</th>
                <th className="py-3 px-4 text-right">Cost Basis</th>
                <th className="py-3 px-4 text-right">Unrealized Gain / Loss</th>
                <th className="py-3 px-4 text-right">Div Yield (Est. Income)</th>
                <th className="py-3 px-4 text-center">ESG Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredHoldings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No holdings match your current filter selection.
                  </td>
                </tr>
              ) : (
                filteredHoldings.map((hld) => {
                  const estIncome = (hld.marketValue * (hld.dividendYield || 0)) / 100;
                  const isGain = hld.unrealizedGainLoss >= 0;

                  return (
                    <tr key={hld.id} className="hover:bg-slate-50 transition-colors">
                      {/* Symbol & Name */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 text-sm">{hld.symbol}</span>
                        <span className="block text-[11px] text-slate-500 truncate max-w-xs" title={hld.name}>
                          {hld.name}
                        </span>
                      </td>

                      {/* Class & Sector */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800 block">{hld.assetClass}</span>
                        <span className="text-[11px] text-slate-400 block">{hld.sector}</span>
                      </td>

                      {/* Geography */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {hld.geography || 'US'}
                        </span>
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-4 text-right font-mono font-medium">
                        {hld.quantity.toLocaleString()}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 text-right font-mono font-medium">
                        ${hld.price.toFixed(2)}
                      </td>

                      {/* Market Value */}
                      <td className="py-3 px-4 text-right">
                        <FinancialFigure
                          value={hld.marketValue}
                          size="sm"
                          asOf={hld.asOf}
                          freshness={hld.freshness}
                          showAsOfInline={false}
                        />
                      </td>

                      {/* Cost Basis */}
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-700">
                        ${hld.costBasis.toLocaleString()}
                      </td>

                      {/* Unrealized Gain/Loss */}
                      <td className="py-3 px-4 text-right font-mono">
                        <span className={`font-semibold block ${isGain ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {isGain ? '+' : ''}${hld.unrealizedGainLoss.toLocaleString()}
                        </span>
                        <span className={`text-[10px] ${isGain ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {isGain ? '+' : ''}
                          {hld.unrealizedGainLossPercent.toFixed(2)}%
                        </span>
                      </td>

                      {/* Dividend Yield & Projected Income */}
                      <td className="py-3 px-4 text-right font-mono">
                        <span className="font-medium text-slate-900 block">
                          {hld.dividendYield?.toFixed(2)}%
                        </span>
                        <span className="text-[10px] text-slate-500">
                          ~${Math.round(estIncome).toLocaleString()}/yr
                        </span>
                      </td>

                      {/* ESG Score */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            (hld.esgScore || 75) >= 80
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {hld.esgScore || 75}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
