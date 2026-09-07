import React, { useState } from 'react';
import { Account } from '../../../types';
import { FinancialFigure } from '../../common/FinancialFigure';
import { PrototypeBadge } from '../../common/PrototypeBadge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Clock,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Landmark,
  PiggyBank,
  Briefcase,
  FileCheck,
} from 'lucide-react';

interface OverviewTabProps {
  accounts: Account[];
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  netWorthTrend: { month: string; value: number }[];
  selectedPeriod: '1M' | '3M' | 'YTD' | '1Y' | '3Y' | 'ALL';
  onSelectPeriod: (p: '1M' | '3M' | 'YTD' | '1Y' | '3Y' | 'ALL') => void;
  onOpenApprovalModal?: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  accounts,
  totalAssets,
  totalLiabilities,
  netWorth,
  netWorthTrend,
  selectedPeriod,
  onSelectPeriod,
  onOpenApprovalModal,
}) => {
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>('ALL');

  // Compute liquid cash & sweeps
  const liquidCash = accounts.reduce((sum, a) => sum + (a.cashBalance || 0), 0);

  // Compute unrealized portfolio gains/losses
  const totalUnrealizedGain = accounts.reduce((sum, a) => sum + (a.unrealizedGainLoss || 0), 0);

  const filterCategories = [
    { id: 'ALL', label: 'All Accounts', count: accounts.length },
    { id: 'taxable', label: 'Taxable Brokerage', count: accounts.filter((a) => a.type === 'taxable').length },
    { id: 'retirement', label: 'Retirement (IRA/Roth)', count: accounts.filter((a) => a.type.includes('ira') || a.type.includes('retirement')).length },
    { id: 'trust', label: 'Trust & Fiduciary', count: accounts.filter((a) => a.type === 'trust').length },
    { id: 'banking', label: 'Banking & Cash', count: accounts.filter((a) => a.type === 'banking').length },
    { id: 'liabilities', label: 'Liabilities & Credit', count: accounts.filter((a) => a.type === 'mortgage' || a.type === 'credit' || a.balance < 0).length },
    { id: 'external', label: 'External Aggregated', count: accounts.filter((a) => a.isExternal).length },
  ];

  const filteredAccounts = accounts.filter((acc) => {
    if (accountTypeFilter === 'ALL') return true;
    if (accountTypeFilter === 'taxable') return acc.type === 'taxable';
    if (accountTypeFilter === 'retirement') return acc.type.includes('ira') || acc.type.includes('retirement');
    if (accountTypeFilter === 'trust') return acc.type === 'trust';
    if (accountTypeFilter === 'banking') return acc.type === 'banking';
    if (accountTypeFilter === 'liabilities') return acc.type === 'mortgage' || acc.type === 'credit' || acc.balance < 0;
    if (accountTypeFilter === 'external') return acc.isExternal;
    return true;
  });

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'taxable':
        return Briefcase;
      case 'traditional_ira':
      case 'roth_ira':
        return PiggyBank;
      case 'trust':
        return ShieldCheck;
      case 'banking':
        return Landmark;
      case 'mortgage':
        return Building2;
      case 'credit':
        return CreditCard;
      default:
        return FileCheck;
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Worth */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
            Consolidated Net Worth
          </span>
          <div className="mt-2">
            <FinancialFigure
              value={netWorth}
              size="xl"
              asOf="Today 4:00 PM EST"
              freshness="live"
              isCalculated={true}
              calculationId="calc_net_worth"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
            <span className="text-emerald-700 font-semibold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +$570.5k (+7.2%)
            </span>
            <span>trailing 12 mo</span>
          </p>
        </div>

        {/* Liquid Assets */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
            Liquid Assets & Cash
          </span>
          <div className="mt-2">
            <FinancialFigure
              value={totalAssets > 0 ? (totalAssets * 0.48) : 0}
              size="xl"
              asOf="Settled T+1"
              freshness="live"
              isCalculated={true}
              calculationId="calc_liquid_assets"
            />
          </div>
          <span className="text-xs text-slate-500 mt-2 block">
            Immediate wire & sweep liquidity
          </span>
        </div>

        {/* Total Liabilities */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
            Total Liabilities
          </span>
          <div className="mt-2">
            <FinancialFigure
              value={totalLiabilities > 0 ? -totalLiabilities : 0}
              size="xl"
              asOf="Servicing Feed 9:32 AM"
              freshness="today_932am"
            />
          </div>
          <span className="text-xs text-slate-500 mt-2 block">
            Jumbo mortgage & active credit lines
          </span>
        </div>

        {/* Unrealized Gain/Loss */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
            Unrealized Capital P&L
          </span>
          <div className="mt-2">
            <FinancialFigure
              value={totalUnrealizedGain}
              size="xl"
              asOf="Daily Closing Mark"
              freshness="live"
              showGainLossColor={true}
              isCalculated={true}
              calculationId="calc_unrealized_gain_loss"
            />
          </div>
          <span className="text-xs text-slate-500 mt-2 block">
            Total embedded book-of-record gains
          </span>
        </div>
      </div>

      {/* Trajectory Area Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">Historical Net Worth Trajectory</h3>
              <PrototypeBadge label="Book-of-Record Time Series" />
            </div>
            <p className="text-xs text-slate-500">
              Audit-verified month-end closing valuations across all custodial accounts
            </p>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold self-start sm:self-auto">
            {(['1M', '3M', 'YTD', '1Y', '3Y', 'ALL'] as const).map((p) => (
              <button
                key={p}
                onClick={() => onSelectPeriod(p)}
                className={`px-3 py-1 rounded transition-colors ${
                  selectedPeriod === p
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={netWorthTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                domain={['dataMin - 400000', 'dataMax + 200000']}
                tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Net Worth']}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#059669"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#netWorthGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Account Categories & Balances Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Section Header */}
        <div className="p-5 bg-slate-50/75 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Account Classification & Custodial Feeds</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
                {accounts.length} Accounts Connected
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-custodian aggregation with verified freshness indicators and error reconciliation
            </p>
          </div>
          {onOpenApprovalModal && (
            <button
              onClick={onOpenApprovalModal}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors self-start md:self-auto flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Rebalance or Transfer Request
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="px-5 py-3 border-b border-slate-200 bg-white flex flex-wrap gap-1.5">
          {filterCategories
            .filter((cat) => cat.count > 0 || cat.id === 'ALL')
            .map((cat) => (
              <button
                key={cat.id}
                onClick={() => setAccountTypeFilter(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  accountTypeFilter === cat.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
        </div>

        {/* Account Cards Grid */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccounts.map((acc) => {
            const Icon = getAccountIcon(acc.type);
            const isStale = acc.freshness === 'stale_3d';
            const isNegative = acc.balance < 0;

            return (
              <div
                key={acc.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isStale
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Top: Icon, Name, Type */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${isNegative ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">
                          {acc.name}
                        </h4>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {acc.accountNumberMasked} {acc.isExternal && '• External'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Custodian / Source */}
                  <div className="text-xs text-slate-600 flex items-center justify-between py-1 border-t border-slate-100 mt-2">
                    <span>Custodian:</span>
                    <span className="font-medium text-slate-800">{acc.custodian}</span>
                  </div>

                  {/* Cash Sweep */}
                  {acc.cashBalance !== undefined && acc.cashBalance > 0 && (
                    <div className="text-xs text-slate-600 flex items-center justify-between py-1">
                      <span>Cash Sweep:</span>
                      <span className="font-mono font-medium text-slate-800">
                        ${acc.cashBalance.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Cost Basis / Unrealized P&L */}
                  {acc.unrealizedGainLoss !== 0 && (
                    <div className="text-xs text-slate-600 flex items-center justify-between py-1">
                      <span>Unrealized Gain/Loss:</span>
                      <span
                        className={`font-mono font-semibold ${
                          acc.unrealizedGainLoss > 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {acc.unrealizedGainLoss > 0 ? '+' : ''}${acc.unrealizedGainLoss.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom: Current Balance with FinancialFigure and Freshness */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                        {isNegative ? 'Outstanding Balance' : 'Account Market Value'}
                      </span>
                      <FinancialFigure
                        value={acc.balance}
                        size="md"
                        asOf={acc.asOf}
                        freshness={acc.freshness}
                        showAsOfInline={false}
                      />
                    </div>
                  </div>

                  {/* Stale Data Warning & Reconciliation Trigger */}
                  {isStale && (
                    <div className="mt-2.5 p-2 bg-amber-100/60 border border-amber-300 rounded-lg flex items-center justify-between text-xs text-amber-900">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span className="text-[11px] font-medium">Sync Delayed (3 Days)</span>
                      </div>
                      <button
                        onClick={() => alert(`Initiating manual reconciliation refresh for ${acc.name} with aggregator.`)}
                        className="text-[10px] font-bold text-amber-950 underline hover:no-underline"
                      >
                        Reconcile Feed
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
