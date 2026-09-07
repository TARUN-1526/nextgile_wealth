/**
 * Nexgile-WealthAgent Fiduciary API Client
 * Connects the React/Vite frontend to the FastAPI + Supabase REST API.
 */

import {
  UserProfile,
  Household,
  Account,
  Holding,
  Goal,
  ApprovalRequest,
  ApprovalRequestType,
  AuditEvent,
  TaxOpportunity,
  WashSaleRecord,
  RmdRecord,
  RebalanceProposal,
  AdvisorRecommendation,
  RetirementPlan,
  PlanInvestmentOption,
  ParticipantRecord,
  DataException,
  MessageThread,
  Meeting,
  ActionItem,
  AppNotification,
} from '../types';

class ApiClient {
  private baseUrl: string = '/api';
  private currentUserId: string = 'user_richard_vance';

  public setCurrentUserId(userId: string) {
    this.currentUserId = userId;
  }

  public getCurrentUserId(): string {
    return this.currentUserId;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-User-Id': this.currentUserId,
      ...((options.headers as Record<string, string>) || {}),
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (err: any) {
      console.warn(`[FastAPI Request Warning] ${endpoint}:`, err.message);
      throw err;
    }
  }

  // --- Health ---
  public async checkHealth(): Promise<any> {
    return this.request('/health');
  }

  // --- Users & Personas ---
  public async getUsers(): Promise<UserProfile[]> {
    return this.request<UserProfile[]>('/users');
  }

  public async getMe(): Promise<UserProfile> {
    return this.request<UserProfile>('/users/me');
  }

  // --- Households & Accounts ---
  public async getHouseholds(): Promise<Household[]> {
    return this.request<Household[]>('/households');
  }

  public async getHousehold(id: string): Promise<Household> {
    return this.request<Household>(`/households/${id}`);
  }

  public async getHouseholdAccounts(householdId: string): Promise<Account[]> {
    return this.request<Account[]>(`/households/${householdId}/accounts`);
  }

  public async getHouseholdGoals(householdId: string): Promise<Goal[]> {
    return this.request<Goal[]>(`/households/${householdId}/goals`);
  }

