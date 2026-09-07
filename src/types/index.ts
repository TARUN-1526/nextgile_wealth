export type UserCategory = 'individual' | 'institutional' | 'internal';

export type UserRole =
  // Individual / Family
  | 'hnw_client'
  | 'retiree'
  | 'business_owner'
  | 'beneficiary'
  | 'philanthropic_family'
  // Institutional
  | 'plan_sponsor'
  | 'hr_benefits'
  | 'cfo'
  | 'investment_committee'
  | 'plan_participant'
  | 'fiduciary'
  | 'plan_admin'
  // Internal Firm
  | 'financial_advisor'
  | 'investment_team'
  | 'tax_specialist'
  | 'estate_attorney'
  | 'trust_officer'
  | 'compliance_user'
  | 'client_service'
  | 'operations'
  | 'leadership';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  category: UserCategory;
  title: string;
  organization?: string;
  householdId?: string; // For client/family users
  clientId?: string;
  assignedHouseholdIds?: string[]; // For advisors
  assignedPlanId?: string; // For institutional users
  participantId?: string; // For plan participants
  trustAccessIds?: string[]; // For beneficiaries with restricted trust access
  avatarInitials: string;
  phone?: string;
}

export type FreshnessStatus = 'live' | '5m' | 'today_932am' | 'stale_3d';

export interface FinancialMetric {
  value: number;
  asOf: string;
  freshness: FreshnessStatus;
  currency?: string;
  format?: 'currency' | 'percent' | 'number' | 'compactCurrency';
  isCalculated?: boolean;
  calculationId?: string;
  isScenario?: boolean;
  scenarioLabel?: string;
}

export interface CalculationDetails {
  id: string;
  name: string;
  asOf: string;
  methodFormula: string;
  keyAssumptions: string[];
  relevantFeesTaxes: string;
  limitationsUncertainty: string;
  advisorReviewed: boolean;
  reviewedBy?: string;
  reviewedDate?: string;
  isPrototype: boolean;
  inputParameters?: Record<string, string | number>;
}

export interface Client {
  id: string;
  householdId: string;
  firstName: string;
  lastName: string;
  email: string;
  roleInHousehold: 'Primary' | 'Spouse' | 'Child' | 'Beneficiary' | 'Trustee';
  dateOfBirth: string;
  ssnMasked: string;
  employmentStatus: string;
  annualIncome: number;
  phone: string;
}

export interface Household {
  id: string;
  name: string;
  clientIds: string[];
  advisorTeamId: string;
  totalNetWorth: number;
  liquidNetWorth: number;
  totalLiabilities: number;
  riskTolerance: 'Conservative' | 'Moderate' | 'Moderately Aggressive' | 'Aggressive';
  investmentObjective: string;
  status: 'Active' | 'Review Required' | 'Onboarding';
  tier?: 'Private Client' | 'Ultra HNW' | 'Emerging Wealth';
  primaryAdvisor?: string;
  lastReviewDate?: string;
  cpaContact?: string;
  estateAttorneyContact?: string;
  address: string;
}

export type AccountType =
  | 'taxable'
  | 'traditional_ira'
  | 'roth_ira'
  | 'trust'
  | 'banking'
  | 'credit'
  | 'mortgage'
  | 'external_401k';

export interface Account {
  id: string;
  householdId: string;
  clientId: string;
  accountNumberMasked: string;
  name: string;
  type: AccountType;
  custodian: 'Charles Schwab' | 'Fidelity Institutional' | 'BNY Mellon Pershing' | 'J.P. Morgan Chase' | 'Apex Clearing';
  balance: number;
  cashBalance: number;
  costBasis: number;
  unrealizedGainLoss: number;
  asOf: string;
  freshness: FreshnessStatus;
  isExternal: boolean;
  institutionName?: string;
  trustId?: string; // Links to trust if trust account
  isBeneficiaryRestricted?: boolean; // If only specific beneficiaries can view
}

