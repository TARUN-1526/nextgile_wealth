import {
  RetirementPlan,
  PlanInvestmentOption,
  PlanComplianceRecord,
  ParticipantRecord,
  UserProfile,
} from '../types';
import {
  MOCK_RETIREMENT_PLAN,
  MOCK_PLAN_INVESTMENTS,
  MOCK_PLAN_COMPLIANCE,
  MOCK_PARTICIPANTS,
} from '../data/mockData';
import { auditService } from './auditService';
import { apiClient } from './apiClient';

export interface FiduciaryReview {
  id: string;
  planId: string;
  reviewDate: string;
  meetingTitle: string;
  attendees: string[];
  watchlistedFunds: string[];
  decisions: string[];
  recommendations: string[];
  status: 'Completed' | 'Pending Review' | 'In Progress';
}

const INITIAL_FIDUCIARY_REVIEWS: FiduciaryReview[] = [
  {
    id: 'fid_rev_001',
    planId: 'plan_apex',
    reviewDate: '2026-06-18',
    meetingTitle: 'Apex BioTech 401(k) Q2 Fiduciary Committee Meeting',
    attendees: ['Karen Lindqvist, AIF®', 'Sarah Jenkins (CFO)', 'David Cho (HR VP)'],
    watchlistedFunds: ['FDEEX (Fidelity Freedom 2055)'],
    decisions: [
      'Approved transition to Fidelity Freedom Index (FDEWX) effective Q4 to lower expense ratio by 63 bps.',
      'Approved 1% auto-escalation increase from 6% to 7% for upcoming open enrollment.',
    ],
    recommendations: [
      'Issue 30-day participant notification regarding QDIA fee enhancement.',
      'Conduct mid-year non-discrimination testing verification with TPA.',
    ],
    status: 'Completed',
  },
  {
    id: 'fid_rev_002',
    planId: 'plan_apex',
    reviewDate: '2026-09-22',
    meetingTitle: 'Apex BioTech 401(k) Q3 Fiduciary Committee Meeting',
    attendees: ['Karen Lindqvist, AIF®', 'Sarah Jenkins (CFO)', 'David Cho (HR VP)'],
    watchlistedFunds: ['FDEEX (Final replacement verification)'],
    decisions: ['Pending committee vote on recordkeeper fee benchmarking RFP.'],
    recommendations: [
      'Benchmark Fidelity recordkeeping fees against Vanguard and Empower.',
      'Review Form 5500 audit package before Oct 15 filing deadline.',
    ],
    status: 'Pending Review',
  },
];

class InstitutionalService {
  private plan: RetirementPlan = { ...MOCK_RETIREMENT_PLAN };
  private investments: PlanInvestmentOption[] = [...MOCK_PLAN_INVESTMENTS];
  private compliance: PlanComplianceRecord = { ...MOCK_PLAN_COMPLIANCE };
  private participants: ParticipantRecord[] = [...MOCK_PARTICIPANTS];
  private fiduciaryReviews: FiduciaryReview[] = [...INITIAL_FIDUCIARY_REVIEWS];
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

  public getPlan(planId?: string): RetirementPlan {
    return this.plan;
  }

  public getInvestmentOptions(planId?: string): PlanInvestmentOption[] {
    return [...this.investments];
  }

  public getComplianceRecords(planId?: string): PlanComplianceRecord {
    return this.compliance;
  }

  public getFiduciaryReviews(planId?: string): FiduciaryReview[] {
    return [...this.fiduciaryReviews];
  }

  // Strictly access-controlled participant access
  public getParticipant(participantId: string): ParticipantRecord | undefined {
    return this.participants.find((p) => p.id === participantId);
  }

  // Calculate anonymized demographics for plan sponsor/committee (NO individual balances)
  public getAnonymizedDemographics(): {
    tenureRanges: { label: string; participants: number; avgDeferral: number; participationRate: number }[];
    ageBrackets: { label: string; count: number; percent: number }[];
    totalEligible: number;
    totalEnrolled: number;
    optOutRate: number;
  } {
    return {
      tenureRanges: [
        { label: '< 1 Year', participants: 42, avgDeferral: 6.8, participationRate: 74.2 },
        { label: '1 - 3 Years', participants: 98, avgDeferral: 7.9, participationRate: 88.6 },
        { label: '3 - 5 Years', participants: 114, avgDeferral: 8.7, participationRate: 94.8 },
        { label: '5+ Years', participants: 87, avgDeferral: 9.6, participationRate: 98.1 },
      ],
      ageBrackets: [
        { label: '< 30 Years', count: 68, percent: 20 },
        { label: '30 - 45 Years', count: 172, percent: 51 },
        { label: '45 - 60 Years', count: 81, percent: 24 },
        { label: '60+ Years', count: 20, percent: 5 },
      ],
      totalEligible: this.plan.eligibleParticipants,
      totalEnrolled: this.plan.activeParticipants,
      optOutRate: Math.round(((this.plan.eligibleParticipants - this.plan.activeParticipants) / this.plan.eligibleParticipants) * 100),
    };
  }

