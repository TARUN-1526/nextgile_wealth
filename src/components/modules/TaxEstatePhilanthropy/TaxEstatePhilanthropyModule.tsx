import React, { useState, useEffect } from 'react';
import {
  TaxOpportunity,
  WashSaleRecord,
  RmdRecord,
  EstatePlan,
  DAFPhilanthropy,
  UserProfile,
  CalculationDetails,
} from '../../../types';
import { taxService } from '../../../services/taxService';
import { CALCULATION_REGISTRY } from '../../../data/mockData';
import { FinancialFigure } from '../../common/FinancialFigure';
import { PrototypeBadge } from '../../common/PrototypeBadge';
import { CalculationTransparencyModal } from '../../common/CalculationTransparencyModal';
import {
  Coins,
  ShieldCheck,
  HeartHandshake,
  AlertTriangle,
  ArrowRight,
  Send,
  Calendar,
  Layers,
  Sparkles,
  FileCheck,
  Gift,
  HelpCircle,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  CheckSquare,
  Square,
  ShieldAlert,
  Search,
  Plus,
  RefreshCw,
} from 'lucide-react';

interface TaxEstatePhilanthropyModuleProps {
  currentUser: UserProfile;
  onRequestApproval?: (type: 'tlh' | 'distribution') => void;
  selectedHouseholdId?: string;
}