export interface Holding {
  id: string;
  accountId: string;
  symbol: string;
  name: string;
  assetClass: 'US Equity' | 'Intl Equity' | 'Fixed Income' | 'Alternatives' | 'Cash & Equiv';
  sector: string;
  geography: 'US' | 'Developed Intl' | 'Emerging Markets' | 'Global';
  quantity: number;
  price: number;
  marketValue: number;
  costBasis: number;
  unrealizedGainLoss: number;
  unrealizedGainLossPercent: number;
  esgScore: number; // 0 - 100
  dividendYield: number;
  asOf: string;
  freshness: FreshnessStatus;
}

export interface TaxLot {
  id: string;
  holdingId: string;
  accountId: string;
  symbol: string;
  purchaseDate: string;
  quantity: number;
  costBasisPerShare: number;
  currentPrice: number;
  costBasisTotal: number;
  marketValue: number;
  term: 'short_term' | 'long_term';
  unrealizedGainLoss: number;
  washSaleRestricted: boolean;
  washSaleWindowEnd?: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  householdId: string;
  date: string;
  type: 'Buy' | 'Sell' | 'Dividend' | 'Deposit' | 'Withdrawal' | 'Advisory Fee' | 'Transfer';
  symbol?: string;
  description: string;
  amount: number;
  shares?: number;
  price?: number;
  status: 'Settled' | 'Pending' | 'Canceled';
}

export interface Goal {
  id: string;
  householdId: string;
  title: string;
  category: 'retirement' | 'education' | 'home_purchase' | 'legacy' | 'life_event';
  targetAmount: number;
  currentFunding: number;
  fundingPercent: number;
  targetDate: string;
  priority: 'High' | 'Medium' | 'Essential';
  linkedAccountIds: string[];
  probabilityOfSuccess: number; // 0 - 100
  monthlyContribution: number;
  status: 'On Track' | 'Needs Attention' | 'Exceeding Target';
  milestones: { year: number; projectedValue: number; achieved?: boolean }[];
  scenarioComparison: {
    baselineFunding: number;
    conservativeReturnFunding: number;
    enhancedSavingsFunding: number;
  };
}

export interface VaultDocument {
  id: string;
  householdId?: string;
  planId?: string;
  name: string;
  category: 'Tax' | 'Estate' | 'Investment' | 'Statements' | 'Legal' | 'Plan 5500' | 'Fiduciary Minutes';
  size: string;
  uploadedAt: string;
  expiryDate?: string;
  version: string;
  sharedWith: string[];
  reviewStatus: 'Approved' | 'Pending Review' | 'Needs Signature';
  requiresSignature: boolean;
  tags: string[];
  restrictedToRoles?: UserRole[];
  restrictedToTrustId?: string;
}

export interface TaxOpportunity {
  id: string;
  householdId: string;
  accountId: string;
  holdingSymbol: string;
  holdingName: string;
  opportunityType?: 'Tax-Loss Harvesting' | 'Capital Gain Offset' | 'Asset Location' | 'Charitable Stock Gift';
  currentValue: number;
  unrealizedLoss: number;
  replacementCandidate: string;
  replacementCandidateName: string;
  estimatedTaxSavings: number;
  taxImpact?: string;
  washSaleWindowDays: number;
  washSaleExpiry: string;
  priority?: 'High' | 'Medium' | 'Low';
  createdDate?: string;
  advisorReviewStatus?: 'Pending Review' | 'Reviewed' | 'Approved' | 'Executed';
  calculationId?: string;
  status: 'Identified' | 'Proposed' | 'Executed' | 'Dismissed';
  notes: string;
}

export interface WashSaleRecord {
  id: string;
  householdId: string;
  accountId: string;
  securitySymbol: string;
  securityName: string;
  relatedTransaction: string;
  transactionDate: string;
  washSaleWindowStart: string;
  washSaleWindowEnd: string;
  status: 'Active' | 'Clearing Soon' | 'Cleared' | 'Conflict Detected';
  notes: string;
}

