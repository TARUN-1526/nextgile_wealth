import { MOCK_AUDIT_EVENTS } from '../data/mockData';
import { AuditEvent, UserProfile } from '../types';

class AuditService {
  private events: AuditEvent[] = [...MOCK_AUDIT_EVENTS];
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

  getAllEvents(): AuditEvent[] {
    return [...this.events];
  }

  logEvent(params: {
    user: UserProfile;
    action: string;
    objectAffected: string;
    previousValue: string;
    newValue: string;
    reason: string;
    approvalRequestId?: string;
  }): AuditEvent {
    const newEvent: AuditEvent = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }) + ' EST',
      userName: params.user.name,
      userRole: params.user.title || params.user.role,
      action: params.action,
      objectAffected: params.objectAffected,
      previousValue: params.previousValue,
      newValue: params.newValue,
      reason: params.reason,
      approvalRequestId: params.approvalRequestId,
    };

    this.events.unshift(newEvent);
    this.notify();
    return newEvent;
  }

  recordEvent(params: {
    userName: string;
    userRole: string;
    action: string;
    objectAffected: string;
    previousValue: string;
    newValue: string;
    reason: string;
    approvalRequestId?: string;
  }): AuditEvent {
    const newEvent: AuditEvent = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }) + ' EST',
      userName: params.userName,
      userRole: params.userRole,
      action: params.action,
      objectAffected: params.objectAffected,
      previousValue: params.previousValue,
      newValue: params.newValue,
      reason: params.reason,
      approvalRequestId: params.approvalRequestId,
    };

    this.events.unshift(newEvent);
    this.notify();
    return newEvent;
  }
}

export const auditService = new AuditService();
