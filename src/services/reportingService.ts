import {
  MOCK_HOUSEHOLDS,
  MOCK_ACCOUNTS,
  MOCK_HOLDINGS,
  MOCK_AUDIT_EVENTS,
  MOCK_APPROVAL_REQUESTS,
} from '../data/mockData';
import { taxService } from './taxService';
import { institutionalService } from './institutionalService';

export interface ReportFilterOptions {
  reportType:
    | 'portfolio_summary'
    | 'performance_attribution'
    | 'tax_opportunities'
    | 'household_summary'
    | 'retirement_plan'
    | 'audit_approvals';
  householdId?: string;
  planId?: string;
  startDate?: string;
  endDate?: string;
}

export interface GeneratedReport {
  id: string;
  title: string;
  category: string;
  generatedAt: string;
  parameters: Record<string, string>;
  summaryMetrics: { label: string; value: string }[];
  headers: string[];
  rows: (string | number)[][];
}

class ReportingService {
  public generateReport(filters: ReportFilterOptions): GeneratedReport {
    const reportId = `rep_${Date.now()}`;
    const timestamp = new Date().toLocaleString('en-US');

    switch (filters.reportType) {
      case 'portfolio_summary': {
        const household = MOCK_HOUSEHOLDS.find((h) => h.id === filters.householdId) || MOCK_HOUSEHOLDS[0];
        const accounts = MOCK_ACCOUNTS.filter((a) => a.householdId === household.id);
        const holdings = MOCK_HOLDINGS.filter((h) => accounts.some((a) => a.id === h.accountId));

        const totalMarketVal = holdings.reduce((sum, h) => sum + h.marketValue, 0);
        const totalGainLoss = holdings.reduce((sum, h) => sum + h.unrealizedGainLoss, 0);

        return {
          id: reportId,
          title: `Portfolio Summary & Holdings Valuation - ${household.name}`,
          category: 'Portfolio',
          generatedAt: timestamp,
          parameters: {
            Household: household.name,
            'Account Scope': `${accounts.length} Custodial Accounts`,
            'As Of Date': 'Market Close Today',
          },
          summaryMetrics: [
            { label: 'Total Invested Assets', value: `$${totalMarketVal.toLocaleString()}` },
            { label: 'Total Unrealized Gain/Loss', value: `$${totalGainLoss.toLocaleString()}` },
            { label: 'Total Active Holdings', value: `${holdings.length} Securities` },
          ],
          headers: ['Symbol', 'Security Name', 'Asset Class', 'Quantity', 'Price', 'Market Value', 'Unrealized G/L'],
          rows: holdings.map((h) => [
            h.symbol,
            h.name,
            h.assetClass,
            h.quantity,
            `$${h.price.toFixed(2)}`,
            `$${h.marketValue.toLocaleString()}`,
            `${h.unrealizedGainLoss >= 0 ? '+' : ''}$${h.unrealizedGainLoss.toLocaleString()}`,
          ]),
        };
      }

      case 'tax_opportunities': {
        const opps = taxService.getTaxOpportunities(filters.householdId);
        const totalSavings = opps.reduce((sum, o) => sum + o.estimatedTaxSavings, 0);
        const totalLosses = opps.reduce((sum, o) => sum + o.unrealizedLoss, 0);

        return {
          id: reportId,
          title: 'Tax-Loss Harvesting & Opportunity Assessment Report',
          category: 'Tax',
          generatedAt: timestamp,
          parameters: {
            'Report Focus': 'Capital Gain Offsets & Wash-Sale Compliance',
            'Active Opportunities': `${opps.length} Identified`,
          },
          summaryMetrics: [
            { label: 'Total Harvestable Losses', value: `$${Math.abs(totalLosses).toLocaleString()}` },
            { label: 'Estimated Combined Tax Savings', value: `$${totalSavings.toLocaleString()}` },
            { label: 'Substitutes Available', value: `${opps.length} Approved Pairs` },
          ],
          headers: ['Symbol', 'Holding Name', 'Current Value', 'Unrealized Loss', 'Replacement ETF', 'Est. Tax Savings', 'Status'],
          rows: opps.map((o) => [
            o.holdingSymbol,
            o.holdingName,
            `$${o.currentValue.toLocaleString()}`,
            `-$${Math.abs(o.unrealizedLoss).toLocaleString()}`,
            `${o.replacementCandidate} (${o.replacementCandidateName})`,
            `$${o.estimatedTaxSavings.toLocaleString()}`,
            o.status,
          ]),
        };
      }

      case 'retirement_plan': {
        const plan = institutionalService.getPlan();
        const investments = institutionalService.getInvestmentOptions();

        return {
          id: reportId,
          title: `Institutional Fiduciary Plan Summary - ${plan.planName}`,
          category: 'Retirement',
          generatedAt: timestamp,
          parameters: {
            Plan: plan.planName,
            Sponsor: plan.sponsorName,
            'EIN / Plan Number': plan.ein,
          },
          summaryMetrics: [
            { label: 'Total Plan Assets', value: `$${plan.totalAssets.toLocaleString()}` },
            { label: 'Participation Rate', value: `${plan.participationRate}%` },
            { label: 'Active Participants', value: `${plan.activeParticipants}` },
            { label: 'Plan Health Score', value: `${plan.planHealthScore} / 100` },
          ],
          headers: ['Ticker', 'Fund Name', 'Asset Class', 'Expense Ratio', '1-Yr Return', '3-Yr Return', 'Status'],
          rows: investments.map((inv) => [
            inv.symbol,
            inv.name,
            inv.assetClass,
            `${(inv.expenseRatio * 100).toFixed(2)}%`,
            `+${inv.oneYearReturn}%`,
            `+${inv.threeYearReturn}%`,
            inv.status,
          ]),
        };
      }

      case 'audit_approvals': {
        const events = MOCK_AUDIT_EVENTS;
        const approvals = MOCK_APPROVAL_REQUESTS;

        return {
          id: reportId,
          title: 'SEC Rule 204-2 Fiduciary Audit & Dual-Authorization Ledger',
          category: 'Compliance',
          generatedAt: timestamp,
          parameters: {
            Standard: 'SEC / FINRA / ERISA Immutable Audit Trail',
            'Total Events Logged': `${events.length}`,
            'Pending Approvals': `${approvals.filter((a) => a.status === 'Pending Review').length}`,
          },
          summaryMetrics: [
            { label: 'Total Immutable Records', value: `${events.length}` },
            { label: 'Approved Actions', value: `${approvals.filter((a) => a.status === 'Approved').length}` },
            { label: 'System Integrity', value: '100% Cryptographically Verified' },
          ],
          headers: ['Timestamp', 'Actor', 'Role', 'Action', 'Object Affected', 'Previous Value', 'New Value', 'Reason'],
          rows: events.map((e) => [
            e.timestamp,
            e.userName,
            e.userRole,
            e.action,
            e.objectAffected,
            e.previousValue,
            e.newValue,
            e.reason,
          ]),
        };
      }

      default: {
        const hh = MOCK_HOUSEHOLDS[0];
        return {
          id: reportId,
          title: `Household 360 Consolidated Balance Sheet - ${hh.name}`,
          category: 'Household',
          generatedAt: timestamp,
          parameters: { Household: hh.name, Tier: hh.tier || 'Private Client' },
          summaryMetrics: [
            { label: 'Total Net Worth', value: `$${hh.totalNetWorth.toLocaleString()}` },
            { label: 'Liquid Net Worth', value: `$${hh.liquidNetWorth.toLocaleString()}` },
            { label: 'Total Liabilities', value: `$${hh.totalLiabilities.toLocaleString()}` },
          ],
          headers: ['Metric', 'Current Valuation', 'Category', 'Custodian / Source'],
          rows: [
            ['Total Investment Assets', `$${(hh.totalNetWorth - hh.liquidNetWorth).toLocaleString()}`, 'Investment', 'Schwab / Fidelity / Pershing'],
            ['Liquid Cash Reserves', `$${hh.liquidNetWorth.toLocaleString()}`, 'Cash & Equivalents', 'JPMorgan Private Bank'],
            ['Mortgage Liabilities', `$${hh.totalLiabilities.toLocaleString()}`, 'Liabilities', 'JPMorgan Chase Servicing'],
          ],
        };
      }
    }
  }

  public exportReportCsv(report: GeneratedReport): void {
    const csvContent = [
      `"${report.title}"`,
      `"Generated At: ${report.generatedAt}"`,
      `"Category: ${report.category}"`,
      '',
      // Parameters
      ...Object.entries(report.parameters).map(([k, v]) => `"${k}","${v}"`),
      '',
      // Headers
      report.headers.map((h) => `"${h}"`).join(','),
      // Rows
      ...report.rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `${report.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const reportingService = new ReportingService();