export interface RmdRecord {
  id: string;
  householdId: string;
  clientId: string;
  clientName: string;
  accountId: string;
  accountName: string;
  priorYearEndBalance: number;
  irsFactor: number;
  requiredDistribution: number;
  distributedAmount: number;
  remainingAmount: number;
  deadline: string;
  status: 'Satisfied' | 'Pending Distribution' | 'Action Required';
  calculationId: string;
}

export interface TradeOrder {
  id: string;
  proposalId?: string;
  accountId: string;
  accountName: string;
  securitySymbol: string;
  securityName: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  estimatedPrice: number;
  estimatedValue: number;
  reason: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Executed' | 'Canceled';
  approvalStatus: 'Pending Review' | 'Approved' | 'Rejected' | 'Not Required';
  isPrototype: boolean;
}

export interface RebalanceProposal {
  id: string;
  householdId: string;
  modelName: string;
  targetDriftPercent: number;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Executed';
  createdAt: string;
  totalTradedValue: number;
  estimatedTaxImpact: number;
  proposedTrades: TradeOrder[];
  fiduciaryRationale: string;
  submittedBy?: string;
  approvedBy?: string;
}

export interface AdvisorRecommendation {
  id: string;
  householdId: string;
  clientId?: string;
  title: string;
  category: 'Asset Allocation' | 'Tax Optimization' | 'Retirement Income' | 'Estate & Trust' | 'Risk Mitigation';
  impact: string;
  rationale: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Accepted' | 'Declined' | 'Implemented';
  createdAt: string;
  actionRequired?: string;
}

export interface ReportConfig {
  id: string;
  title: string;
  category: 'Portfolio' | 'Tax' | 'Household' | 'Retirement' | 'Compliance';
  description: string;
  filtersAvailable: ('household' | 'account' | 'plan' | 'dateRange' | 'status')[];
}

export interface EstatePlan {
  id: string;
  householdId: string;
  willStatus: 'Current (Executed 2023)' | 'Under Revision' | 'Drafting';
  poaStatus: 'Active - Financial & Medical' | 'Needs Update';
  healthcareProxy: 'Eleanor Vance (Primary), Jonathan Vance (Alternate)';
  revocableTrustName: string;
  trustValue: number;
  beneficiaries: {
    id: string;
    name: string;
    relationship: string;
    sharePercent: number;
    trustDesignation: string;
    isRestrictedView?: boolean;
  }[];
  reviewReminderDate: string;
  taxExemptionRemaining: number;
  fiduciaryNotes: string;
}

export interface DAFPhilanthropy {
  id: string;
  householdId: string;
  fundName: string;
  currentBalance: number;
  ytdContributions: number;
  ytdGrantsPaid: number;
  qcdEligibleAmount: number;
  grants: {
    id: string;
    charityName: string;
    ein: string;
    amount: number;
    status: 'Paid' | 'Approved' | 'In Review';
    grantDate: string;
    purpose: string;
  }[];
}

export interface RetirementPlan {
  id: string;
  sponsorName: string;
  planName: string;
  planType: '401(k) Profit Sharing Plan';
  ein: string;
  totalAssets: number;
  activeParticipants: number;
  eligibleParticipants: number;
  participationRate: number;
  averageDeferralRate: number;
  employerMatchFormula: string;
  vestingSchedule: string;
  planHealthScore: number;
  autoEnrollmentDefaultRate: number;
  autoEscalationCap: number;
  loansOutstandingCount: number;
  loansOutstandingValue: number;
  fiduciaryStatus: '3(38) Discretionary Investment Manager Active';
  lastCommitteeMeeting: string;
}

export interface PlanInvestmentOption {
  id: string;
  planId: string;
  symbol: string;
  name: string;
  assetClass: string;
  morningstarRating: number;
  expenseRatio: number;
  oneYearReturn: number;
  threeYearReturn: number;
  fiveYearReturn: number;
  planAssets?: number;
  status: 'Approved' | 'Watchlist' | 'Replace Candidate';
  notes: string;
}

