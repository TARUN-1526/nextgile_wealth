import {
  RebalanceProposal,
  TradeOrder,
  AdvisorRecommendation,
  UserProfile,
} from '../types';
import { approvalService } from './approvalService';
import { auditService } from './auditService';

const INITIAL_PROPOSALS: RebalanceProposal[] = [
  {
    id: 'prop_001',
    householdId: 'hh_vance',
    modelName: 'Vance Global Growth & Income Model (70/30 Strategic)',
    targetDriftPercent: 5.4,
    status: 'Draft',
    createdAt: '2026-09-05',
    totalTradedValue: 360000,
    estimatedTaxImpact: 12400,
    fiduciaryRationale: 'Equity appreciation has pushed US Equity allocation to 76.2% vs 70.0% strategic target (+6.2% drift). Trim SPY and AAPL in taxable sleeve; deploy proceeds into BND and VGIT to re-anchor fixed income duration.',
    proposedTrades: [
      {
        id: 'trd_001',
        proposalId: 'prop_001',
        accountId: 'acct_vance_taxable',
        accountName: 'Richard Vance Joint Brokerage',
        securitySymbol: 'SPY',
        securityName: 'SPDR S&P 500 ETF Trust',
        action: 'SELL',
        quantity: 360,
        estimatedPrice: 500,
        estimatedValue: 180000,
        reason: 'Trim overweight US Large Cap Equity back to 70% model target',
        status: 'Draft',
        approvalStatus: 'Pending Review',
        isPrototype: true,
      },
      {
        id: 'trd_002',
        proposalId: 'prop_001',
        accountId: 'acct_vance_taxable',
        accountName: 'Richard Vance Joint Brokerage',
        securitySymbol: 'BND',
        securityName: 'Vanguard Total Bond Market ETF',
        action: 'BUY',
        quantity: 2465,
        estimatedPrice: 73,
        estimatedValue: 180000,
        reason: 'Restore core fixed-income allocation to 25% target',
        status: 'Draft',
        approvalStatus: 'Pending Review',
        isPrototype: true,
      },
    ],
  },
];

const INITIAL_RECOMMENDATIONS: AdvisorRecommendation[] = [
  {
    id: 'rec_001',
    householdId: 'hh_vance',
    title: 'Substitute BND with AGG for $43.6k Realized Tax-Loss Harvest',
    category: 'Tax Optimization',
    impact: '+$16,141 estimated tax savings in 2026 tax year',
    rationale: 'BND has unrealized loss. Selling and replacing with AGG preserves fixed income allocation without triggering IRS § 1091 wash sale rules.',
    priority: 'High',
    status: 'Active',
    createdAt: '2026-09-04',
    actionRequired: 'Submit TLH approval request to compliance',
  },
  {
    id: 'rec_002',
    householdId: 'hh_vance',
    title: 'Model Rebalance: Trim 6.2% Overweight US Equity Sleeve',
    category: 'Asset Allocation',
    impact: 'Reduces portfolio beta from 1.18 to 1.02 target',
    rationale: 'Rally in tech stocks has increased overall volatility and equity risk. Rebalance trims gains and redeploys into short/intermediate Treasuries.',
    priority: 'Medium',
    status: 'Active',
    createdAt: '2026-09-05',
    actionRequired: 'Execute rebalance proposal trades',
  },
  {
    id: 'rec_003',
    householdId: 'hh_pendelton',
    title: 'Distribute 2026 Mandatory RMD of $78,400 via QCD Strategy',
    category: 'Retirement Income',
    impact: 'Avoids up to 37% ordinary income tax on up to $105k gift',
    rationale: 'Arthur Pendelton can direct part or all of his remaining $78,400 RMD directly to 501(c)(3) charities to avoid Adjusted Gross Income phaseouts.',
    priority: 'High',
    status: 'Active',
    createdAt: '2026-08-28',
    actionRequired: 'Obtain client charitable designation list',
  },
  {
    id: 'rec_004',
    householdId: 'hh_sterling',
    title: 'Gift Appreciated Tech Shares directly to Sterling DAF Foundation',
    category: 'Estate & Trust',
    impact: 'Eliminates 23.8% long-term capital gains tax on $250k gift',
    rationale: 'Direct donation of long-term appreciated public securities yields full fair-market-value tax deduction while avoiding capital gains.',
    priority: 'Medium',
    status: 'Active',
    createdAt: '2026-09-01',
    actionRequired: 'Initiate DTC custodian transfer to DAF',
  },
];

