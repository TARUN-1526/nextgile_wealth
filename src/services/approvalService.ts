import { MOCK_APPROVAL_REQUESTS } from '../data/mockData';
import { ApprovalRequest, ApprovalRequestType, UserProfile } from '../types';
import { auditService } from './auditService';
import { apiClient } from './apiClient';

class ApprovalService {
  private requests: ApprovalRequest[] = [...MOCK_APPROVAL_REQUESTS];
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

  getAllRequests(): ApprovalRequest[] {
    return [...this.requests];
  }

  submitRequest(params: {
    user: UserProfile;
    requestType: ApprovalRequestType;
    title: string;
    details: Record<string, any>;
    reason: string;
  }): ApprovalRequest {
    const newRequest: ApprovalRequest = {
      id: `apr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      requesterName: params.user.name,
      requesterRole: params.user.title || params.user.role,
      requestType: params.requestType,
      title: params.title,
      details: params.details,
      reason: params.reason,
      requestedAt: new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      status: 'Pending Review',
    };

    this.requests.unshift(newRequest);

    // Track submission in audit log
    auditService.logEvent({
      user: params.user,
      action: `Approval Requested: ${params.requestType.toUpperCase()}`,
      objectAffected: params.title,
      previousValue: 'N/A (New Request Initiated)',
      newValue: 'Status: Pending Review',
      reason: params.reason,
      approvalRequestId: newRequest.id,
    });

    this.notify();
    return newRequest;
  }

  createRequest(params: {
    requesterName: string;
    requesterRole: string;
    requestType: ApprovalRequestType;
    title: string;
    details: Record<string, any>;
    reason: string;
  }): ApprovalRequest {
    const newRequest: ApprovalRequest = {
      id: `apr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      requesterName: params.requesterName,
      requesterRole: params.requesterRole,
      requestType: params.requestType,
      title: params.title,
      details: params.details,
      reason: params.reason,
      requestedAt: new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      status: 'Pending Review',
    };

    this.requests.unshift(newRequest);

    auditService.recordEvent({
      userName: params.requesterName,
      userRole: params.requesterRole,
      action: `Approval Requested: ${params.requestType.toUpperCase()}`,
      objectAffected: params.title,
      previousValue: 'N/A (New Request Initiated)',
      newValue: 'Status: Pending Review',
      reason: params.reason,
      approvalRequestId: newRequest.id,
    });

    this.notify();
    return newRequest;
  }

  reviewRequest(
    requestId: string,
    decision: 'Approved' | 'Rejected',
    comments: string,
    reviewer: UserProfile
  ): ApprovalRequest | null {
    const req = this.requests.find((r) => r.id === requestId);
    if (!req) return null;

    const prevStatus = req.status;
    req.status = decision;
    req.reviewerName = reviewer.name;
    req.reviewerComments = comments;
    req.decisionAt = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    // Create Audit Event
    auditService.logEvent({
      user: reviewer,
      action: `${req.requestType.toUpperCase()} ${decision}`,
      objectAffected: req.title,
      previousValue: `Status: ${prevStatus}`,
      newValue: `Status: ${decision}`,
      reason: comments || `Reviewed by ${reviewer.name} (${reviewer.title || reviewer.role})`,
      approvalRequestId: req.id,
    });

    apiClient.reviewApproval(requestId, decision, comments).catch((err) => {
      console.warn('[FastAPI Sync Warning] reviewApproval:', err.message);
    });

    this.notify();
    return req;
  }

  completeRequest(requestId: string, user: UserProfile): ApprovalRequest | null {
    const req = this.requests.find((r) => r.id === requestId);
    if (!req || req.status !== 'Approved') return null;

    req.status = 'Completed';

    apiClient.completeApproval(requestId).catch((err) => {
      console.warn('[FastAPI Sync Warning] completeApproval:', err.message);
    });

    auditService.logEvent({
      user,
      action: `${req.requestType.toUpperCase()} Execution Completed`,
      objectAffected: req.title,
      previousValue: 'Status: Approved (Pending Execution)',
      newValue: 'Status: Completed (Executed in Custody)',
      reason: 'Automated custody execution and book-of-record reconciliation complete.',
      approvalRequestId: req.id,
    });

    this.notify();
    return req;
  }
}

export const approvalService = new ApprovalService();