export const TaxEstatePhilanthropyModule: React.FC<TaxEstatePhilanthropyModuleProps> = ({
  currentUser,
  onRequestApproval,
  selectedHouseholdId,
}) => {
  const [activeTab, setActiveTab] = useState<
    'opportunities' | 'harvest_workflow' | 'wash_sale' | 'rmd' | 'estate' | 'philanthropy' | 'batch_review'
  >('opportunities');

  // Reactive state from taxService
  const [opportunities, setOpportunities] = useState<TaxOpportunity[]>(
    taxService.getTaxOpportunities(selectedHouseholdId)
  );
  const [washSaleRecords, setWashSaleRecords] = useState<WashSaleRecord[]>(
    taxService.getWashSaleRecords(selectedHouseholdId)
  );
  const [rmdRecords, setRmdRecords] = useState<RmdRecord[]>(
    taxService.getRmdRecords(selectedHouseholdId)
  );
  const [estatePlan, setEstatePlan] = useState<EstatePlan>(
    taxService.getEstatePlan(selectedHouseholdId)
  );
  const [daf, setDaf] = useState<DAFPhilanthropy>(
    taxService.getDafPhilanthropy(selectedHouseholdId)
  );

  // Subscribe to service updates
  useEffect(() => {
    return taxService.subscribe(() => {
      setOpportunities(taxService.getTaxOpportunities(selectedHouseholdId));
      setWashSaleRecords(taxService.getWashSaleRecords(selectedHouseholdId));
      setRmdRecords(taxService.getRmdRecords(selectedHouseholdId));
      setEstatePlan(taxService.getEstatePlan(selectedHouseholdId));
      setDaf(taxService.getDafPhilanthropy(selectedHouseholdId));
    });
  }, [selectedHouseholdId]);

  // Selected calculation for transparency modal
  const [selectedCalculation, setSelectedCalculation] = useState<CalculationDetails | null>(null);

  // TLH Workflow state
  const [selectedOppForHarvest, setSelectedOppForHarvest] = useState<TaxOpportunity | null>(
    opportunities[0] || null
  );
  const [harvestStep, setHarvestStep] = useState<number>(1);
  const [harvestFeedback, setHarvestFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    approvalId?: string;
  }>({ type: null, message: '' });

  // Wash sale test tool state
  const [testSymbol, setTestSymbol] = useState('BND');
  const [testResult, setTestResult] = useState<{
    hasConflict: boolean;
    record?: WashSaleRecord;
    warning?: string;
  } | null>(null);

  // RMD Distribution modal state
  const [selectedRmdForDistribution, setSelectedRmdForDistribution] = useState<RmdRecord | null>(null);
  const [rmdDistributionAmount, setRmdDistributionAmount] = useState<number>(0);
  const [rmdFeedback, setRmdFeedback] = useState<string | null>(null);

  // DAF Grant recommendation modal state
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [grantCharityName, setGrantCharityName] = useState('');
  const [grantEin, setGrantEin] = useState('');
  const [grantAmount, setGrantAmount] = useState(25000);
  const [grantPurpose, setGrantPurpose] = useState('');
  const [grantFeedback, setGrantFeedback] = useState<string | null>(null);

  // Batch harvesting state
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);
  const [batchResults, setBatchResults] = useState<{
    successful: string[];
    failed: { id: string; symbol: string; reason: string }[];
  } | null>(null);

  // Roth Conversion Calculator state
  const [rothConvertAmount, setRothConvertAmount] = useState(93900);
  const [currentTaxBracket, setCurrentTaxBracket] = useState(24);
  const estimatedRothTaxCost = (rothConvertAmount * currentTaxBracket) / 100;
  const projectedTaxFreeCompounding20Yr = rothConvertAmount * Math.pow(1 + 0.07, 20);

  // Handlers
  const handleInspectCalculation = (calcId?: string) => {
    if (!calcId) return;
    const calc = CALCULATION_REGISTRY[calcId];
    if (calc) {
      setSelectedCalculation(calc);
    }
  };

  const handleStartHarvestWorkflow = (opp: TaxOpportunity) => {
    setSelectedOppForHarvest(opp);
    setHarvestStep(1);
    setHarvestFeedback({ type: null, message: '' });
    setActiveTab('harvest_workflow');
  };

  const handleExecuteHarvestSubmit = () => {
    if (!selectedOppForHarvest) return;
    const res = taxService.createHarvestRequest({
      opportunityId: selectedOppForHarvest.id,
      user: currentUser,
      reason: `Tax-loss harvesting: Sell ${selectedOppForHarvest.holdingSymbol} to harvest $${Math.abs(
        selectedOppForHarvest.unrealizedLoss
      ).toLocaleString()} capital loss and substitute with ${selectedOppForHarvest.replacementCandidate}.`,
    });

    if (res.success) {
      setHarvestFeedback({
        type: 'success',
        message: res.message,
        approvalId: res.approvalId,
      });
      setHarvestStep(4);
    } else {
      setHarvestFeedback({
        type: 'error',
        message: res.message,
      });
    }
  };

  const handleTestWashSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testSymbol.trim()) return;
    const res = taxService.checkWashSaleConflict(testSymbol.trim());
    setTestResult(res);
  };

  const handleProcessRmd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRmdForDistribution || rmdDistributionAmount <= 0) return;
    const res = taxService.executeRmdDistribution(
      selectedRmdForDistribution.id,
      rmdDistributionAmount,
      currentUser
    );
    if (res.success) {
      setRmdFeedback(res.message);
      setTimeout(() => {
        setSelectedRmdForDistribution(null);
        setRmdFeedback(null);
      }, 1500);
    }
  };

  const handleSubmitGrant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantCharityName.trim() || grantAmount <= 0) return;
    const res = taxService.submitDafGrant(
      selectedHouseholdId || 'hh_vance',
      {
        charityName: grantCharityName,
        ein: grantEin || '501(c)(3) Verified',
        amount: grantAmount,
        purpose: grantPurpose || 'General charitable endowment support',
      },
      currentUser
    );
    if (res.success) {
      setGrantFeedback(res.message);
      setTimeout(() => {
        setIsGrantModalOpen(false);
        setGrantFeedback(null);
        setGrantCharityName('');
        setGrantPurpose('');
      }, 1200);
    } else {
      setGrantFeedback(res.message);
    }
  };

  const toggleBatchSelect = (id: string) => {
    setSelectedBatchIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExecuteBatch = () => {
    if (selectedBatchIds.length === 0) return;
    const results = taxService.executeBatchHarvest(selectedBatchIds, currentUser);
    setBatchResults(results);
  };

  // Calculations for summary cards
  const totalHarvestableLosses = opportunities.reduce(
    (sum, o) => sum + (o.status !== 'Executed' ? o.unrealizedLoss : 0),
    0
  );
  const totalEstimatedSavings = opportunities.reduce(
    (sum, o) => sum + (o.status !== 'Executed' ? o.estimatedTaxSavings : 0),
    0
  );
  const totalRemainingRmd = rmdRecords.reduce((sum, r) => sum + r.remainingAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              Tax, Estate & Philanthropy Optimization
            </h1>
            <PrototypeBadge variant="logic" label="Fiduciary Tax & Legal Engine" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Fiduciary tax-loss harvesting, wash-sale controls, mandatory RMDs, estate architecture, and DAF grants
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'opportunities'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-indigo-600" />
            Tax Opportunities ({opportunities.length})
          </button>
          <button
            onClick={() => setActiveTab('harvest_workflow')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'harvest_workflow'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-indigo-600" />
            TLH Workflow
          </button>
          <button
            onClick={() => setActiveTab('wash_sale')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'wash_sale'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            Wash-Sale Monitor ({washSaleRecords.filter((w) => w.status === 'Active').length})
          </button>
          <button
            onClick={() => setActiveTab('rmd')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'rmd'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            RMD Tracker
          </button>
          <button
            onClick={() => setActiveTab('estate')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'estate'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            Estate & Trusts
          </button>
          <button
            onClick={() => setActiveTab('philanthropy')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'philanthropy'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 text-indigo-600" />
            Giving & DAF
          </button>
          <button
            onClick={() => setActiveTab('batch_review')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'batch_review'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            Bulk Review
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Harvestable Capital Losses
          </span>
          <div className="mt-2">
            <FinancialFigure
              value={totalHarvestableLosses}
              size="2xl"
              asOf="Today 4:00 PM EST"
              freshness="live"
              showGainLossColor={true}
              isCalculated={true}
              calculationId="calc_unrealized_gain_loss"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Across {opportunities.filter((o) => o.status !== 'Executed').length} identified opportunities
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Estimated Tax Savings
          </span>
          <div className="mt-2">
            <FinancialFigure
              value={totalEstimatedSavings}
              size="2xl"
              asOf="Today 4:00 PM EST"
              freshness="live"
              isCalculated={true}
              calculationId="calc_tlh_bnd"
            />
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-2">
            At 37.0% Federal + 3.8% NIIT marginal bracket
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Wash-Sale Windows
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600 font-mono">
              {washSaleRecords.filter((w) => w.status === 'Active').length} Active
            </span>
            <span className="text-xs text-slate-400">of {washSaleRecords.length} monitored</span>
          </div>
          <p className="text-[11px] text-amber-700 font-semibold mt-2">
            IRC § 1091 Compliance Protected
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            2026 Remaining RMD
          </span>
          <div className="mt-2">
            <FinancialFigure
              value={totalRemainingRmd}
              size="2xl"
              asOf="IRS Table III Factor 26.0"
              freshness="today_932am"
              isCalculated={true}
              calculationId="calc_rmd_pendelton"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {rmdRecords.filter((r) => r.remainingAmount > 0).length} client account requiring distribution
          </p>
        </div>
      </div>

      {/* SUB-TAB 1: TAX OPPORTUNITIES TABLE */}
      {activeTab === 'opportunities' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Identified Tax Opportunities & Loss Harvesting Targets
                </h3>
                <p className="text-xs text-slate-500">
                  Comprehensive listing of unrealized losses, estimated savings, and wash-sale replacement candidates
                </p>
              </div>
              <button
                onClick={() => setActiveTab('batch_review')}
                className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-1.5 self-start"
              >
                <Layers className="w-3.5 h-3.5" />
                Launch Bulk Review
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Opportunity Type</th>
                    <th className="py-3 px-4">Holding & Account</th>
                    <th className="py-3 px-4 text-right">Current Value</th>
                    <th className="py-3 px-4 text-right">Unrealized Loss</th>
                    <th className="py-3 px-4">Replacement Candidate</th>
                    <th className="py-3 px-4 text-right">Est. Tax Savings</th>
                    <th className="py-3 px-4">Status & Priority</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {opportunities.map((opp) => (
                    <tr key={opp.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {opp.opportunityType || 'Tax-Loss Harvesting'}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5 font-normal">
                          Created {opp.createdDate || 'Sept 2026'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900">{opp.holdingSymbol}</span>
                        <span className="block text-[11px] text-slate-500">{opp.holdingName}</span>
                        <span className="block text-[10px] text-slate-400 font-mono">{opp.accountId}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-800">
                        ${opp.currentValue.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                        -${Math.abs(opp.unrealizedLoss).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900">{opp.replacementCandidate}</span>
                        <span className="block text-[11px] text-slate-500 truncate max-w-[140px]">
                          {opp.replacementCandidateName}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-mono font-bold text-emerald-600">
                          +${opp.estimatedTaxSavings.toLocaleString()}
                        </span>
                        {opp.calculationId && (
                          <button
                            onClick={() => handleInspectCalculation(opp.calculationId)}
                            className="block ml-auto text-[10px] text-indigo-600 hover:underline cursor-pointer"
                            title="Inspect Calculation Disclosure"
                          >
                            Disclosures
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            opp.status === 'Executed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : opp.status === 'Proposed'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {opp.status}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          {opp.priority || 'Medium'} Priority
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleStartHarvestWorkflow(opp)}
                          disabled={opp.status === 'Executed'}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1 mx-auto ${
                            opp.status === 'Executed'
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          }`}
                        >
                          <Send className="w-3 h-3" />
                          Harvest
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Roth Conversion Optimization Simulator */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-100 text-purple-800 rounded-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Interactive Roth Conversion Bracket Filler Simulator
                  </h3>
                  <p className="text-xs text-slate-500">
                    Model pre-tax IRA conversions against current vs future expected sunset tax brackets
                  </p>
                </div>
              </div>
              <FinancialFigure
                value={rothConvertAmount}
                size="md"
                isScenario={true}
                scenarioLabel="Conversion What-If"
                isCalculated={true}
                calculationId="calc_roth_conversion"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Proposed Conversion Amount</span>
                    <span className="font-mono text-indigo-700">${rothConvertAmount.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max="250000"
                    step="5000"
                    value={rothConvertAmount}
                    onChange={(e) => setRothConvertAmount(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>$10,000 (Conservative)</span>
                    <span>$93,900 (Fill 24% Bracket)</span>
                    <span>$250,000 (Max)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Assumed Effective Marginal Tax Rate</span>
                    <span className="font-mono text-indigo-700">{currentTaxBracket}%</span>
                  </div>
                  <select
                    value={currentTaxBracket}
                    onChange={(e) => setCurrentTaxBracket(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                  >
                    <option value={22}>22% Marginal Bracket ($94k - $201k MFJ)</option>
                    <option value={24}>24% Marginal Bracket ($201k - $383k MFJ - Target Sweet Spot)</option>
                    <option value={32}>32% Marginal Bracket ($383k - $487k MFJ)</option>
                    <option value={35}>35% Marginal Bracket ($487k - $731k MFJ)</option>
                    <option value={37}>37% Marginal Bracket (&gt; $731k MFJ)</option>
                  </select>
                </div>
              </div>

              {/* Simulation Result Outputs */}
              <div className="space-y-3 bg-white p-4 rounded-lg border border-slate-200 text-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Scenario Projected Outcomes
                </span>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Immediate Tax Cost Today:</span>
                  <span className="font-mono font-bold text-rose-600">
                    ${estimatedRothTaxCost.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">20-Year Tax-Free Growth (7% Ann.):</span>
                  <span className="font-mono font-bold text-emerald-600">
                    ${Math.round(projectedTaxFreeCompounding20Yr).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Avoided Future RMD Burden:</span>
                  <span className="font-mono font-bold text-indigo-700">100% Tax-Free</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 leading-normal">
                  *Prototype calculation assumes taxes paid from outside taxable cash reserves to avoid early distribution penalties.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: TLH WORKFLOW (Multi-step) */}
      {activeTab === 'harvest_workflow' && selectedOppForHarvest && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Tax-Loss Harvesting Execution & Dual-Authorization Workflow
              </h3>
              <p className="text-xs text-slate-500">
                IRS § 1091 Wash-Sale pre-clearance, substitution matching, and fiduciary audit generation
              </p>
            </div>
            <PrototypeBadge variant="logic" label="Dual-Control Workflow" />
          </div>

          {/* Workflow Stepper */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div
              className={`p-2.5 rounded-xl border ${
                harvestStep === 1
                  ? 'bg-indigo-50 border-indigo-400 font-bold text-indigo-900'
                  : harvestStep > 1
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              1. Review Position
            </div>
            <div
              className={`p-2.5 rounded-xl border ${
                harvestStep === 2
                  ? 'bg-indigo-50 border-indigo-400 font-bold text-indigo-900'
                  : harvestStep > 2
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              2. Tax Impact & Benefits
            </div>
            <div
              className={`p-2.5 rounded-xl border ${
                harvestStep === 3
                  ? 'bg-indigo-50 border-indigo-400 font-bold text-indigo-900'
                  : harvestStep > 3
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              3. Wash-Sale Audit
            </div>
            <div
              className={`p-2.5 rounded-xl border ${
                harvestStep === 4
                  ? 'bg-emerald-50 border-emerald-400 font-bold text-emerald-900'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              4. Fiduciary Submission
            </div>
          </div>

          {/* Step 1: Review Position */}
          {harvestStep === 1 && (
            <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">Target Position to Harvest</span>
                <span className="font-mono text-slate-500">Account: {selectedOppForHarvest.accountId}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">Security to Sell:</span>
                  <span className="font-bold text-slate-900 text-sm block mt-0.5">
                    {selectedOppForHarvest.holdingSymbol}
                  </span>
                  <span className="text-slate-500 text-[11px] block">{selectedOppForHarvest.holdingName}</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">Position Market Value:</span>
                  <span className="font-bold text-slate-900 font-mono text-sm block mt-0.5">
                    ${selectedOppForHarvest.currentValue.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">Realizable Capital Loss:</span>
                  <span className="font-bold text-rose-600 font-mono text-sm block mt-0.5">
                    -${Math.abs(selectedOppForHarvest.unrealizedLoss).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-lg text-indigo-900">
                <span className="font-bold">Proposed Replacement Security:</span>
                <p className="mt-0.5 text-indigo-800">
                  Buy <strong>{selectedOppForHarvest.replacementCandidate}</strong> ({selectedOppForHarvest.replacementCandidateName}) with proceeds of ${selectedOppForHarvest.currentValue.toLocaleString()} to maintain targeted asset class exposure without cash drag.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setHarvestStep(2)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  Proceed to Tax Impact
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Tax Impact */}
          {harvestStep === 2 && (
            <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-900 text-sm block">Tax Impact & Net Benefit Calculation</span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-2">
                  <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px] block">
                    Tax Offset Breakdown
                  </span>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Harvested Loss:</span>
                    <span className="font-mono text-rose-600 font-bold">
                      -${Math.abs(selectedOppForHarvest.unrealizedLoss).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Assumed Combined Tax Rate:</span>
                    <span className="font-mono text-slate-800 font-bold">40.8% (Fed 37% + NIIT 3.8%)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600 font-semibold">Estimated Net Tax Savings:</span>
                    <span className="font-mono text-emerald-600 font-bold text-sm">
                      +${selectedOppForHarvest.estimatedTaxSavings.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-2">
                  <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px] block">
                    Calculation Transparency
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {selectedOppForHarvest.taxImpact || 'Generates capital loss carryforward or current year offset against realized gains.'}
                  </p>
                  <button
                    onClick={() => handleInspectCalculation(selectedOppForHarvest.calculationId || 'calc_tlh_bnd')}
                    className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1 pt-2"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    Open Methodology & Assumptions Disclosure
                  </button>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setHarvestStep(1)}
                  className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg"
                >
                  Back
                </button>
                <button
                  onClick={() => setHarvestStep(3)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  Proceed to Wash-Sale Inspection
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Wash-Sale Inspection */}
          {harvestStep === 3 && (
            <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-900 text-sm block">
                IRC § 1091 Wash-Sale Rule Pre-Clearance
              </span>

              {/* Pre-flight check result */}
              {(() => {
                const check = taxService.checkWashSaleConflict(selectedOppForHarvest.holdingSymbol);
                if (check.hasConflict) {
                  return (
                    <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-2 text-amber-900">
                      <div className="flex items-center gap-2 font-bold text-amber-800">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Active Wash-Sale Window Detected</span>
                      </div>
                      <p className="text-amber-800 leading-relaxed">{check.warning}</p>
                      <p className="text-[11px] text-amber-700">
                        Fiduciary override: Fiduciary approval will explicitly log this transaction window in the SEC Rule 204-2 audit ledger and flag specific-lot accounting (Spec ID) for the custodian.
                      </p>
                    </div>
                  );
                }
                return (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-1.5 text-emerald-900">
                    <div className="flex items-center gap-2 font-bold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Wash-Sale Check Cleared</span>
                    </div>
                    <p className="text-emerald-800 text-[11px]">
                      No purchases of {selectedOppForHarvest.holdingSymbol} or substantially identical contracts detected across linked family or retirement accounts within the last 30 days.
                    </p>
                  </div>
                );
              })()}

              <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-2">
                <span className="font-semibold text-slate-800 block">Substantially Identical Substitution Audit</span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Selling <strong>{selectedOppForHarvest.holdingSymbol}</strong> and purchasing <strong>{selectedOppForHarvest.replacementCandidate}</strong> satisfies IRS Revenue Ruling 2008-5. The two instruments track distinct benchmark indexes, avoiding wash-sale disallowance while retaining credit & duration risk profiles.
                </p>
              </div>

              {harvestFeedback.type === 'error' && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2 font-semibold">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  {harvestFeedback.message}
                </div>
              )}

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setHarvestStep(2)}
                  className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg"
                >
                  Back
                </button>
                <button
                  onClick={handleExecuteHarvestSubmit}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  Submit TLH for Fiduciary Dual-Approval
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation & Audit Entry */}
          {harvestStep === 4 && (
            <div className="space-y-4 bg-emerald-50 p-6 rounded-xl border border-emerald-200 text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-emerald-900">
                Tax-Loss Harvest Successfully Submitted
              </h4>
              <p className="text-xs text-emerald-800 max-w-lg mx-auto">
                {harvestFeedback.message}
              </p>
              {harvestFeedback.approvalId && (
                <div className="p-3 bg-white rounded-lg border border-emerald-300 max-w-sm mx-auto text-xs font-mono text-slate-700">
                  Approval Request ID: <strong>{harvestFeedback.approvalId}</strong>
                </div>
              )}
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setActiveTab('opportunities');
                    setHarvestStep(1);
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs"
                >
                  Return to Tax Opportunities
                </button>
                {onRequestApproval && (
                  <button
                    onClick={() => onRequestApproval('tlh')}
                    className="px-4 py-2 bg-white border border-emerald-300 text-emerald-800 font-semibold rounded-lg text-xs hover:bg-emerald-100"
                  >
                    Open Fiduciary Approval Queue
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: WASH-SALE MONITOR & CONTROLS */}
      {activeTab === 'wash_sale' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  IRC § 1091 Wash-Sale Tracking & Cross-Account Collision Monitor
                </h3>
                <p className="text-xs text-slate-500">
                  Monitors 30-day lookback and lookforward windows across taxable, trust, and IRA sleeves
                </p>
              </div>
              <PrototypeBadge variant="logic" label="IRS § 1091 Engine" />
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Security</th>
                    <th className="py-3 px-4">Account Scope</th>
                    <th className="py-3 px-4">Triggering Transaction</th>
                    <th className="py-3 px-4">Window Start</th>
                    <th className="py-3 px-4">Window End</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Fiduciary Action & Guidance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {washSaleRecords.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {w.securitySymbol}
                        <span className="block text-[11px] text-slate-500 font-normal">{w.securityName}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{w.accountId}</td>
                      <td className="py-3 px-4 text-slate-700">{w.relatedTransaction}</td>
                      <td className="py-3 px-4 text-slate-500">{w.washSaleWindowStart}</td>
                      <td className="py-3 px-4 font-semibold text-amber-700">{w.washSaleWindowEnd}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            w.status === 'Active'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : w.status === 'Clearing Soon'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {w.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-600 max-w-xs">{w.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Wash-Sale Collision Testing Tool */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-600" />
              Pre-Trade Wash-Sale Collision Checker
            </h4>
            <p className="text-xs text-slate-500">
              Test planned ticker purchases or sales to confirm whether a 30-day window conflict exists
            </p>

            <form onSubmit={handleTestWashSale} className="flex gap-2 max-w-md">
              <input
                type="text"
                placeholder="Enter Ticker (e.g. BND, SPY, NVDA)..."
                value={testSymbol}
                onChange={(e) => setTestSymbol(e.target.value.toUpperCase())}
                className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-lg uppercase font-mono font-bold"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs"
              >
                Audit Window
              </button>
            </form>

            {testResult && (
              <div
                className={`p-4 rounded-xl border text-xs leading-relaxed ${
                  testResult.hasConflict
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                }`}
              >
                {testResult.hasConflict ? (
                  <div className="space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-amber-800">
                      <AlertTriangle className="w-4 h-4" />
                      Wash-Sale Conflict Flagged
                    </span>
                    <p>{testResult.warning}</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4" />
                      Clean: No Active Wash-Sale Conflict
                    </span>
                    <p>
                      Symbol <strong>{testSymbol}</strong> has no conflicting acquisitions in the past 30 days. Losses may be recognized under standard tax-lot rules.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: RMD TRACKING & EXECUTION */}
      {activeTab === 'rmd' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Required Minimum Distribution (RMD) Tracking & Fulfillment
                </h3>
                <p className="text-xs text-slate-500">
                  Mandatory annual IRS retirement account distributions under SECURE 2.0 Act
                </p>
              </div>
              <button
                onClick={() => handleInspectCalculation('calc_rmd_pendelton')}
                className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-1.5 self-start"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                RMD Calculation Disclosure
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Client & Age</th>
                    <th className="py-3 px-4">Custodial Account</th>
                    <th className="py-3 px-4 text-right">Dec 31 Prior Balance</th>
                    <th className="py-3 px-4 text-right">IRS Factor</th>
                    <th className="py-3 px-4 text-right">2026 Required RMD</th>
                    <th className="py-3 px-4 text-right">Distributed YTD</th>
                    <th className="py-3 px-4 text-right">Remaining Due</th>
                    <th className="py-3 px-4">Deadline</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rmdRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{r.clientName}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{r.accountName}</span>
                        <span className="block text-[10px] text-slate-400 font-mono">{r.accountId}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700">
                        ${r.priorYearEndBalance.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">{r.irsFactor}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ${r.requiredDistribution.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-600">
                        ${r.distributedAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-700">
                        ${r.remainingAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-medium">{r.deadline}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            r.status === 'Satisfied'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedRmdForDistribution(r);
                            setRmdDistributionAmount(r.remainingAmount);
                          }}
                          disabled={r.remainingAmount === 0}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg shadow-xs ${
                            r.remainingAmount === 0
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          }`}
                        >
                          Distribute / QCD
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RMD Distribution Execution Modal */}
          {selectedRmdForDistribution && (
            <div className="p-5 bg-white rounded-2xl border border-indigo-200 shadow-md space-y-4 max-w-xl mx-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-900 text-sm">
                  Execute RMD Custodial Distribution or QCD
                </h4>
                <button
                  onClick={() => setSelectedRmdForDistribution(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleProcessRmd} className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-500 block mb-1">Target Account:</span>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-semibold text-slate-800">
                    {selectedRmdForDistribution.accountName} ({selectedRmdForDistribution.clientName})
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block mb-1">Remaining Mandatory RMD:</span>
                  <span className="text-base font-bold font-mono text-amber-700">
                    ${selectedRmdForDistribution.remainingAmount.toLocaleString()}
                  </span>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    Distribution Amount ($):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedRmdForDistribution.remainingAmount}
                    value={rmdDistributionAmount}
                    onChange={(e) => setRmdDistributionAmount(Number(e.target.value))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Eligible for up to $105,000 Qualified Charitable Distribution (QCD) direct exclusion
                  </span>
                </div>

                {rmdFeedback && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {rmdFeedback}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRmdForDistribution(null)}
                    className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs"
                  >
                    Confirm Distribution
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 5: ESTATE PLANNING & TRUSTS */}
      {activeTab === 'estate' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Estate Architecture, Trusts & Beneficiary Partitioning
                </h3>
                <p className="text-xs text-slate-500">
                  Wills, powers of attorney, revocable living trusts, and generation-skipping dynasty trusts
                </p>
              </div>
              <PrototypeBadge variant="logic" label="Estate Counsel Verified" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500 block">Will & Testament</span>
                <span className="font-bold text-slate-800 block mt-0.5">{estatePlan.willStatus}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500 block">Power of Attorney (POA)</span>
                <span className="font-bold text-slate-800 block mt-0.5">{estatePlan.poaStatus}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500 block">Revocable Living Trust</span>
                <span className="font-bold text-slate-800 block mt-0.5 font-mono">
                  ${estatePlan.trustValue.toLocaleString()}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500 block">Remaining Lifetime Exemption</span>
                <span className="font-bold text-emerald-700 block mt-0.5 font-mono">
                  ${estatePlan.taxExemptionRemaining.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Beneficiaries Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Primary & Contingent Beneficiary Allocations
              </h4>
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Beneficiary Name</th>
                      <th className="py-2.5 px-4">Relationship</th>
                      <th className="py-2.5 px-4">Trust / Designation</th>
                      <th className="py-2.5 px-4 text-right">Share (%)</th>
                      <th className="py-2.5 px-4 text-center">Partition Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {estatePlan.beneficiaries.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-semibold text-slate-900">{b.name}</td>
                        <td className="py-2.5 px-4 text-slate-600">{b.relationship}</td>
                        <td className="py-2.5 px-4 text-slate-500">{b.trustDesignation}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-indigo-700">
                          {b.sharePercent}%
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Authorized Access
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
              <FileCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Fiduciary Trust Officer Note:</span>
                <p className="mt-0.5 text-blue-800 leading-relaxed">{estatePlan.fiduciaryNotes}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: PHILANTHROPY & DAF */}
      {activeTab === 'philanthropy' && (
        <div className="space-y-6">
          {/* DAF Balance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Donor-Advised Fund Balance
              </span>
              <div className="mt-2">
                <FinancialFigure
                  value={daf.currentBalance}
                  size="2xl"
                  asOf="Today 4:00 PM EST"
                  freshness="live"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">{daf.fundName}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                YTD Charitable Grants Paid
              </span>
              <div className="mt-2">
                <FinancialFigure
                  value={daf.ytdGrantsPaid}
                  size="2xl"
                  asOf="Calendar Year 2026"
                  freshness="live"
                />
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold mt-2">
                Across {daf.grants.length} verified 501(c)(3) entities
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Eligible Qualified Charitable Dist. (QCD)
              </span>
              <div className="mt-2">
                <FinancialFigure
                  value={daf.qcdEligibleAmount}
                  size="2xl"
                  asOf="IRS IRC § 408(d)(8)"
                  freshness="today_932am"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Direct IRA transfer exclusion limit for Age 70½+
              </p>
            </div>
          </div>

          {/* Grants Tracking Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Charitable Grant Recommendations & Impact Tracking
                </h3>
                <p className="text-xs text-slate-500">
                  Approved grants and direct foundation recommendations to qualified non-profit organizations
                </p>
              </div>
              <button
                onClick={() => setIsGrantModalOpen(true)}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Gift className="w-3.5 h-3.5" />
                Recommend New Grant
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Charity / Organization</th>
                    <th className="py-3 px-4">EIN</th>
                    <th className="py-3 px-4">Mission Purpose</th>
                    <th className="py-3 px-4">Grant Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {daf.grants.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-900">{g.charityName}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{g.ein}</td>
                      <td className="py-3 px-4 text-slate-600">{g.purpose}</td>
                      <td className="py-3 px-4 text-slate-500">{g.grantDate}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {g.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ${g.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* New Grant Modal */}
          {isGrantModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Gift className="w-4 h-4 text-indigo-600" />
                    Recommend New DAF Charitable Grant
                  </h4>
                  <button
                    onClick={() => setIsGrantModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmitGrant} className="space-y-3.5 text-xs">
                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">
                      Charity / Organization Name:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bay Area Cancer Research Alliance"
                      value={grantCharityName}
                      onChange={(e) => setGrantCharityName(e.target.value)}
                      required
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">
                      EIN (Tax ID):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 94-1234567"
                      value={grantEin}
                      onChange={(e) => setGrantEin(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">
                      Grant Amount ($):
                    </label>
                    <input
                      type="number"
                      min="1000"
                      max={daf.currentBalance}
                      value={grantAmount}
                      onChange={(e) => setGrantAmount(Number(e.target.value))}
                      required
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-mono font-bold"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Available DAF Balance: ${daf.currentBalance.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">
                      Mission / Grant Purpose:
                    </label>
                    <textarea
                      placeholder="e.g. Annual endowment grant for clinical trials"
                      value={grantPurpose}
                      onChange={(e) => setGrantPurpose(e.target.value)}
                      rows={3}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                    />
                  </div>

                  {grantFeedback && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-semibold">
                      {grantFeedback}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsGrantModalOpen(false)}
                      className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs"
                    >
                      Submit Recommendation
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 7: BATCH / BULK REVIEW (Requirement #4) */}
      {activeTab === 'batch_review' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Batch / Bulk Review & Tax Optimization Queue
              </h3>
              <p className="text-xs text-slate-500">
                Multi-select records, pre-flight eligibility validation, and bulk fiduciary dispatch
              </p>
            </div>
            <PrototypeBadge variant="logic" label="Batch Processing Engine" />
          </div>

          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        selectedBatchIds.length > 0 &&
                        selectedBatchIds.length === opportunities.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBatchIds(opportunities.map((o) => o.id));
                        } else {
                          setSelectedBatchIds([]);
                        }
                      }}
                      className="rounded border-slate-300 text-indigo-600"
                    />
                  </th>
                  <th className="py-3 px-4">Opportunity</th>
                  <th className="py-3 px-4">Account</th>
                  <th className="py-3 px-4 text-right">Harvestable Loss</th>
                  <th className="py-3 px-4 text-right">Est. Tax Savings</th>
                  <th className="py-3 px-4">Wash-Sale Status</th>
                  <th className="py-3 px-4">Current Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {opportunities.map((opp) => {
                  const isSelected = selectedBatchIds.includes(opp.id);
                  const washSale = taxService.checkWashSaleConflict(opp.holdingSymbol);
                  const isAlreadyProposed = opp.status === 'Proposed' || opp.status === 'Executed';

                  return (
                    <tr
                      key={opp.id}
                      onClick={() => toggleBatchSelect(opp.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-indigo-50/60' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-slate-300 text-indigo-600"
                        />
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {opp.holdingSymbol}
                        <span className="block text-[11px] text-slate-500 font-normal">
                          {opp.holdingName}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{opp.accountId}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                        -${Math.abs(opp.unrealizedLoss).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                        +${opp.estimatedTaxSavings.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        {washSale.hasConflict ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            Wash Sale Flag
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Clear
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isAlreadyProposed
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {opp.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Validation & Batch Action Bar */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-900">
                {selectedBatchIds.length} Opportunities Selected for Batch Processing
              </span>
              <p className="text-[11px] text-slate-500">
                Pre-flight duplicate detection and dual-control compliance validation
              </p>
            </div>

            <button
              onClick={handleExecuteBatch}
              disabled={selectedBatchIds.length === 0}
              className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 ${
                selectedBatchIds.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              Submit Selected Batch for Approval
            </button>
          </div>

          {/* Batch execution results */}
          {batchResults && (
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Batch Processing Execution Report
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1 text-emerald-900">
                  <span className="font-bold block">
                    ✓ Successfully Submitted ({batchResults.successful.length} records)
                  </span>
                  <p className="text-[11px]">
                    Created approval requests in fiduciary queue and generated SEC Rule 204-2 audit events.
                  </p>
                </div>

                {batchResults.failed.length > 0 && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-1 text-rose-900">
                    <span className="font-bold block">
                      ⚠ Ineligible / Duplicate Prevented ({batchResults.failed.length} records)
                    </span>
                    <ul className="text-[11px] list-disc list-inside">
                      {batchResults.failed.map((f, i) => (
                        <li key={i}>
                          <strong>{f.symbol}</strong>: {f.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Calculation Transparency Modal */}
      {selectedCalculation && (
        <CalculationTransparencyModal
          calculation={selectedCalculation}
          onClose={() => setSelectedCalculation(null)}
        />
      )}
    </div>
  );
};