class PortfolioService {
  private proposals: RebalanceProposal[] = [...INITIAL_PROPOSALS];
  private recommendations: AdvisorRecommendation[] = [...INITIAL_RECOMMENDATIONS];
  private listeners: (() => void)[] = [];

  public subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // --- Rebalance Proposals ---
  public getRebalanceProposals(householdId?: string): RebalanceProposal[] {
    if (householdId) {
      return this.proposals.filter((p) => p.householdId === householdId);
    }
    return [...this.proposals];
  }

  public getRebalanceProposal(id: string): RebalanceProposal | undefined {
    return this.proposals.find((p) => p.id === id);
  }

  public createRebalanceProposal(params: {
    householdId: string;
    modelName: string;
    targetDriftPercent: number;
    fiduciaryRationale: string;
    trades: Omit<TradeOrder, 'id' | 'status' | 'approvalStatus' | 'isPrototype'>[];
    user: UserProfile;
  }): RebalanceProposal {
    const proposalId = `prop_${Date.now()}`;
    const newTrades: TradeOrder[] = params.trades.map((t, idx) => ({
      ...t,
      id: `trd_${Date.now()}_${idx}`,
      proposalId,
      status: 'Draft',
      approvalStatus: 'Pending Review',
      isPrototype: true,
    }));

    const totalTradedValue = newTrades.reduce((sum, t) => sum + t.estimatedValue, 0);

    const newProposal: RebalanceProposal = {
      id: proposalId,
      householdId: params.householdId,
      modelName: params.modelName,
      targetDriftPercent: params.targetDriftPercent,
      status: 'Draft',
      createdAt: new Date().toISOString().split('T')[0],
      totalTradedValue,
      estimatedTaxImpact: Math.round(totalTradedValue * 0.035),
      fiduciaryRationale: params.fiduciaryRationale,
      proposedTrades: newTrades,
      submittedBy: params.user.name,
    };

    this.proposals = [newProposal, ...this.proposals];
    this.notify();
    return newProposal;
  }

  public submitRebalanceForApproval(
    proposalId: string,
    user: UserProfile
  ): { success: boolean; message: string; approvalId?: string } {
    const proposal = this.getRebalanceProposal(proposalId);
    if (!proposal) return { success: false, message: 'Proposal not found' };

    if (proposal.status === 'Submitted') {
      return {
        success: false,
        message: 'This rebalance proposal is already pending fiduciary approval. Duplicate submissions prevented.',
      };
    }

    if (proposal.status === 'Executed') {
      return { success: false, message: 'This rebalance proposal has already been executed.' };
    }

    // Submit into ApprovalService
    const approval = approvalService.createRequest({
      requesterName: user.name,
      requesterRole: user.title || user.role,
      requestType: 'rebalance',
      title: `Model Rebalance Proposal: ${proposal.modelName} (${proposal.proposedTrades.length} Trades)`,
      details: {
        proposalId: proposal.id,
        householdId: proposal.householdId,
        totalVolume: proposal.totalTradedValue,
        tradesCount: proposal.proposedTrades.length,
        trades: proposal.proposedTrades.map((t) => `${t.action} ${t.quantity} ${t.securitySymbol} ($${t.estimatedValue.toLocaleString()})`),
        estimatedTaxImpact: proposal.estimatedTaxImpact,
      },
      reason: proposal.fiduciaryRationale,
    });

    // Update proposal and trades
    this.proposals = this.proposals.map((p) =>
      p.id === proposalId
        ? {
            ...p,
            status: 'Submitted',
            proposedTrades: p.proposedTrades.map((t) => ({
              ...t,
              status: 'Submitted',
              approvalStatus: 'Pending Review',
            })),
          }
        : p
    );

    auditService.recordEvent({
      userName: user.name,
      userRole: user.title || user.role,
      action: 'Portfolio Rebalance Submitted for Fiduciary Approval',
      objectAffected: `Model Proposal ${proposal.modelName}`,
      previousValue: 'Status: Draft',
      newValue: 'Status: Submitted (Approval Queue)',
      reason: proposal.fiduciaryRationale,
      approvalRequestId: approval.id,
    });

    this.notify();
    return {
      success: true,
      message: `Rebalance proposal submitted for fiduciary review (Ref: ${approval.id}).`,
      approvalId: approval.id,
    };
  }

