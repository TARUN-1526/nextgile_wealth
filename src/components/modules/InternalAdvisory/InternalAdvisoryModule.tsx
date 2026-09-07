import React, { useState, useEffect } from 'react';
import {
  MOCK_ACCOUNTS,
  MOCK_CLIENTS,
  MOCK_HOUSEHOLDS,
  MOCK_HOLDINGS,
  MOCK_ESTATE_PLAN,
} from '../../../data/mockData';
import {
  UserProfile,
  Household,
  AdvisorRecommendation,
  RebalanceProposal,
  TradeOrder,
  Meeting,
  ActionItem,
} from '../../../types';
import { AccessControlService } from '../../../services/accessControl';
import { portfolioService } from '../../../services/portfolioService';
import { communicationService } from '../../../services/communicationService';
import { taxService } from '../../../services/taxService';
import { FinancialFigure } from '../../common/FinancialFigure';
import { PrototypeBadge } from '../../common/PrototypeBadge';
import {
  Briefcase,
  Users,
  TrendingUp,
  RotateCcw,
  Calendar,
  CheckSquare,
  ArrowRight,
  Filter,
  Search,
  Sliders,
  Send,
  UserCheck,
  AlertCircle,
  Plus,
  Sparkles,
  ShieldAlert,
  FileText,
  Clock,
  CheckCircle2,
  DollarSign,
  PieChart,
  Eye,
} from 'lucide-react';

interface InternalAdvisoryModuleProps {
  currentUser: UserProfile;
  onRequestRebalance?: () => void;
  onNavigateToClient?: (householdId: string) => void;
  onRequestApproval?: (type: any) => void;
}