export interface PlanComplianceRecord {
  id: string;
  planId: string;
  year: number;
  form5500Status: 'Filed - Timely' | 'Pending Final Audit' | 'Draft';
  adpTestResult: 'Passed' | 'Correction Required';
  acpTestResult: 'Passed' | 'Correction Required';
  topHeavyStatus: 'Passed (Non-Top Heavy)';
  contributionLimitsYear: number;
  nextAuditDate: string;
  complianceOfficer: string;
}

export interface ParticipantRecord {
  id: string;
  planId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  hireDate: string;
  age: number;
  totalBalance: number;
  vestedBalance: number;
  deferralRatePercent: number;
  rothDeferralPercent: number;
  employerMatchYTD: number;
  loanBalance: number;
  retirementReadinessScore: number; // 0 - 100
  projectedMonthlyIncome: number;
  catchUpEligible: boolean;
  allocations: { fundSymbol: string; fundName: string; percent: number }[];
  beneficiaries: { name: string; relationship: string; percentage: number }[];
}

export type ApprovalRequestType =
  | 'trade'
  | 'rebalance'
  | 'tlh'
  | 'distribution'
  | 'beneficiary_update'
  | 'plan_action'
  | 'compliance_attestation'
  | 'account_correction';

export interface ApprovalRequest {
  id: string;
  requesterName: string;
  requesterRole: string;
  requestType: ApprovalRequestType;
  title: string;
  details: Record<string, any>;
  reason: string;
  requestedAt: string;
  status: 'Pending Review' | 'Approved' | 'Rejected' | 'Completed';
  reviewerName?: string;
  reviewerComments?: string;
  decisionAt?: string;
  auditEventId?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  objectAffected: string;
  previousValue: string;
  newValue: string;
  reason: string;
  approvalRequestId?: string;
}

export interface DataException {
  id: string;
  sourceSystem: 'Schwab Custody Feed' | 'Fidelity Records' | 'Apex Clearing' | 'Workday Payroll' | 'BNY Pershing';
  type: 'stale_feed' | 'unreconciled_cash' | 'duplicate_trade' | 'missing_lot' | 'census_mismatch';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  affectedEntity: string;
  previousValue?: string;
  currentValue?: string;
  detectedAt: string;
  status: 'Open' | 'Under Review' | 'Resolved';
  resolvedBy?: string;
  resolutionNotes?: string;
}

export interface AppNotification {
  id: string;
  targetRoleCategories?: UserCategory[];
  targetRoles?: UserRole[];
  targetUserIds?: string[];
  category:
    | 'market_breach'
    | 'portfolio_threshold'
    | 'goal_status'
    | 'tax_opportunity'
    | 'rmd_deadline'
    | 'document_request'
    | 'meeting'
    | 'plan_deadline'
    | 'fund_review'
    | 'approval_request'
    | 'compliance_action';
  title: string;
  message: string;
  timestamp: string;
  priority: 'urgent' | 'medium' | 'info';
  isRead: boolean;
  linkModule: string;
  linkId?: string;
}

export interface MessageThread {
  id: string;
  subject: string;
  participantIds: string[];
  participantNames: string[];
  lastMessageAt: string;
  unread: boolean;
  messages: {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    timestamp: string;
    text: string;
    attachments?: { name: string; size: string }[];
  }[];
}

export interface Meeting {
  id: string;
  title: string;
  advisorName: string;
  clientOrSponsorName: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'Completed' | 'Pending Confirmation';
  agenda: string;
  virtualMeetingUrl?: string;
}

export interface ActionItem {
  id: string;
  title: string;
  description?: string;
  assignedTo: string;
  assignedRole: string;
  dueDate: string;
  completed: boolean;
  priority: 'High' | 'Medium' | 'Low';
  relatedEntity: string;
}
