import React, { useState, useEffect } from 'react';
import {
  MOCK_ACCOUNTS,
  MOCK_DOCUMENTS,
  MOCK_GOALS,
  MOCK_HOLDINGS,
  MOCK_HOUSEHOLDS,
  CALCULATION_REGISTRY,
} from '../../../data/mockData';
import { AccessControlService } from '../../../services/accessControl';
import { auditService } from '../../../services/auditService';
import { PrototypeBadge } from '../../common/PrototypeBadge';
import { CalculationTransparencyModal } from '../../common/CalculationTransparencyModal';
import { UserProfile, VaultDocument } from '../../../types';
import { OverviewTab } from './OverviewTab';
import { HoldingsTab } from './HoldingsTab';
import { AllocationTab } from './AllocationTab';
import { PerformanceRiskTab } from './PerformanceRiskTab';
import { GoalsPlanningTab } from './GoalsPlanningTab';
import {
  Wallet,
  TrendingUp,
  PieChart,
  Activity,
  Target,
  FileText,
  Upload,
  Search,
  Lock,
  Download,
  Building2,
  Users,
  ShieldCheck,
  CheckCircle2,
  X,
  Plus,
} from 'lucide-react';

interface IndividualWealthModuleProps {
  currentUser: UserProfile;
  onOpenApprovalModal?: () => void;
}