export const InternalAdvisoryModule: React.FC<InternalAdvisoryModuleProps> = ({
  currentUser,
  onRequestRebalance,
  onNavigateToClient,
  onRequestApproval,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'households' | 'client_360' | 'rebalance_workbench' | 'recommendations' | 'tasks_meetings'
  >('households');

  const [searchTerm, setSearchTerm] = useState('');

  // Access controlled households
  const accessibleHouseholds = AccessControlService.getAccessibleHouseholds(currentUser, MOCK_HOUSEHOLDS);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string>(
    accessibleHouseholds[0]?.id || 'hh_vance'
  );

  // Reactive state
  const [recommendations, setRecommendations] = useState<AdvisorRecommendation[]>(
    portfolioService.getRecommendations()
  );
  const [proposals, setProposals] = useState<RebalanceProposal[]>(
    portfolioService.getRebalanceProposals()
  );
  const [meetings, setMeetings] = useState<Meeting[]>(
    communicationService.getMeetings()
  );
  const [actionItems, setActionItems] = useState<ActionItem[]>(
    communicationService.getActionItems()
  );

  useEffect(() => {
    const unsubPort = portfolioService.subscribe(() => {
      setRecommendations(portfolioService.getRecommendations());
      setProposals(portfolioService.getRebalanceProposals());
    });
    const unsubComm = communicationService.subscribe(() => {
      setMeetings(communicationService.getMeetings());
      setActionItems(communicationService.getActionItems());
    });
    return () => {
      unsubPort();
      unsubComm();
    };
  }, []);

  // Modal states
  const [isRecModalOpen, setIsRecModalOpen] = useState(false);
  const [recTitle, setRecTitle] = useState('');
  const [recCategory, setRecCategory] = useState<AdvisorRecommendation['category']>('Tax Optimization');
  const [recImpact, setRecImpact] = useState('');
  const [recRationale, setRecRationale] = useState('');
  const [recPriority, setRecPriority] = useState<AdvisorRecommendation['priority']>('High');

  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetTitle, setMeetTitle] = useState('');
  const [meetDate, setMeetDate] = useState('2026-09-25');
  const [meetTime, setMeetTime] = useState('10:00 AM');
  const [meetAgenda, setMeetAgenda] = useState('');

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('2026-09-30');
  const [taskPriority, setTaskPriority] = useState<ActionItem['priority']>('High');

  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Selected household data for Client 360
  const currentHousehold =
    accessibleHouseholds.find((h) => h.id === selectedHouseholdId) || accessibleHouseholds[0];

  const householdAccounts = MOCK_ACCOUNTS.filter((a) => a.householdId === currentHousehold?.id);
  const householdClients = MOCK_CLIENTS.filter((c) => currentHousehold?.clientIds.includes(c.id));
  const householdTaxOpps = taxService.getTaxOpportunities(currentHousehold?.id);
  const householdRecs = recommendations.filter((r) => r.householdId === currentHousehold?.id);
  const householdMeetings = meetings.filter((m) =>
    m.clientOrSponsorName.toLowerCase().includes(currentHousehold?.name.toLowerCase().split(' ')[0] || '')
  );
  const householdActionItems = actionItems.filter((a) =>
    a.relatedEntity.toLowerCase().includes(currentHousehold?.name.toLowerCase().split(' ')[0] || '')
  );

  const totalAUM = accessibleHouseholds.reduce((sum, hh) => sum + hh.totalNetWorth, 0);

  const filteredHouseholds = accessibleHouseholds.filter(
    (hh) =>
      hh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (hh.primaryAdvisor && hh.primaryAdvisor.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Actions
  const handleOpenClient360 = (hhId: string) => {
    setSelectedHouseholdId(hhId);
    setActiveSubTab('client_360');
  };

  const handleCreateRecommendation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recTitle.trim()) return;

    portfolioService.createRecommendation({
      householdId: selectedHouseholdId,
      title: recTitle,
      category: recCategory,
      impact: recImpact || 'Optimization benefit',
      rationale: recRationale || 'Fiduciary recommendation based on quarterly review.',
      priority: recPriority,
      user: currentUser,
    });

    setIsRecModalOpen(false);
    setRecTitle('');
    setRecImpact('');
    setRecRationale('');
    setActionMessage('Strategic advisor recommendation created and logged in audit trail.');
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleScheduleMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetTitle.trim()) return;

    communicationService.scheduleMeeting(
      {
        title: meetTitle,
        advisorName: currentUser.name,
        clientOrSponsorName: currentHousehold.name,
        date: meetDate,
        time: meetTime,
        status: 'Scheduled',
        agenda: meetAgenda || 'Fiduciary portfolio and tax review',
      },
      currentUser
    );

    setIsMeetingModalOpen(false);
    setMeetTitle('');
    setMeetAgenda('');
    setActionMessage('Client review meeting successfully scheduled and logged.');
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    communicationService.createActionItem(
      {
        title: taskTitle,
        description: taskDesc,
        assignedTo: currentUser.name,
        assignedRole: currentUser.title || currentUser.role,
        dueDate: taskDueDate,
        priority: taskPriority,
        relatedEntity: currentHousehold.name,
      },
      currentUser
    );

    setIsTaskModalOpen(false);
    setTaskTitle('');
    setTaskDesc('');
    setActionMessage('Client service action item assigned and recorded.');
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleSubmitRebalance = (proposalId: string) => {
    const res = portfolioService.submitRebalanceForApproval(proposalId, currentUser);
    if (res.success) {
      setActionMessage(res.message);
      if (onRequestApproval) onRequestApproval('rebalance');
    } else {
      setActionMessage(res.message);
    }
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleExecuteRebalance = (proposalId: string) => {
    const res = portfolioService.executeRebalance(proposalId, currentUser);
    setActionMessage(res.message);
    setTimeout(() => setActionMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              Advisor Workstation & Client 360 Workbench
            </h1>
            <PrototypeBadge label="Fiduciary Advisory Portal" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Institutional wealth management book of business for {currentUser.name} ({currentUser.title})
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('households')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === 'households'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            Households ({accessibleHouseholds.length})
          </button>
          <button
            onClick={() => setActiveSubTab('client_360')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === 'client_360'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-indigo-600" />
            Client 360 View
          </button>
          <button
            onClick={() => setActiveSubTab('rebalance_workbench')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === 'rebalance_workbench'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
            Rebalance Workbench
          </button>
          <button
            onClick={() => setActiveSubTab('recommendations')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === 'recommendations'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Recommendations ({recommendations.length})
          </button>
          <button
            onClick={() => setActiveSubTab('tasks_meetings')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === 'tasks_meetings'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            Tasks & Meetings
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {actionMessage}
        </div>
      )}

      {/* Practice Level Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Advisor Team AUM</span>
          <div className="mt-2">
            <FinancialFigure value={totalAUM} size="2xl" asOf="Today 4:00 PM EST" freshness="live" />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Across {accessibleHouseholds.length} relationships</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Average Client Net Worth</span>
          <div className="mt-2">
            <FinancialFigure
              value={accessibleHouseholds.length > 0 ? totalAUM / accessibleHouseholds.length : 0}
              size="2xl"
              asOf="Book of record"
              freshness="live"
            />
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-2">Tier 1 Private Wealth Focus</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Rebalance Drift Alerts</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600 font-mono">
              {proposals.filter((p) => p.status !== 'Executed').length} Active
            </span>
            <span className="text-xs text-slate-400">&gt; 5% Model Drift</span>
          </div>
          <p className="text-[11px] text-amber-700 font-semibold mt-2">Vance Family Equity overweight</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Active Recommendations</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-700 font-mono">
              {recommendations.filter((r) => r.status === 'Active').length}
            </span>
            <span className="text-xs text-slate-400">across clients</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Tax, Allocation & RMD items</p>
        </div>
      </div>

      {/* SUB-TAB 1: HOUSEHOLDS ROSTER */}
      {activeSubTab === 'households' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Assigned Client Households & Relationship Tiers
              </h3>
              <p className="text-xs text-slate-500">Book of business hierarchy and service levels</p>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search households..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Household Name</th>
                  <th className="py-3 px-4">Relationship Tier</th>
                  <th className="py-3 px-4">Lead Advisor</th>
                  <th className="py-3 px-4">Investment Objective</th>
                  <th className="py-3 px-4">Last Review</th>
                  <th className="py-3 px-4 text-right">Total Net Worth</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredHouseholds.map((hh) => (
                  <tr key={hh.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {hh.name}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {hh.clientIds.length} Linked Family Members
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {hh.tier || 'Private Client'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {hh.primaryAdvisor || 'Sarah Jenkins, CFP'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{hh.investmentObjective}</td>
                    <td className="py-3 px-4 text-slate-500">{hh.lastReviewDate || 'Nov 14, 2024'}</td>
                    <td className="py-3 px-4 text-right">
                      <FinancialFigure value={hh.totalNetWorth} size="xs" asOf="Live Feed" freshness="live" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenClient360(hh.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-1 mx-auto"
                        title="Open Client 360 View"
                      >
                        Client 360
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CLIENT 360 VIEW (Requirement #2) */}
      {activeSubTab === 'client_360' && currentHousehold && (
        <div className="space-y-6">
          {/* Household Context Selector & Quick Actions */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                {currentHousehold.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{currentHousehold.name} 360 View</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {currentHousehold.tier}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Lead Advisor: {currentHousehold.primaryAdvisor} • Objective: {currentHousehold.investmentObjective}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedHouseholdId}
                onChange={(e) => setSelectedHouseholdId(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium"
              >
                {accessibleHouseholds.map((h) => (
                  <option key={h.id} value={h.id}>
                    Switch: {h.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setIsRecModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Recommendation
              </button>
              <button
                onClick={() => setIsMeetingModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Schedule Review
              </button>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1"
              >
                <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
                Add Task
              </button>
            </div>
          </div>

          {/* Client Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Family Members Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                Family Members ({householdClients.length})
              </h4>
              <div className="space-y-2">
                {householdClients.map((c) => {
                  const birthYear = c.dateOfBirth ? new Date(c.dateOfBirth).getFullYear() : 1972;
                  const estimatedAge = new Date().getFullYear() - birthYear;
                  return (
                    <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{c.firstName} {c.lastName}</span>
                        <span className="text-[10px] font-normal text-slate-500">{c.roleInHousehold}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{c.email} • Age {estimatedAge}</p>
                      <p className="text-[10px] text-slate-400">
                        SSN: {c.ssnMasked || '•••-••-8491'} • Bracket: 37% Federal
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Accounts & Holdings Summary */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-indigo-600" />
                Custodial Accounts ({householdAccounts.length})
              </h4>
              <div className="space-y-2">
                {householdAccounts.map((a) => (
                  <div key={a.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-900">{a.name}</span>
                        <span className="block text-[10px] text-slate-400 font-mono">{a.custodian}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        ${a.balance.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                      <span>{a.type}</span>
                      <span className="font-semibold text-emerald-600">Fresh Feed</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Recommendations for this household */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Active Recommendations ({householdRecs.length})
                </h4>
              </div>

              <div className="space-y-2">
                {householdRecs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No recommendations yet.</p>
                ) : (
                  householdRecs.map((r) => (
                    <div key={r.id} className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs space-y-1">
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-slate-900">{r.title}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-100 text-indigo-800">
                          {r.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-700 font-semibold">{r.impact}</p>
                      <p className="text-[10px] text-slate-600">{r.rationale}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Tax Opportunities and Action Items for this household */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Tax Opportunities */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Tax Opportunities for {currentHousehold.name} ({householdTaxOpps.length})
              </h4>
              <div className="space-y-2">
                {householdTaxOpps.map((opp) => (
                  <div key={opp.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{opp.holdingSymbol} ({opp.holdingName})</span>
                      <span className="font-mono font-bold text-rose-600">
                        -${Math.abs(opp.unrealizedLoss).toLocaleString()} Loss
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-600">
                      <span>Replace: {opp.replacementCandidate}</span>
                      <span className="font-semibold text-emerald-600">
                        +${opp.estimatedTaxSavings.toLocaleString()} Tax Benefit
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks and Action items */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-600" />
                Open Tasks & Reviews for {currentHousehold.name}
              </h4>
              <div className="space-y-2">
                {householdActionItems.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No tasks assigned for this household.</p>
                ) : (
                  householdActionItems.map((task) => (
                    <div key={task.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900">{task.title}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                          Due {task.dueDate}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{task.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: REBALANCE WORKBENCH (Requirement #3) */}
      {activeSubTab === 'rebalance_workbench' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Portfolio Rebalancing & Algorithmic Model Drift Workbench
                </h3>
                <p className="text-xs text-slate-500">
                  Asset allocation drift detection, tax drag estimation, and trade order batch generation
                </p>
              </div>
              <PrototypeBadge variant="calculation" label="Automated Optimization" />
            </div>

            {/* Asset Class Drift Detection Table */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Asset Class</th>
                    <th className="py-3 px-4 text-right">Strategic Target %</th>
                    <th className="py-3 px-4 text-right">Current Actual %</th>
                    <th className="py-3 px-4 text-right">Drift %</th>
                    <th className="py-3 px-4">Threshold Status</th>
                    <th className="py-3 px-4">Rebalance Directive</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">US Large Cap Equity</td>
                    <td className="py-3 px-4 text-right font-mono">50.0%</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">56.2%</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">+6.2%</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                        Breached (&gt; 5%)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-semibold">Trim $180,000 across SPY / AAPL</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">Core Fixed Income</td>
                    <td className="py-3 px-4 text-right font-mono">25.0%</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">19.8%</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-600">-5.2%</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        Underweight (&gt; 5%)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-semibold">Buy $180,000 into BND / VGIT</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">International Developed</td>
                    <td className="py-3 px-4 text-right font-mono">15.0%</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-800">14.6%</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500">-0.4%</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        Within Tolerance
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">Hold position</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">Cash & Equivalents</td>
                    <td className="py-3 px-4 text-right font-mono">10.0%</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-800">9.4%</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500">-0.6%</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        Within Tolerance
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">Sufficient operational buffer</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Active Rebalance Proposals with Trades */}
            {proposals.map((proposal) => (
              <div key={proposal.id} className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{proposal.modelName}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          proposal.status === 'Executed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : proposal.status === 'Submitted'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {proposal.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Target drift: {proposal.targetDriftPercent}% • Estimated Tax Impact: ${proposal.estimatedTaxImpact.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {proposal.status === 'Draft' && (
                      <button
                        onClick={() => handleSubmitRebalance(proposal.id)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Submit for Dual-Approval
                      </button>
                    )}
                    {proposal.status === 'Submitted' && (
                      <button
                        onClick={() => handleExecuteRebalance(proposal.id)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Execute Orders
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-slate-800">Fiduciary Rationale:</span>
                  <p className="text-slate-600 leading-relaxed text-[11px]">{proposal.fiduciaryRationale}</p>
                </div>

                {/* Proposed Trade Orders Table */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Proposed Trade Orders ({proposal.proposedTrades.length})
                  </h4>
                  <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-2.5 px-4">Action</th>
                          <th className="py-2.5 px-4">Symbol & Name</th>
                          <th className="py-2.5 px-4">Target Account</th>
                          <th className="py-2.5 px-4 text-right">Shares</th>
                          <th className="py-2.5 px-4 text-right">Est. Value</th>
                          <th className="py-2.5 px-4">Order Status</th>
                          <th className="py-2.5 px-4">Rationale</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {proposal.proposedTrades.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  t.action === 'BUY'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {t.action}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 font-bold text-slate-900">
                              {t.securitySymbol}
                              <span className="block text-[10px] text-slate-400 font-normal">{t.securityName}</span>
                            </td>
                            <td className="py-2.5 px-4 text-[11px] text-slate-600">{t.accountName}</td>
                            <td className="py-2.5 px-4 text-right font-mono font-medium">{t.quantity}</td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                              ${t.estimatedValue.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                {t.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-[11px] text-slate-500">{t.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: ADVISOR RECOMMENDATIONS */}
      {activeSubTab === 'recommendations' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Strategic Advisor Recommendations & Action Plans
              </h3>
              <p className="text-xs text-slate-500">
                Fiduciary advisory guidance across tax optimization, allocation, and retirement
              </p>
            </div>
            <button
              onClick={() => setIsRecModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              New Recommendation
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {rec.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">{rec.title}</h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      rec.priority === 'High'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {rec.priority}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Expected Impact:</span>
                    <span className="font-semibold text-emerald-600">{rec.impact}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Action Required:</span>
                    <span className="font-semibold text-slate-800">{rec.actionRequired || 'Review & Execute'}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">{rec.rationale}</p>

                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                  <span>Created {rec.createdAt}</span>
                  <span className="font-bold text-slate-700">Status: {rec.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: TASKS & MEETING PREP */}
      {activeSubTab === 'tasks_meetings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Meetings */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Scheduled Client Fiduciary Reviews ({meetings.length})
              </h3>
              <button
                onClick={() => setIsMeetingModalOpen(true)}
                className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Schedule
              </button>
            </div>
            <div className="space-y-2.5">
              {meetings.map((m) => (
                <div key={m.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{m.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      {m.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {m.date} at {m.time} • Hosted by {m.advisorName}
                  </p>
                  <div className="text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200">
                    <span className="font-semibold text-slate-800">Agenda:</span> {m.agenda}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Items */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-600" />
                Client Service Tasks & Action Items ({actionItems.length})
              </h3>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Task
              </button>
            </div>
            <div className="space-y-2.5">
              {actionItems.map((task) => (
                <div key={task.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => communicationService.toggleActionItem(task.id, currentUser)}
                        className="rounded border-slate-300 text-indigo-600"
                      />
                      <span
                        className={`text-xs font-bold ${
                          task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        task.priority === 'High'
                          ? 'bg-rose-100 text-rose-800'
                          : task.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-5">
                    Assigned: {task.assignedTo} • Due: {task.dueDate} • For {task.relatedEntity}
                  </p>
                  {task.description && (
                    <p className="text-xs text-slate-600 mt-1 pl-5">{task.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE RECOMMENDATION MODAL */}
      {isRecModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm">Create Strategic Advisor Recommendation</h4>
              <button onClick={() => setIsRecModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRecommendation} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Recommendation Title:</label>
                <input
                  type="text"
                  placeholder="e.g. Rebalance fixed income sleeve into municipal bonds"
                  value={recTitle}
                  onChange={(e) => setRecTitle(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Category:</label>
                <select
                  value={recCategory}
                  onChange={(e) => setRecCategory(e.target.value as any)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Tax Optimization">Tax Optimization</option>
                  <option value="Asset Allocation">Asset Allocation</option>
                  <option value="Retirement Income">Retirement Income</option>
                  <option value="Estate & Trust">Estate & Trust</option>
                  <option value="Risk Mitigation">Risk Mitigation</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Expected Financial Impact:</label>
                <input
                  type="text"
                  placeholder="e.g. +$18,400 after-tax yield improvement"
                  value={recImpact}
                  onChange={(e) => setRecImpact(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Fiduciary Rationale:</label>
                <textarea
                  rows={3}
                  placeholder="Explain why this recommendation serves the client's best interest..."
                  value={recRationale}
                  onChange={(e) => setRecRationale(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRecModalOpen(false)}
                  className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Save Recommendation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE MEETING MODAL */}
      {isMeetingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm">Schedule Client Review Meeting</h4>
              <button onClick={() => setIsMeetingModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleMeeting} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Meeting Title:</label>
                <input
                  type="text"
                  placeholder="e.g. Annual Estate & Tax Planning Review"
                  value={meetTitle}
                  onChange={(e) => setMeetTitle(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Date:</label>
                  <input
                    type="date"
                    value={meetDate}
                    onChange={(e) => setMeetDate(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Time:</label>
                  <input
                    type="text"
                    value={meetTime}
                    onChange={(e) => setMeetTime(e.target.value)}
                    placeholder="e.g. 2:00 PM EST"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Agenda & Meeting Notes:</label>
                <textarea
                  rows={3}
                  placeholder="Agenda items to review..."
                  value={meetAgenda}
                  onChange={(e) => setMeetAgenda(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMeetingModalOpen(false)}
                  className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Confirm Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm">Create Service Action Item</h4>
              <button onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Task Title:</label>
                <input
                  type="text"
                  placeholder="e.g. Upload signed trust amendment to document vault"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Due Date:</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Priority:</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Task Description:</label>
                <textarea
                  rows={2}
                  placeholder="Instructions or detail..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
