import {
  TaxOpportunity,
  WashSaleRecord,
  RmdRecord,
  EstatePlan,
  DAFPhilanthropy,
  UserProfile,
} from '../types';
import {
  MOCK_TAX_OPPORTUNITIES,
  MOCK_ESTATE_PLAN,
  MOCK_DAF,
  CALCULATION_REGISTRY,
} from '../data/mockData';
import { approvalService } from './approvalService';
import { auditService } from './auditService';
import { apiClient } from './apiClient';

// Extended initial opportunities with complete fields
const INITIAL_TAX_OPPORTUNITIES: TaxOpportunity[] = [
  {
    ...MOCK_TAX_OPPORTUNITIES[0],
    opportunityType: 'Tax-Loss Harvesting',
    priority: 'High',
    createdDate: '2026-09-02',
    advisorReviewStatus: 'Reviewed',
    taxImpact: 'Offsets $43,625 realized short/long-term capital gains',
    calculationId: 'calc_tlh_bnd',
  },
  {
    ...MOCK_TAX_OPPORTUNITIES[1],
    opportunityType: 'Tax-Loss Harvesting',
    priority: 'Medium',
    createdDate: '2026-09-03',
    advisorReviewStatus: 'Pending Review',
    taxImpact: 'Generates $11,200 capital loss carryforward or current year offset',
    calculationId: 'calc_tlh_bnd',
  },
  {
    id: 'tax_opp_003',
    householdId: 'hh_sterling',
    accountId: 'acct_sterling_taxable',
    holdingSymbol: 'TSLA',
    holdingName: 'Tesla, Inc.',
    opportunityType: 'Tax-Loss Harvesting',
    currentValue: 312000,
    unrealizedLoss: -28400,
    replacementCandidate: 'RIVN',
    replacementCandidateName: 'Rivian Automotive Inc.',
    estimatedTaxSavings: 10508,
    taxImpact: 'Realizes $28,400 in capital losses against private equity distribution gains',
    washSaleWindowDays: 31,
    washSaleExpiry: '2026-10-15',
    priority: 'High',
    createdDate: '2026-09-04',
    advisorReviewStatus: 'Pending Review',
    status: 'Identified',
    notes: 'Harvest short-term losses to offset K-1 ordinary pass-through capital gains.',
    calculationId: 'calc_unrealized_gain_loss',
  },
  {
    id: 'tax_opp_004',
    householdId: 'hh_pendelton',
    accountId: 'acct_pendelton_taxable',
    holdingSymbol: 'IWM',
    holdingName: 'iShares Russell 2000 ETF',
    opportunityType: 'Capital Gain Offset',
    currentValue: 185000,
    unrealizedLoss: -15200,
    replacementCandidate: 'VB',
    replacementCandidateName: 'Vanguard Small-Cap ETF',
    estimatedTaxSavings: 5624,
    taxImpact: 'Reduces taxable income base for married filing jointly retiree bracket',
    washSaleWindowDays: 31,
    washSaleExpiry: '2026-10-12',
    priority: 'Medium',
    createdDate: '2026-09-01',
    advisorReviewStatus: 'Reviewed',
    status: 'Proposed',
    notes: 'Substitute IWM with VB to capture loss while keeping small-cap asset allocation intact.',
    calculationId: 'calc_tlh_bnd',
  },
];