export const IndividualWealthModule: React.FC<IndividualWealthModuleProps> = ({
  currentUser,
  onOpenApprovalModal,
}) => {
  // Navigation tabs
  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'holdings' | 'allocation' | 'performance' | 'goals' | 'vault'
  >('overview');

  // Accessible households for this user
  const accessibleHouseholds = AccessControlService.getAccessibleHouseholds(currentUser, MOCK_HOUSEHOLDS);

  // Active household selection (for advisors who can manage multiple assigned households)
  const defaultHouseholdId =
    currentUser.householdId || (accessibleHouseholds.length > 0 ? accessibleHouseholds[0].id : 'hh_vance');
  const [activeHouseholdId, setActiveHouseholdId] = useState<string>(defaultHouseholdId);

  // Synchronize active household when user changes
  useEffect(() => {
    if (currentUser.householdId) {
      setActiveHouseholdId(currentUser.householdId);
    } else {
      const allowed = AccessControlService.getAccessibleHouseholds(currentUser, MOCK_HOUSEHOLDS);
      if (allowed.length > 0 && !allowed.some((h) => h.id === activeHouseholdId)) {
        setActiveHouseholdId(allowed[0].id);
      }
    }
  }, [currentUser]);

  // Current active household object
  const activeHousehold =
    accessibleHouseholds.find((h) => h.id === activeHouseholdId) ||
    MOCK_HOUSEHOLDS.find((h) => h.id === activeHouseholdId) ||
    accessibleHouseholds[0] ||
    MOCK_HOUSEHOLDS[0];

  // Calculation Transparency Modal State
  const [activeCalculationId, setActiveCalculationId] = useState<string | null>(null);

  // Trajectory timeframe
  const [selectedPeriod, setSelectedPeriod] = useState<'1M' | '3M' | 'YTD' | '1Y' | '3Y' | 'ALL'>('YTD');

  // Vault state
  const [vaultCategoryFilter, setVaultCategoryFilter] = useState('ALL');
  const [vaultSearch, setVaultSearch] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<'Tax' | 'Estate' | 'Investment' | 'Legal'>('Tax');
  const [newDocTags, setNewDocTags] = useState('');
  const [localDocuments, setLocalDocuments] = useState<VaultDocument[]>(MOCK_DOCUMENTS);

  // Beneficiary check
  const isBeneficiary = currentUser.role === 'beneficiary';

  // Enforce Role & Relationship Access with activeHouseholdId isolation
  const authorizedAccounts = AccessControlService.getAuthorizedAccounts(
    currentUser,
    MOCK_ACCOUNTS,
    currentUser.category === 'internal' ? activeHouseholdId : undefined
  );

  const authorizedHoldings = AccessControlService.getAuthorizedHoldings(
    currentUser,
    MOCK_HOLDINGS,
    MOCK_ACCOUNTS,
    currentUser.category === 'internal' ? activeHouseholdId : undefined
  );

  const authorizedGoals = AccessControlService.getAuthorizedGoals(
    currentUser,
    MOCK_GOALS,
    currentUser.category === 'internal' ? activeHouseholdId : undefined
  );

  const authorizedDocuments = AccessControlService.getAuthorizedDocuments(
    currentUser,
    localDocuments,
    currentUser.category === 'internal' ? activeHouseholdId : undefined
  );

  // Calculate aggregated totals based ONLY on authorized accounts
  const totalAssets = authorizedAccounts
    .filter((a) => a.balance > 0)
    .reduce((sum, a) => sum + a.balance, 0);

  const totalLiabilities = Math.abs(
    authorizedAccounts
      .filter((a) => a.balance < 0)
      .reduce((sum, a) => sum + a.balance, 0)
  );

  const netWorth = totalAssets - totalLiabilities;

  // Net worth historical trend points
  const netWorthTrend = [
    { month: 'Sep 25', value: Math.round(netWorth * 0.94) },
    { month: 'Nov 25', value: Math.round(netWorth * 0.96) },
    { month: 'Jan 26', value: Math.round(netWorth * 0.975) },
    { month: 'Mar 26', value: Math.round(netWorth * 0.965) },
    { month: 'May 26', value: Math.round(netWorth * 0.985) },
    { month: 'Jul 26', value: Math.round(netWorth * 0.992) },
    { month: 'Sep 26', value: netWorth },
  ];

  // Document upload handler
  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;

    const newDoc: VaultDocument = {
      id: `doc_user_${Date.now()}`,
      householdId: activeHousehold?.id || 'hh_vance',
      name: newDocName.trim().endsWith('.pdf') ? newDocName.trim() : `${newDocName.trim()}.pdf`,
      category: newDocCategory,
      size: '1.8 MB',
      uploadedAt: new Date().toISOString().split('T')[0],
      version: 'v1.0 Client Upload',
      sharedWith: [currentUser.name, 'Advisory Team'],
      reviewStatus: 'Pending Review',
      requiresSignature: false,
      tags: newDocTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    setLocalDocuments((prev) => [newDoc, ...prev]);

    // Record audit event
    auditService.logEvent({
      user: currentUser,
      action: 'DOCUMENT_UPLOAD',
      objectAffected: `VaultDocument: ${newDoc.name}`,
      previousValue: 'None',
      newValue: `Category: ${newDoc.category}, Size: ${newDoc.size}`,
      reason: 'User uploaded new legal or tax document to secure vault',
    });

    setIsUploadModalOpen(false);
    setNewDocName('');
    setNewDocTags('');
  };

  const filteredDocs = authorizedDocuments.filter((doc) => {
    const matchCat = vaultCategoryFilter === 'ALL' || doc.category === vaultCategoryFilter;
    const matchSearch =
      doc.name.toLowerCase().includes(vaultSearch.toLowerCase()) ||
      doc.tags.some((t) => t.toLowerCase().includes(vaultSearch.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Access Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">
              {isBeneficiary
                ? 'Vance Dynasty Trust Beneficiary Portal'
                : activeHousehold?.name || 'Private Client Household'}
            </h1>
            <PrototypeBadge label="Book-of-Record Synchronized" />
          </div>

          <p className="text-xs text-slate-500">
            {isBeneficiary ? (
              <span className="text-amber-700 font-medium">
                Restricted Fiduciary Slice: Only Authorized Generation-Skipping Trust Records
              </span>
            ) : currentUser.category === 'internal' ? (
              <span>
                Advisor Fiduciary Oversight • Assigned Household:{' '}
                <strong className="text-slate-800">{activeHousehold?.name}</strong> • Status: {activeHousehold?.status}
              </span>
            ) : (
              <span>
                Consolidated Wealth Dashboard & Strategic Financial Plan • {activeHousehold?.tier || 'Private Client'}
              </span>
            )}
          </p>
        </div>

        {/* Advisor Household Switcher & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Internal Advisor Household Switcher */}
          {currentUser.category === 'internal' && accessibleHouseholds.length > 1 && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg p-1 text-xs">
              <Users className="w-3.5 h-3.5 text-slate-500 ml-1" />
              <span className="text-slate-500 font-medium">Household:</span>
              <select
                value={activeHouseholdId}
                onChange={(e) => setActiveHouseholdId(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 pr-2 focus:outline-hidden"
              >
                {accessibleHouseholds.map((hh) => (
                  <option key={hh.id} value={hh.id}>
                    {hh.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() =>
              alert(
                `Simulating PDF Wealth Plan Export: Compiled 18-page fiduciary report with live market timestamp and compliance attestation.`
              )
            }
            className="px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 text-slate-700 transition-colors"
          >
            Export Summary PDF
          </button>

          {onOpenApprovalModal && (
            <button
              onClick={onOpenApprovalModal}
              className="px-3.5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors"
            >
              New Action Request
            </button>
          )}
        </div>
      </div>

      {/* Sub-tab Navigation Bar */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'overview'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          Dashboard & Net Worth
        </button>

        <button
          onClick={() => setActiveSubTab('holdings')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'holdings'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Holdings ({authorizedHoldings.length})
        </button>

        <button
          onClick={() => setActiveSubTab('allocation')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'allocation'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          Asset & Sector Allocation
        </button>

        <button
          onClick={() => setActiveSubTab('performance')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'performance'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Performance & Risk
        </button>

        <button
          onClick={() => setActiveSubTab('goals')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'goals'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          Goals & Scenarios ({authorizedGoals.length})
        </button>

        <button
          onClick={() => setActiveSubTab('vault')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'vault'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Document Vault ({authorizedDocuments.length})
        </button>
      </div>

      {/* Access Warning if Beneficiary Role */}
      {isBeneficiary && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
          <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Restricted Beneficiary Access Boundary Enforced:</span>
            <p className="mt-0.5 text-amber-800">
              Pursuant to Delaware Trust Code § 3303 and fiduciary privacy guidelines, this session is strictly scoped to the Vance Dynasty Irrevocable Trust and its designated educational distribution allocations. Parental brokerage accounts, retirement accounts, private banking, and credit balances are masked.
            </p>
          </div>
        </div>
      )}

      {/* TAB 1: OVERVIEW & NET WORTH */}
      {activeSubTab === 'overview' && (
        <OverviewTab
          accounts={authorizedAccounts}
          totalAssets={totalAssets}
          totalLiabilities={totalLiabilities}
          netWorth={netWorth}
          netWorthTrend={netWorthTrend}
          selectedPeriod={selectedPeriod}
          onSelectPeriod={setSelectedPeriod}
          onOpenApprovalModal={onOpenApprovalModal}
        />
      )}

      {/* TAB 2: HOLDINGS & ATTRIBUTION */}
      {activeSubTab === 'holdings' && (
        <HoldingsTab
          holdings={authorizedHoldings}
          accounts={authorizedAccounts}
          onOpenCalculationModal={(calcId) => setActiveCalculationId(calcId)}
          onOpenApprovalModal={onOpenApprovalModal}
        />
      )}

      {/* TAB 3: ALLOCATION & CONCENTRATION */}
      {activeSubTab === 'allocation' && (
        <AllocationTab
          holdings={authorizedHoldings}
          totalAssets={totalAssets}
          onOpenCalculationModal={(calcId) => setActiveCalculationId(calcId)}
          onOpenApprovalModal={onOpenApprovalModal}
        />
      )}

      {/* TAB 4: PERFORMANCE & RISK */}
      {activeSubTab === 'performance' && (
        <PerformanceRiskTab
          onOpenCalculationModal={(calcId) => setActiveCalculationId(calcId)}
        />
      )}

      {/* TAB 5: GOALS & SCENARIOS */}
      {activeSubTab === 'goals' && (
        <GoalsPlanningTab
          goals={authorizedGoals}
          accounts={authorizedAccounts}
          onOpenCalculationModal={(calcId) => setActiveCalculationId(calcId)}
          onOpenApprovalModal={onOpenApprovalModal}
        />
      )}

      {/* TAB 6: DOCUMENT VAULT */}
      {activeSubTab === 'vault' && (
        <div className="space-y-6">
          {/* Top Actions & Filters */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Secure Client Document Vault</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  AES-256 Encrypted
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Central repository for audited tax returns, wills, trust agreements, and quarterly reviews
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload New Document
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search documents by name or tag..."
                value={vaultSearch}
                onChange={(e) => setVaultSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-slate-900"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {['ALL', 'Tax', 'Estate', 'Investment', 'Legal'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setVaultCategoryFilter(cat)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    vaultCategoryFilter === cat
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
                No documents match the current filter criteria.
              </div>
            ) : (
              filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {doc.category}
                      </span>
                      <span className="text-[11px] text-slate-400">{doc.size}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm mb-1 leading-snug break-words">
                      {doc.name}
                    </h4>

                    <div className="text-xs text-slate-500 space-y-1 mt-2">
                      <p>Uploaded: <span className="text-slate-700 font-medium">{doc.uploadedAt}</span></p>
                      <p>Version: <span className="text-slate-700 font-medium">{doc.version}</span></p>
                      <p>
                        Status:{' '}
                        <span
                          className={`font-semibold ${
                            doc.reviewStatus === 'Approved' ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {doc.reviewStatus}
                        </span>
                      </p>
                    </div>

                    {/* Tags */}
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {doc.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Shared with {doc.sharedWith.length} parties
                    </span>
                    <button
                      onClick={() =>
                        alert(`Opening verified PDF viewer for "${doc.name}" with legal timestamp watermark.`)
                      }
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> View / Download
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Upload Document to Secure Vault</h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadDocument} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Document File Name:</label>
                <input
                  type="text"
                  placeholder="e.g. 2026_Q3_Tax_Planning_Memorandum.pdf"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Category:</label>
                <select
                  value={newDocCategory}
                  onChange={(e) => setNewDocCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Tax">Tax Document (1099, K-1, Return)</option>
                  <option value="Estate">Estate & Trust (Will, Trust Agreement)</option>
                  <option value="Investment">Investment & Performance Review</option>
                  <option value="Legal">Legal & Operating Agreement</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tags (Comma-separated):</label>
                <input
                  type="text"
                  placeholder="e.g. Tax Year 2026, Fiduciary, Signed"
                  value={newDocTags}
                  onChange={(e) => setNewDocTags(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500">
                Uploaded files are logged into the immutable audit trail with an SHA-256 hash and notification sent to your lead advisor.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
                >
                  Confirm Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Calculation Transparency Modal */}
      {activeCalculationId && (
        <CalculationTransparencyModal
          calculation={CALCULATION_REGISTRY[activeCalculationId] || null}
          onClose={() => setActiveCalculationId(null)}
        />
      )}
    </div>
  );
};
