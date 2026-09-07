import { MOCK_DATA_EXCEPTIONS } from '../data/mockData';
import { DataException, UserProfile } from '../types';
import { auditService } from './auditService';
import { apiClient } from './apiClient';

export interface ProviderHealth {
  name: string;
  type: 'Custodian' | 'Recordkeeper' | 'Banking' | 'Payroll' | 'Market Data';
  status: 'Healthy' | 'Degraded' | 'Syncing' | 'Offline';
  latency: string;
  lastSync: string;
  recordsProcessedToday: number;
  unreconciledCount: number;
}

export const PROVIDER_STATUSES: ProviderHealth[] = [
  {
    name: 'Charles Schwab Institutional API',
    type: 'Custodian',
    status: 'Healthy',
    latency: '142ms',
    lastSync: '2 minutes ago',
    recordsProcessedToday: 18450,
    unreconciledCount: 1,
  },
  {
    name: 'Fidelity Institutional Custody Feed',
    type: 'Custodian',
    status: 'Healthy',
    latency: '185ms',
    lastSync: '5 minutes ago',
    recordsProcessedToday: 12100,
    unreconciledCount: 0,
  },
  {
    name: 'BNY Mellon Pershing Trust Gateway',
    type: 'Custodian',
    status: 'Healthy',
    latency: '210ms',
    lastSync: '12 minutes ago',
    recordsProcessedToday: 4920,
    unreconciledCount: 0,
  },
  {
    name: 'Apex Clearing Omni-Settlement Feed',
    type: 'Custodian',
    status: 'Degraded',
    latency: '890ms',
    lastSync: '48 minutes ago',
    recordsProcessedToday: 6800,
    unreconciledCount: 1,
  },
  {
    name: 'Workday HR / Payroll Census Sync',
    type: 'Payroll',
    status: 'Degraded',
    latency: '340ms',
    lastSync: '1 hour ago',
    recordsProcessedToday: 341,
    unreconciledCount: 1,
  },
  {
    name: 'JPMorgan Chase Treasury Aggregator',
    type: 'Banking',
    status: 'Healthy',
    latency: '110ms',
    lastSync: '4 minutes ago',
    recordsProcessedToday: 1450,
    unreconciledCount: 0,
  },
];

class ReconciliationService {
  private exceptions: DataException[] = [...MOCK_DATA_EXCEPTIONS];
  private listeners: (() => void)[] = [];

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  getExceptions(): DataException[] {
    return [...this.exceptions];
  }

  resolveException(params: {
    exceptionId: string;
    resolvedBy: UserProfile;
    newValue: string;
    resolutionNotes: string;
  }): DataException | null {
    const exc = this.exceptions.find((e) => e.id === params.exceptionId);
    if (!exc) return null;

    const prevValue = exc.currentValue || 'Unspecified';
    exc.status = 'Resolved';
    exc.resolvedBy = params.resolvedBy.name;
    exc.resolutionNotes = params.resolutionNotes;

    // Log to audit service with before and after value
    auditService.logEvent({
      user: params.resolvedBy,
      action: `Data Exception Resolved (${exc.type})`,
      objectAffected: exc.affectedEntity,
      previousValue: prevValue,
      newValue: params.newValue,
      reason: params.resolutionNotes,
    });

    apiClient.resolveException(params.exceptionId, params.newValue, params.resolutionNotes).catch((err) => {
      console.warn('[FastAPI Sync Warning] resolveException:', err.message);
    });

    this.notify();
    return exc;
  }
}

export const reconciliationService = new ReconciliationService();