  public async createGoal(householdId: string, data: Partial<Goal>): Promise<Goal> {
    return this.request<Goal>(`/households/${householdId}/goals`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getAccounts(householdId?: string): Promise<Account[]> {
    const query = householdId ? `?household_id=${householdId}` : '';
    return this.request<Account[]>(`/accounts${query}`);
  }

  public async getAccount(id: string): Promise<Account> {
    return this.request<Account>(`/accounts/${id}`);
  }

  public async getHoldings(accountId: string): Promise<Holding[]> {
    return this.request<Holding[]>(`/accounts/${accountId}/holdings`);
  }

  // --- Portfolio & Trading ---
  public async getRebalanceProposals(householdId?: string): Promise<RebalanceProposal[]> {
    const query = householdId ? `?household_id=${householdId}` : '';
    return this.request<RebalanceProposal[]>(`/portfolio/proposals${query}`);
  }

  public async createRebalanceProposal(payload: {
    householdId: string;
    modelName: string;
    targetDriftPercent: number;
    fiduciaryRationale: string;
  }): Promise<RebalanceProposal> {
    return this.request<RebalanceProposal>('/portfolio/proposals', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async submitRebalanceProposal(proposalId: string): Promise<RebalanceProposal> {
    return this.request<RebalanceProposal>(`/portfolio/proposals/${proposalId}/submit`, {
      method: 'POST',
    });
  }

  public async executeRebalanceProposal(proposalId: string): Promise<RebalanceProposal> {
    return this.request<RebalanceProposal>(`/portfolio/proposals/${proposalId}/execute`, {
      method: 'POST',
    });
  }

  public async getRecommendations(householdId?: string): Promise<AdvisorRecommendation[]> {
    const query = householdId ? `?household_id=${householdId}` : '';
    return this.request<AdvisorRecommendation[]>(`/portfolio/recommendations${query}`);
  }

  // --- Tax & Estate ---
  public async getTaxOpportunities(householdId?: string): Promise<TaxOpportunity[]> {
    const query = householdId ? `?household_id=${householdId}` : '';
    return this.request<TaxOpportunity[]>(`/tax/opportunities${query}`);
  }

  public async executeTaxHarvest(payload: {
    opportunityId: string;
    householdId: string;
    accountId: string;
    holdingSymbol: string;
    replacementCandidate: string;
    estimatedLoss: number;
    estimatedTaxSavings: number;
    taxYear: number;
    notes?: string;
  }): Promise<any> {
    return this.request('/tax/harvest', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getWashSales(householdId?: string): Promise<WashSaleRecord[]> {
    const query = householdId ? `?household_id=${householdId}` : '';
    return this.request<WashSaleRecord[]>(`/tax/wash-sales${query}`);
  }

  public async getRmdRecords(householdId?: string): Promise<RmdRecord[]> {
    const query = householdId ? `?household_id=${householdId}` : '';
    return this.request<RmdRecord[]>(`/tax/rmd${query}`);
  }

  public async distributeRmd(rmdId: string, amount: number, distributionType: string, notes?: string): Promise<any> {
    return this.request(`/tax/rmd/${rmdId}/distribute`, {
      method: 'POST',
      body: JSON.stringify({ amount, distributionType, notes }),
    });
  }

  public async getEstatePlan(householdId: string = 'hh_vance'): Promise<any> {
    return this.request(`/tax/estate?household_id=${householdId}`);
  }

  public async getDaf(householdId: string = 'hh_vance'): Promise<any> {
    return this.request(`/tax/daf?household_id=${householdId}`);
  }

  // --- Institutional Retirement (ERISA 404c) ---
  public async getRetirementPlan(planId: string = 'plan_apex'): Promise<RetirementPlan> {
    return this.request<RetirementPlan>(`/institutional/plan?plan_id=${planId}`);
  }

  public async getPlanInvestments(planId: string = 'plan_apex'): Promise<PlanInvestmentOption[]> {
    return this.request<PlanInvestmentOption[]>(`/institutional/investments?plan_id=${planId}`);
  }

  public async replaceWatchlistFund(currentSymbol: string, replacementSymbol: string, replacementName: string): Promise<any> {
    return this.request('/institutional/investments/replace', {
      method: 'POST',
      body: JSON.stringify({ currentSymbol, replacementSymbol, replacementName }),
    });
  }

  public async getPlanCompliance(planId: string = 'plan_apex'): Promise<any> {
    return this.request(`/institutional/compliance?plan_id=${planId}`);
  }

  public async getAnonymizedDemographics(planId: string = 'plan_apex'): Promise<any> {
    return this.request(`/institutional/demographics?plan_id=${planId}`);
  }

  public async getParticipants(planId: string = 'plan_apex'): Promise<ParticipantRecord[]> {
    return this.request<ParticipantRecord[]>(`/institutional/participants?plan_id=${planId}`);
  }

  public async getParticipant(participantId: string): Promise<ParticipantRecord> {
    return this.request<ParticipantRecord>(`/institutional/participants/${participantId}`);
  }

  public async updateParticipantDeferral(participantId: string, newRate: number): Promise<any> {
    return this.request(`/institutional/participants/${participantId}/deferral`, {
      method: 'POST',
      body: JSON.stringify({ newRate }),
    });
  }

  public async updateParticipantAllocations(participantId: string, allocations: any[]): Promise<any> {
    return this.request(`/institutional/participants/${participantId}/allocations`, {
      method: 'POST',
      body: JSON.stringify({ allocations }),
    });
  }

  public async getFiduciaryReviews(planId: string = 'plan_apex'): Promise<any[]> {
    return this.request(`/institutional/fiduciary-reviews?plan_id=${planId}`);
  }

  public async addFiduciaryReview(reviewData: any): Promise<any> {
    return this.request('/institutional/fiduciary-reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  // --- Governance, Approvals & SEC Rule 204-2 Audit ---
  public async getApprovals(): Promise<ApprovalRequest[]> {
    return this.request<ApprovalRequest[]>('/governance/approvals');
  }

  public async submitApproval(payload: {
    requestType: ApprovalRequestType;
    title: string;
    details: Record<string, any>;
    reason: string;
  }): Promise<ApprovalRequest> {
    return this.request<ApprovalRequest>('/governance/approvals', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async reviewApproval(
    approvalId: string,
    decision: 'Approved' | 'Rejected',
    reviewerComments?: string
  ): Promise<ApprovalRequest> {
    return this.request<ApprovalRequest>(`/governance/approvals/${approvalId}/review`, {
      method: 'POST',
      body: JSON.stringify({ decision, reviewerComments }),
    });
  }

  public async completeApproval(approvalId: string): Promise<ApprovalRequest> {
    return this.request<ApprovalRequest>(`/governance/approvals/${approvalId}/complete`, {
      method: 'POST',
    });
  }

  public async getAuditEvents(): Promise<AuditEvent[]> {
    return this.request<AuditEvent[]>('/governance/audit-events');
  }

  public async getExceptions(): Promise<DataException[]> {
    return this.request<DataException[]>('/governance/exceptions');
  }

  public async resolveException(excId: string, newValue: string, resolutionNotes: string): Promise<DataException> {
    return this.request<DataException>(`/governance/exceptions/${excId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ newValue, resolutionNotes }),
    });
  }

  public async getProviders(): Promise<any[]> {
    return this.request<any[]>('/governance/providers');
  }

  // --- Communication & Workflows ---
  public async getThreads(): Promise<MessageThread[]> {
    return this.request<MessageThread[]>('/communication/threads');
  }

  public async sendMessage(threadId: string, text: string, attachments?: any[]): Promise<any> {
    return this.request(`/communication/threads/${threadId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text, attachments }),
    });
  }

  public async getMeetings(): Promise<Meeting[]> {
    return this.request<Meeting[]>('/communication/meetings');
  }

  public async createMeeting(meetingData: any): Promise<Meeting> {
    return this.request<Meeting>('/communication/meetings', {
      method: 'POST',
      body: JSON.stringify(meetingData),
    });
  }

  public async getActionItems(): Promise<ActionItem[]> {
    return this.request<ActionItem[]>('/communication/action-items');
  }

  public async createActionItem(itemData: any): Promise<ActionItem> {
    return this.request<ActionItem>('/communication/action-items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  public async toggleActionItem(itemId: string): Promise<ActionItem> {
    return this.request<ActionItem>(`/communication/action-items/${itemId}/toggle`, {
      method: 'PATCH',
    });
  }

  public async getNotifications(): Promise<AppNotification[]> {
    return this.request<AppNotification[]>('/communication/notifications');
  }

  public async markNotificationRead(id: string): Promise<any> {
    return this.request(`/communication/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  // --- Reporting ---
  public async generateReport(payload: {
    reportType: string;
    householdId?: string;
    planId?: string;
    format?: 'json' | 'csv';
  }): Promise<any> {
    return this.request('/reporting/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const apiClient = new ApiClient();