const INITIAL_WASH_SALE_RECORDS: WashSaleRecord[] = [
  {
    id: 'ws_001',
    householdId: 'hh_vance',
    accountId: 'acct_vance_taxable',
    securitySymbol: 'BND',
    securityName: 'Vanguard Total Bond Market ETF',
    relatedTransaction: 'Dividend Reinvestment (18.4 shares)',
    transactionDate: '2026-08-30',
    washSaleWindowStart: '2026-07-31',
    washSaleWindowEnd: '2026-09-30',
    status: 'Active',
    notes: 'Auto-reinvested dividend within 30-day window. Must sell specific lot or wait until Sept 30 to harvest full lot without disallowance.',
  },
  {
    id: 'ws_002',
    householdId: 'hh_vance',
    accountId: 'acct_vance_ira',
    securitySymbol: 'SPY',
    securityName: 'SPDR S&P 500 ETF Trust',
    relatedTransaction: 'IRA Monthly Purchase ($5,000)',
    transactionDate: '2026-08-15',
    washSaleWindowStart: '2026-07-16',
    washSaleWindowEnd: '2026-09-15',
    status: 'Clearing Soon',
    notes: 'Cross-account wash-sale restriction under IRC Rev. Rul. 2008-5 applies between taxable and IRA accounts.',
  },
  {
    id: 'ws_003',
    householdId: 'hh_sterling',
    accountId: 'acct_sterling_taxable',
    securitySymbol: 'NVDA',
    securityName: 'NVIDIA Corporation',
    relatedTransaction: 'Option Exercise / Purchase',
    transactionDate: '2026-08-20',
    washSaleWindowStart: '2026-07-21',
    washSaleWindowEnd: '2026-09-20',
    status: 'Active',
    notes: 'Substantially identical security acquisition rule applies to stock and call options.',
  },
];

const INITIAL_RMD_RECORDS: RmdRecord[] = [
  {
    id: 'rmd_001',
    householdId: 'hh_pendelton',
    clientId: 'client_arthur_pendelton',
    clientName: 'Arthur Pendelton (Age 74)',
    accountId: 'acct_pendelton_ira',
    accountName: 'Arthur Pendelton Traditional Rollover IRA (••••-9214)',
    priorYearEndBalance: 2038400,
    irsFactor: 26.0,
    requiredDistribution: 78400,
    distributedAmount: 0,
    remainingAmount: 78400,
    deadline: '2026-12-31',
    status: 'Action Required',
    calculationId: 'calc_rmd_pendelton',
  },
  {
    id: 'rmd_002',
    householdId: 'hh_pendelton',
    clientId: 'client_miriam_pendelton',
    clientName: 'Miriam Pendelton (Age 73)',
    accountId: 'acct_pendelton_ira_miriam',
    accountName: 'Miriam Pendelton Inherited IRA (••••-4412)',
    priorYearEndBalance: 520000,
    irsFactor: 26.5,
    requiredDistribution: 19622,
    distributedAmount: 19622,
    remainingAmount: 0,
    deadline: '2026-12-31',
    status: 'Satisfied',
    calculationId: 'calc_rmd_pendelton',
  },
];

class TaxService {
  private opportunities: TaxOpportunity[] = [...INITIAL_TAX_OPPORTUNITIES];
  private washSaleRecords: WashSaleRecord[] = [...INITIAL_WASH_SALE_RECORDS];
  private rmdRecords: RmdRecord[] = [...INITIAL_RMD_RECORDS];
  private estatePlan: EstatePlan = { ...MOCK_ESTATE_PLAN };
  private daf: DAFPhilanthropy = { ...MOCK_DAF };
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

  // --- Tax Opportunities ---
  public getTaxOpportunities(householdId?: string): TaxOpportunity[] {
    if (householdId) {
      return this.opportunities.filter((o) => o.householdId === householdId);
    }
    return [...this.opportunities];
  }

  public getTaxOpportunity(id: string): TaxOpportunity | undefined {
    return this.opportunities.find((o) => o.id === id);
  }

  public updateTaxOpportunity(id: string, updates: Partial<TaxOpportunity>): void {
    this.opportunities = this.opportunities.map((o) =>
      o.id === id ? { ...o, ...updates } : o
    );
    this.notify();
  }

  // --- Wash-Sale Controls ---
  public getWashSaleRecords(householdId?: string): WashSaleRecord[] {
    if (householdId) {
      return this.washSaleRecords.filter((w) => w.householdId === householdId);
    }
    return [...this.washSaleRecords];
  }

  public checkWashSaleConflict(
    symbol: string,
    householdId?: string
  ): { hasConflict: boolean; record?: WashSaleRecord; warning?: string } {
    const record = this.washSaleRecords.find(
      (w) =>
        w.securitySymbol.toUpperCase() === symbol.toUpperCase() &&
        (w.status === 'Active' || w.status === 'Clearing Soon') &&
        (!householdId || w.householdId === householdId)
    );

    if (record) {
      return {
        hasConflict: true,
        record,
        warning: `Wash-sale restriction active on ${record.securitySymbol}: transaction detected on ${record.transactionDate}. Window expires ${record.washSaleWindowEnd}. Selling at a loss or repurchasing will disallow loss under IRC § 1091.`,
      };
    }
    return { hasConflict: false };
  }