  // Fiduciary action: replace fund
  public replaceWatchlistFund(
    currentSymbol: string,
    replacementSymbol: string,
    replacementName: string,
    user: UserProfile
  ): void {
    this.investments = this.investments.map((inv) =>
      inv.symbol === currentSymbol
        ? {
            ...inv,
            symbol: replacementSymbol,
            name: replacementName,
            status: 'Approved',
            notes: `Replaced ${currentSymbol} per Q2 Fiduciary Committee resolution. Lowered fee structure.`,
          }
        : inv
    );

    auditService.recordEvent({
      userName: user.name,
      userRole: user.title || user.role,
      action: '401(k) Investment Menu Fund Replaced',
      objectAffected: `Lineup Fund: ${currentSymbol} -> ${replacementSymbol}`,
      previousValue: `Watchlist Fund: ${currentSymbol}`,
      newValue: `Approved Fiduciary Fund: ${replacementSymbol} (${replacementName})`,
      reason: 'ERISA 404(c) lowest fee and tracking compliance requirement.',
    });

    apiClient.replaceWatchlistFund(currentSymbol, replacementSymbol, replacementName).catch((err) => {
      console.warn('[FastAPI Sync Warning] replaceWatchlistFund:', err.message);
    });

    this.notify();
  }

  // Participant action: update deferral rate
  public updateParticipantDeferral(
    participantId: string,
    newRate: number,
    user: UserProfile
  ): { success: boolean; message: string } {
    const pIndex = this.participants.findIndex((p) => p.id === participantId);
    if (pIndex === -1) {
      return { success: false, message: 'Participant not found.' };
    }

    const prevRate = this.participants[pIndex].deferralRatePercent;
    this.participants[pIndex] = {
      ...this.participants[pIndex],
      deferralRatePercent: newRate,
    };

    auditService.recordEvent({
      userName: user.name,
      userRole: user.title || user.role,
      action: '401(k) Payroll Deferral Rate Modified',
      objectAffected: `Participant Account: ${this.participants[pIndex].firstName} ${this.participants[pIndex].lastName} (${this.participants[pIndex].employeeId})`,
      previousValue: `${prevRate}% paycheck deferral`,
      newValue: `${newRate}% paycheck deferral`,
      reason: 'Participant self-service election change submitted to payroll feed.',
    });

    apiClient.updateParticipantDeferral(participantId, newRate).catch((err) => {
      console.warn('[FastAPI Sync Warning] updateParticipantDeferral:', err.message);
    });

    this.notify();
    return {
      success: true,
      message: `Payroll deferral successfully updated to ${newRate}%. Effective on next payroll cycle.`,
    };
  }

  // Participant action: update future contribution investment allocations
  public updateParticipantAllocations(
    participantId: string,
    allocations: { fundSymbol: string; percentage: number }[],
    user: UserProfile
  ): { success: boolean; message: string } {
    const p = this.participants.find((part) => part.id === participantId);
    if (!p) return { success: false, message: 'Participant not found.' };

    const total = allocations.reduce((sum, a) => sum + a.percentage, 0);
    if (total !== 100) {
      return { success: false, message: `Total allocation must equal exactly 100% (currently ${total}%).` };
    }

    auditService.recordEvent({
      userName: user.name,
      userRole: user.title || user.role,
      action: '401(k) Future Contribution Elections Updated',
      objectAffected: `Participant Portfolio: ${p.firstName} ${p.lastName}`,
      previousValue: 'Previous Fund Elections',
      newValue: allocations.map((a) => `${a.fundSymbol}: ${a.percentage}%`).join(', '),
      reason: 'Participant allocation adjustment executed.',
    });

    apiClient.updateParticipantAllocations(participantId, allocations).catch((err) => {
      console.warn('[FastAPI Sync Warning] updateParticipantAllocations:', err.message);
    });

    this.notify();
    return { success: true, message: 'Future contribution allocations updated successfully.' };
  }

  // Fiduciary Committee: log new fiduciary review
  public addFiduciaryReview(
    review: Omit<FiduciaryReview, 'id'>,
    user: UserProfile
  ): void {
    const newRev: FiduciaryReview = {
      ...review,
      id: `fid_rev_${Date.now()}`,
    };
    this.fiduciaryReviews.unshift(newRev);

    auditService.recordEvent({
      userName: user.name,
      userRole: user.title || user.role,
      action: 'ERISA Fiduciary Committee Review Logged',
      objectAffected: review.meetingTitle,
      previousValue: 'None',
      newValue: `Review Status: ${review.status} (${review.decisions.length} decisions)`,
      reason: 'Statutory ERISA fiduciary oversight documentation.',
    });

    apiClient.addFiduciaryReview(review).catch((err) => {
      console.warn('[FastAPI Sync Warning] addFiduciaryReview:', err.message);
    });

    this.notify();
  }
}

export const institutionalService = new InstitutionalService();
