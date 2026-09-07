import React, { useState, useEffect } from 'react';
import {
  MOCK_PARTICIPANTS,
  MOCK_PLAN_INVESTMENTS,
  MOCK_RETIREMENT_PLAN,
} from '../../../data/mockData';
import { UserProfile, PlanInvestmentOption } from '../../../types';
import { institutionalService, FiduciaryReview } from '../../../services/institutionalService';
import { FinancialFigure } from '../../common/FinancialFigure';
import { PrototypeBadge } from '../../common/PrototypeBadge';
import {
  Building2,
  Users,
  PieChart as PieIcon,
  Calendar,
  AlertTriangle,
  Lock,
  CheckCircle2,
  ArrowRight,
  Calculator,
  ShieldCheck,
  Briefcase,
  HelpCircle,
  Plus,
  RefreshCw,
  FileText,
  DollarSign,
  Landmark,
  FileCheck,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface InstitutionalRetirementModuleProps {
  currentUser: UserProfile;
  onRequestApproval?: (type: 'plan_action') => void;
}

export const InstitutionalRetirementModule: React.FC<InstitutionalRetirementModuleProps> = ({
  currentUser,
  onRequestApproval,
}) => {
  // Access rules
  const isParticipant = currentUser.role === 'plan_participant';
  const isSponsor = currentUser.role === 'plan_sponsor' || currentUser.role === 'cfo_committee';

  const [activeTab, setActiveTab] = useState<
    'plan_overview' | 'lineup' | 'fiduciary_reviews' | 'compliance' | 'participant_portal'
  >(isParticipant ? 'participant_portal' : 'plan_overview');

  // Subscribed state from institutionalService
  const [plan, setPlan] = useState(institutionalService.getPlan());
  const [investments, setInvestments] = useState(institutionalService.getInvestmentOptions());
  const [fiduciaryReviews, setFiduciaryReviews] = useState(institutionalService.getFiduciaryReviews());

  // Participant specific state
  const participantId = 'part_001';
  const [currentParticipant, setCurrentParticipant] = useState(
    institutionalService.getParticipant(participantId) || MOCK_PARTICIPANTS[0]
  );

  const [deferralRate, setDeferralRate] = useState(currentParticipant.deferralRate || 10);
  const [targetRetirementAge, setTargetRetirementAge] = useState(67);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Future contribution allocation edit state
  const [isEditingAllocations, setIsEditingAllocations] = useState(false);
  const [allocations, setAllocations] = useState<{ [symbol: string]: number }>({
    FXAIX: 50,
    FSKAX: 20,
    FTIHX: 15,
    FXNAX: 15,
  });

  // Replacement fund modal state
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [fundToReplace, setFundToReplace] = useState('FDEEX');
  const [replacementSymbol, setReplacementSymbol] = useState('FDEWX');
  const [replacementName, setReplacementName] = useState('Fidelity Freedom Index 2055 Investor Class');

  // Loan calculator state
  const [loanAmount, setLoanAmount] = useState(15000);
  const [loanTermMonths, setLoanTermMonths] = useState(60);

  useEffect(() => {
    const unsub = institutionalService.subscribe(() => {
      setPlan(institutionalService.getPlan());
      setInvestments(institutionalService.getInvestmentOptions());
      setFiduciaryReviews(institutionalService.getFiduciaryReviews());
      const p = institutionalService.getParticipant(participantId);
      if (p) {
        setCurrentParticipant(p);
        setDeferralRate(p.deferralRatePercent);
      }
    });
    return () => unsub();
  }, []);

  // Calculate projected monthly income for participant
  const currentSalary = 142000;
  const annualContrib = (currentSalary * deferralRate) / 100;
  const matchContrib = Math.min(deferralRate, 4) * currentSalary * 0.01;
  const totalAnnualSavings = annualContrib + matchContrib;
  const projectedBalanceAt67 =
    currentParticipant.totalBalance * Math.pow(1.065, targetRetirementAge - currentParticipant.age) +
    totalAnnualSavings * ((Math.pow(1.065, targetRetirementAge - currentParticipant.age) - 1) / 0.065);
  const projectedMonthlyRetirementIncome = (projectedBalanceAt67 * 0.04) / 12;

  // Max 401(k) loan allowed (Lesser of $50,000 or 50% of vested balance)
  const maxLoanAllowed = Math.min(50000, currentParticipant.vestedBalance * 0.5);
  const loanMonthlyPayment =
    (loanAmount * (0.085 / 12)) / (1 - Math.pow(1 + 0.085 / 12, -loanTermMonths));

  // Handlers
  const handleSaveDeferral = () => {
    const res = institutionalService.updateParticipantDeferral(participantId, deferralRate, currentUser);
    setStatusMessage(res.message);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleSaveAllocations = () => {
    const allocArray = Object.entries(allocations).map(([symbol, percentage]) => ({
      fundSymbol: symbol,
      percentage: Number(percentage) || 0,
    }));
    const res = institutionalService.updateParticipantAllocations(participantId, allocArray, currentUser);
    setStatusMessage(res.message);
    if (res.success) {
      setIsEditingAllocations(false);
    }
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleExecuteFundReplacement = (e: React.FormEvent) => {
    e.preventDefault();
    institutionalService.replaceWatchlistFund(
      fundToReplace,
      replacementSymbol,
      replacementName,
      currentUser
    );
    setIsReplaceModalOpen(false);
    setStatusMessage(`Fund ${fundToReplace} successfully replaced with ${replacementSymbol}.`);
    if (onRequestApproval) onRequestApproval('plan_action');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Plan demographic participation chart data
  const participationByTenure = [
    { tenure: '< 1 Year', participation: 74, benchmark: 70 },
    { tenure: '1 - 3 Yrs', participation: 89, benchmark: 82 },
    { tenure: '3 - 5 Yrs', participation: 95, benchmark: 88 },
    { tenure: '5+ Years', participation: 98, benchmark: 91 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              {isParticipant
                ? 'Participant 401(k) Retirement Center'
                : 'Institutional Plan Sponsor & Committee Portal'}
            </h1>
            <PrototypeBadge label="ERISA Fiduciary Standards" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isParticipant
              ? `Personal Retirement Account: ${currentParticipant.firstName} ${currentParticipant.lastName} (ID: ${currentParticipant.employeeId})`
              : `${plan.planName} • ${plan.sponsorName} (Plan #001)`}
          </p>
        </div>

        {/* Tab Controls */}
        {!isParticipant ? (
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('plan_overview')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'plan_overview'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              Plan Aggregates
            </button>
            <button
              onClick={() => setActiveTab('lineup')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'lineup'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5 text-indigo-600" />
              Investment Menu ({investments.length})
            </button>
            <button
              onClick={() => setActiveTab('fiduciary_reviews')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'fiduciary_reviews'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
              Fiduciary Committee
            </button>
            <button
              onClick={() => setActiveTab('compliance')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'compliance'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              ERISA & Form 5500
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Active Participant Account
            </span>
          </div>
        )}
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {statusMessage}
        </div>
      )}

      {/* Critical Security Constraint Notice for Plan Sponsor */}
      {isSponsor && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3 text-xs text-blue-900">
          <Lock className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">ERISA Privacy Partition Enforced:</span>
            <p className="mt-0.5 text-blue-800">
              Pursuant to Department of Labor (DOL) participant privacy standards, plan sponsors and committee members may ONLY view anonymized, plan-level aggregates. Individual employee balances and personal portfolio elections are strictly blocked from sponsor inspection.
            </p>
          </div>
        </div>
      )}

      {/* TAB 1: PLAN SPONSOR OVERVIEW */}
      {activeTab === 'plan_overview' && !isParticipant && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Total Plan Assets</span>
              <div className="mt-2">
                <FinancialFigure
                  value={plan.totalAssets}
                  size="2xl"
                  asOf="Today 4:00 PM EST"
                  freshness="live"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Custodied at Fidelity Institutional</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Plan Participation Rate</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 font-mono">
                  {plan.participationRate}%
                </span>
                <span className="text-xs text-emerald-600 font-semibold">+4.2% YoY</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                {plan.activeParticipants} of {plan.eligibleParticipants} eligible employees
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Average Deferral Rate</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 font-mono">
                  {plan.averageDeferralRate}%
                </span>
                <span className="text-xs text-slate-400">Benchmark: 7.2%</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">With {plan.employerMatchFormula}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Lineup Watchlist Status</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-amber-600 font-mono">
                  {investments.filter((i) => i.status === 'Watchlist').length} Funds
                </span>
                <span className="text-xs text-slate-400">of {investments.length} funds</span>
              </div>
              <p className="text-[11px] text-amber-700 font-semibold mt-2">Quarterly Review Active</p>
            </div>
          </div>

          {/* Demographic Participation Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Participation by Employee Tenure vs Industry Benchmark
                </h3>
                <p className="text-xs text-slate-500">Plan engagement and auto-enrollment impact</p>
              </div>
              <PrototypeBadge variant="calculation" label="Census Model" />
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={participationByTenure} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="tenure" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="%" />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, '']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      color: '#fff',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="participation"
                    name="Apex Clean Energy 401(k)"
                    fill="#4f46e5"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="benchmark"
                    name="National Energy Sector Avg"
                    fill="#cbd5e1"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVESTMENT LINEUP & FIDUCIARY WATCHLIST */}
      {activeTab === 'lineup' && !isParticipant && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">401(k) Investment Menu & Scorecard</h3>
              <p className="text-xs text-slate-500">
                Quarterly fiduciary evaluation based on performance, tracking error, expense ratio, and style drift
              </p>
            </div>
            <button
              onClick={() => setIsReplaceModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Propose Lineup Replacement
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Fund Name & Ticker</th>
                  <th className="py-3 px-4">Asset Category</th>
                  <th className="py-3 px-4 text-right">Expense Ratio</th>
                  <th className="py-3 px-4 text-right">1-Yr Return</th>
                  <th className="py-3 px-4 text-right">3-Yr Return</th>
                  <th className="py-3 px-4 text-right">Plan Assets</th>
                  <th className="py-3 px-4 text-center">Fiduciary Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {investments.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">{inv.symbol}</span>
                      <span className="block text-[11px] text-slate-500 truncate max-w-xs">{inv.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{inv.assetClass}</td>
                    <td className="py-3 px-4 text-right font-mono font-medium">
                      {(inv.expenseRatio * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-600 font-semibold">
                      +{inv.oneYearReturn}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">
                      +{inv.threeYearReturn}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ${(inv.planAssets || 3200000).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === 'Watchlist'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FIDUCIARY COMMITTEE REVIEWS */}
      {activeTab === 'fiduciary_reviews' && !isParticipant && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                ERISA Fiduciary Committee Minutes & Resolutions
              </h3>
              <p className="text-xs text-slate-500">
                Quarterly fiduciary committee governance records, fee benchmarking, and fund decisions
              </p>
            </div>
            <PrototypeBadge label="DOL Audit Trail" />
          </div>

          <div className="space-y-4">
            {fiduciaryReviews.map((rev) => (
              <div key={rev.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{rev.meetingTitle}</h4>
                    <span className="text-[11px] text-slate-500">
                      Date: {rev.reviewDate} • Attendees: {rev.attendees.join(', ')}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold w-fit ${
                      rev.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {rev.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Approved Decisions & Resolutions:
                    </span>
                    <ul className="list-disc list-inside text-slate-600 space-y-1 text-[11px]">
                      {rev.decisions.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                      Fiduciary Recommendations:
                    </span>
                    <ul className="list-disc list-inside text-slate-600 space-y-1 text-[11px]">
                      {rev.recommendations.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ERISA & FORM 5500 */}
      {activeTab === 'compliance' && !isParticipant && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">ERISA Fiduciary File & Compliance Calendar</h3>
            <p className="text-xs text-slate-500">
              Department of Labor compliance tests, Form 5500 audit package, and meeting minutes
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase">ADP / ACP Non-Discrimination</span>
              <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-700 pt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Passed (Safe Harbor Formula)</span>
              </div>
              <span className="text-[11px] text-slate-400 block">Tested: July 2026</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase">Top Heavy Testing (§ 416)</span>
              <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-700 pt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Passed (Key Employees: 38.2%)</span>
              </div>
              <span className="text-[11px] text-slate-400 block">Threshold is &lt; 60%</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase">Form 5500 Filing Deadline</span>
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800 pt-1">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>October 15, 2026</span>
              </div>
              <span className="text-[11px] text-indigo-600 font-semibold block">Independent Audit in Progress</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PARTICIPANT PORTAL (Requirement #6) */}
      {(activeTab === 'participant_portal' || isParticipant) && (
        <div className="space-y-6">
          {/* Participant Balances by Source */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Total Account Balance</span>
              <div className="mt-2">
                <FinancialFigure
                  value={currentParticipant.totalBalance}
                  size="2xl"
                  asOf="Today 4:00 PM EST"
                  freshness="live"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Vested: ${currentParticipant.vestedBalance.toLocaleString()} (100%)
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Pre-Tax 401(k) Balance</span>
              <div className="mt-2">
                <FinancialFigure
                  value={Math.round(currentParticipant.totalBalance * 0.65)}
                  size="2xl"
                  asOf="Custodial Ledger"
                  freshness="live"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Taxable upon distribution</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Roth 401(k) Balance</span>
              <div className="mt-2">
                <FinancialFigure
                  value={Math.round(currentParticipant.totalBalance * 0.25)}
                  size="2xl"
                  asOf="Custodial Ledger"
                  freshness="live"
                />
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold mt-2">100% Tax-Free in Retirement</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Employer Match Balance</span>
              <div className="mt-2">
                <FinancialFigure
                  value={Math.round(currentParticipant.totalBalance * 0.1)}
                  size="2xl"
                  asOf="Custodial Ledger"
                  freshness="live"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Fully vested company contribution</p>
            </div>
          </div>

          {/* Interactive Contribution Rate & Retirement Projection */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Paycheck Deferral & Retirement Income Simulator
                  </h3>
                  <p className="text-xs text-slate-500">
                    Adjust your paycheck contribution percentage and target retirement age
                  </p>
                </div>
              </div>
              <button
                onClick={handleSaveDeferral}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Save Election ({deferralRate}%) to Payroll
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Paycheck Deferral Contribution Rate</span>
                    <span className="font-mono font-bold text-indigo-700">{deferralRate}% of Gross Salary</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    step="1"
                    value={deferralRate}
                    onChange={(e) => setDeferralRate(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>1%</span>
                    <span>4% (Company Match Cap)</span>
                    <span>10% (Target)</span>
                    <span>25%</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Target Retirement Age</span>
                    <span className="font-mono font-bold text-indigo-700">{targetRetirementAge} Years</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="72"
                    step="1"
                    value={targetRetirementAge}
                    onChange={(e) => setTargetRetirementAge(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Age 60</span>
                    <span>Age 67 (Social Security Full)</span>
                    <span>Age 72</span>
                  </div>
                </div>
              </div>

              {/* Simulation Result Outputs */}
              <div className="space-y-3 bg-white p-4 rounded-lg border border-slate-200 text-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Projected Retirement Lifestyle
                </span>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Projected Portfolio at Age {targetRetirementAge}:</span>
                  <FinancialFigure
                    value={Math.round(projectedBalanceAt67)}
                    size="sm"
                    isScenario={true}
                    scenarioLabel="Simulation"
                  />
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Estimated Monthly Retirement Income:</span>
                  <FinancialFigure
                    value={Math.round(projectedMonthlyRetirementIncome)}
                    size="sm"
                    isScenario={true}
                    scenarioLabel="Est. Monthly"
                  />
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Annual Employee + Match Savings:</span>
                  <span className="font-mono font-bold text-indigo-700">
                    ${Math.round(totalAnnualSavings).toLocaleString()} / yr
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Future Contribution Allocation Editor & Investment Lineup */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Contribution Investment Elections
                </h3>
                <p className="text-xs text-slate-500">
                  How your ongoing paycheck deductions are invested across plan funds
                </p>
              </div>
              {!isEditingAllocations ? (
                <button
                  onClick={() => setIsEditingAllocations(true)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg"
                >
                  Change Elections
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingAllocations(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAllocations}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                  >
                    Save Allocations
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {Object.entries(allocations).map(([symbol, pct]) => {
                const inv = investments.find((i) => i.symbol === symbol);
                return (
                  <div key={symbol} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{symbol}</span>
                      {isEditingAllocations ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={pct}
                          onChange={(e) =>
                            setAllocations({
                              ...allocations,
                              [symbol]: Number(e.target.value),
                            })
                          }
                          className="w-14 text-right p-1 border border-slate-300 rounded text-xs"
                        />
                      ) : (
                        <span className="font-mono text-indigo-700">{pct}%</span>
                      )}
                    </div>
                    <span className="block text-[11px] text-slate-500 truncate">
                      {inv?.name || 'Index Investment Fund'}
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      Expense: {inv ? (inv.expenseRatio * 100).toFixed(2) : '0.04'}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Participant Loan & Hardship Calculator */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    401(k) Participant Loan & In-Service Withdrawal Modeler
                  </h3>
                  <p className="text-xs text-slate-500">
                    Model loan repayments repaid via payroll deduction (Prime + 1% interest returns to your account)
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Eligible for Loan
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Requested Loan Amount:</span>
                    <span className="font-mono font-bold text-indigo-700">
                      ${loanAmount.toLocaleString()} (Max: ${maxLoanAllowed.toLocaleString()})
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max={maxLoanAllowed}
                    step="500"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Repayment Term:</label>
                  <select
                    value={loanTermMonths}
                    onChange={(e) => setLoanTermMonths(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs"
                  >
                    <option value={12}>1 Year (12 months)</option>
                    <option value={36}>3 Years (36 months)</option>
                    <option value={60}>5 Years (60 months - Standard)</option>
                  </select>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block">Estimated Payroll Repayment:</span>
                <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                  <span className="text-slate-600">Monthly Payroll Deduction:</span>
                  <span className="font-mono font-bold text-slate-900">
                    ${Math.round(loanMonthlyPayment).toLocaleString()} / mo
                  </span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                  <span className="text-slate-600">Interest Rate:</span>
                  <span className="font-mono font-semibold text-slate-700">8.50% (Prime + 1.00%)</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  All interest paid goes directly back into your own 401(k) account.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPLACE WATCHLIST FUND MODAL */}
      {isReplaceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm">
                Propose Fiduciary Lineup Replacement
              </h4>
              <button
                onClick={() => setIsReplaceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteFundReplacement} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Fund to Remove (Watchlist):</label>
                <select
                  value={fundToReplace}
                  onChange={(e) => setFundToReplace(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
                >
                  {investments.map((i) => (
                    <option key={i.id} value={i.symbol}>
                      {i.symbol} - {i.name} ({i.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Replacement Ticker Symbol:</label>
                <input
                  type="text"
                  value={replacementSymbol}
                  onChange={(e) => setReplacementSymbol(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Replacement Fund Name:</label>
                <input
                  type="text"
                  value={replacementName}
                  onChange={(e) => setReplacementName(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px] space-y-1">
                <span className="font-bold">ERISA 404(c) Fiduciary Requirement:</span>
                <p>
                  Requires 30-day participant notification and QDIA mapping prior to asset transition.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReplaceModalOpen(false)}
                  className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Execute Fund Replacement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