  // --- TLH Harvest Workflow with Duplicate Prevention ---
  public createHarvestRequest(params: {
    opportunityId: string;
    user: UserProfile;
    reason?: string;
  }): { success: boolean; message: string; approvalId?: string } {
    const opp = this.getTaxOpportunity(params.opportunityId);
    if (!opp) {
      return { success: false, message: 'Tax opportunity not found.' };
    }

    if (opp.status === 'Proposed') {
      return {
        success: false,
        message: `A harvest proposal for ${opp.holdingSymbol} is already pending review. Duplicate requests are prevented.`,
      };
    }

    if (opp.status === 'Executed') {
      return {
        success: false,
        message: `This tax-loss harvest for ${opp.holdingSymbol} has already been executed.`,
      };
    }

    // Check wash-sale restriction
    const washSaleCheck = this.checkWashSaleConflict(opp.holdingSymbol, opp.householdId);
    let reasonText = params.reason || opp.notes;
    if (washSaleCheck.hasConflict) {
      reasonText += ` [Wash-Sale Flag: ${washSaleCheck.record?.notes}]`;
    }

    // Submit into Approval Service
    const approval = approvalService.createRequest({
      requesterName: params.user.name,
      requesterRole: params.user.title || params.user.role,
      requestType: 'tlh',
      title: `Tax-Loss Harvest: Sell ${opp.holdingSymbol} ($${opp.currentValue.toLocaleString()}) and Buy ${opp.replacementCandidate}`,
      details: {
        opportunityId: opp.id,
        householdId: opp.householdId,
        accountId: opp.accountId,
        sellSymbol: opp.holdingSymbol,
        sellValue: opp.currentValue,
        estimatedLoss: opp.unrealizedLoss,
        buySymbol: opp.replacementCandidate,
        buyValue: opp.currentValue,
        estimatedTaxSavings: opp.estimatedTaxSavings,
        washSaleWarning: washSaleCheck.hasConflict ? washSaleCheck.warning : 'None',
      },
      reason: reasonText,
    });

    // Update opportunity status to Proposed
    this.updateTaxOpportunity(opp.id, {
      status: 'Proposed',
      advisorReviewStatus: 'Approved',
    });

    // Record audit event
    auditService.recordEvent({
      userName: params.user.name,
      userRole: params.user.title || params.user.role,
      action: 'Tax-Loss Harvest Submitted for Approval',
      objectAffected: `Tax Opportunity ${opp.holdingSymbol} (${opp.accountId})`,
      previousValue: 'Status: Identified',
      newValue: 'Status: Proposed (Fiduciary Review Queue)',
      reason: reasonText,
      approvalRequestId: approval.id,
    });

    return {
      success: true,
      message: `Tax-loss harvest proposal for ${opp.holdingSymbol} submitted for fiduciary approval (Ref: ${approval.id}).`,
      approvalId: approval.id,
    };
  }

  // --- Batch Harvesting ---
  public executeBatchHarvest(
    opportunityIds: string[],
    user: UserProfile
  ): {
    successful: string[];
    failed: { id: string; symbol: string; reason: string }[];
  } {
    const successful: string[] = [];
    const failed: { id: string; symbol: string; reason: string }[] = [];

    for (const oppId of opportunityIds) {
      const opp = this.getTaxOpportunity(oppId);
      if (!opp) {
        failed.push({ id: oppId, symbol: 'UNKNOWN', reason: 'Record not found' });
        continue;
      }

      if (opp.status === 'Proposed' || opp.status === 'Executed') {
        failed.push({
          id: oppId,
          symbol: opp.holdingSymbol,
          reason: `Already in ${opp.status} status`,
        });
        continue;
      }

      const res = this.createHarvestRequest({
        opportunityId: oppId,
        user,
        reason: `Batch harvest execution for Q3 tax rebalancing.`,
      });

      if (res.success) {
        successful.push(oppId);
      } else {
        failed.push({ id: oppId, symbol: opp.holdingSymbol, reason: res.message });
      }
    }

    return { successful, failed };
  }