  public executeRebalance(
    proposalId: string,
    user: UserProfile
  ): { success: boolean; message: string } {
    const proposal = this.getRebalanceProposal(proposalId);
    if (!proposal) return { success: false, message: 'Proposal not found' };

    this.proposals = this.proposals.map((p) =>
      p.id === proposalId
        ? {
            ...p,
            status: 'Executed',
            approvedBy: user.name,
            proposedTrades: p.proposedTrades.map((t) => ({
              ...t,
              status: 'Executed',
              approvalStatus: 'Approved',
            })),
          }
        : p
    );

    auditService.recordEvent({
      userName: user.name,
      userRole: user.title || user.role,
      action: 'Rebalance Trade Orders Dispatched to Custodian',
      objectAffected: `Household ${proposal.householdId} (${proposal.proposedTrades.length} orders)`,
      previousValue: 'Status: Approved',
      newValue: 'Status: Executed (Simulated Fill)',
      reason: `Automated algorithmic execution per fiduciary mandate.`,
    });

    this.notify();
    return {
      success: true,
      message: `Successfully executed ${proposal.proposedTrades.length} trade orders for ${proposal.modelName}.`,
    };
  }

  // --- Advisor Recommendations ---
  public getRecommendations(householdId?: string): AdvisorRecommendation[] {
    if (householdId) {
      return this.recommendations.filter((r) => r.householdId === householdId);
    }
    return [...this.recommendations];
  }

  public createRecommendation(params: {
    householdId: string;
    title: string;
    category: AdvisorRecommendation['category'];
    impact: string;
    rationale: string;
    priority: AdvisorRecommendation['priority'];
    actionRequired?: string;
    user: UserProfile;
  }): AdvisorRecommendation {
    const newRec: AdvisorRecommendation = {
      id: `rec_${Date.now()}`,
      householdId: params.householdId,
      title: params.title,
      category: params.category,
      impact: params.impact,
      rationale: params.rationale,
      priority: params.priority,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
      actionRequired: params.actionRequired,
    };

    this.recommendations = [newRec, ...this.recommendations];

    auditService.recordEvent({
      userName: params.user.name,
      userRole: params.user.title || params.user.role,
      action: 'Advisor Strategic Recommendation Created',
      objectAffected: `Household ${params.householdId}: ${params.title}`,
      previousValue: 'None',
      newValue: `Active [${params.category}]`,
      reason: params.rationale,
    });

    this.notify();
    return newRec;
  }

  public updateRecommendationStatus(
    id: string,
    status: AdvisorRecommendation['status'],
    user: UserProfile
  ): void {
    const rec = this.recommendations.find((r) => r.id === id);
    if (!rec) return;

    this.recommendations = this.recommendations.map((r) =>
      r.id === id ? { ...r, status } : r
    );

    auditService.recordEvent({
      userName: user.name,
      userRole: user.title || user.role,
      action: 'Recommendation Status Updated',
      objectAffected: `Recommendation: ${rec.title}`,
      previousValue: rec.status,
      newValue: status,
      reason: `Advisor marked recommendation as ${status}.`,
    });

    this.notify();
  }
}

export const portfolioService = new PortfolioService();