  // --- RMD Tracking & Execution ---
  public getRmdRecords(householdId?: string): RmdRecord[] {
    if (householdId) {
      return this.rmdRecords.filter((r) => r.householdId === householdId);
    }
    return [...this.rmdRecords];
  }

  public executeRmdDistribution(
    rmdId: string,
    amount: number,
    user: UserProfile
  ): { success: boolean; message: string } {
    const rmd = this.rmdRecords.find((r) => r.id === rmdId);
    if (!rmd) return { success: false, message: 'RMD record not found' };

    const newDistributed = rmd.distributedAmount + amount;
    const newRemaining = Math.max(0, rmd.requiredDistribution - newDistributed);
    const newStatus = newRemaining === 0 ? 'Satisfied' : 'Pending Distribution';

    this.rmdRecords = this.rmdRecords.map((r) =>
      r.id === rmdId
        ? {
            ...r,
            distributedAmount: newDistributed,
            remainingAmount: newRemaining,
            status: newStatus,
          }
        : r
    );

    auditService.recordEvent({
      userName: user.name,
      userRole: user.title || user.role,
      action: 'RMD Custodial Distribution Executed',
      objectAffected: `${rmd.accountName} - ${rmd.clientName}`,
      previousValue: `Remaining: $${rmd.remainingAmount.toLocaleString()}`,
      newValue: `Remaining: $${newRemaining.toLocaleString()} (Distributed: $${amount.toLocaleString()})`,
      reason: `Mandatory IRS Uniform Lifetime Table 2026 distribution fulfillment.`,
    });

    apiClient.distributeRmd(rmdId, amount, 'Standard Distribution', 'Mandatory 2026 distribution').catch((err) => {
      console.warn('[FastAPI Sync Warning] distributeRmd:', err.message);
    });

    this.notify();
    return {
      success: true,
      message: `Distribution of $${amount.toLocaleString()} processed. New remaining RMD: $${newRemaining.toLocaleString()}.`,
    };
  }

  // --- Estate & Philanthropy ---
  public getEstatePlan(householdId?: string): EstatePlan {
    return this.estatePlan;
  }

  public getDafPhilanthropy(householdId?: string): DAFPhilanthropy {
    return this.daf;
  }

  public submitDafGrant(
    householdId: string,
    grant: { charityName: string; ein: string; amount: number; purpose: string },
    user: UserProfile
  ): { success: boolean; message: string } {
    if (grant.amount <= 0) {
      return { success: false, message: 'Grant amount must be greater than zero.' };
    }
    if (grant.amount > this.daf.currentBalance) {
      return { success: false, message: 'Grant amount exceeds available DAF balance.' };
    }

    const newGrant = {
      id: `grant_${Date.now()}`,
      charityName: grant.charityName,
      ein: grant.ein,
      amount: grant.amount,
      status: 'Approved' as const,
      grantDate: new Date().toISOString().split('T')[0],
      purpose: grant.purpose,
    };

    this.daf = {
      ...this.daf,
      currentBalance: this.daf.currentBalance - grant.amount,
      ytdGrantsPaid: this.daf.ytdGrantsPaid + grant.amount,
      grants: [newGrant, ...this.daf.grants],
    };

    auditService.recordEvent({
      userName: user.name,
      userRole: user.title || user.role,
      action: 'DAF Grant Recommendation Approved',
      objectAffected: `${this.daf.fundName} -> ${grant.charityName}`,
      previousValue: `DAF Balance: $${(this.daf.currentBalance + grant.amount).toLocaleString()}`,
      newValue: `DAF Balance: $${this.daf.currentBalance.toLocaleString()} (Grant: $${grant.amount.toLocaleString()})`,
      reason: grant.purpose,
    });

    this.notify();
    return {
      success: true,
      message: `Grant of $${grant.amount.toLocaleString()} to ${grant.charityName} recommended and recorded.`,
    };
  }
}

export const taxService = new TaxService();
