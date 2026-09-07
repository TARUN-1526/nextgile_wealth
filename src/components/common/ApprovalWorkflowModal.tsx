import React, { useState } from 'react';
import { ApprovalRequest, ApprovalRequestType, UserProfile } from '../../types';
import { approvalService } from '../../services/approvalService';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  AlertCircle,
  FileCheck,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';

interface ApprovalWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  selectedRequest?: ApprovalRequest | null;
  mode?: 'view_review' | 'create_new';
  initialType?: ApprovalRequestType;
}

export const ApprovalWorkflowModal: React.FC<ApprovalWorkflowModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  selectedRequest,
  mode = 'view_review',
  initialType = 'tlh',
}) => {
  // Reviewer comment state
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Request Form state
  const [requestType, setRequestType] = useState<ApprovalRequestType>(initialType);
  const [title, setTitle] = useState('');
  const [reason, setReason] = useState('');
  const [detailAmount, setDetailAmount] = useState('');
  const [detailAccount, setDetailAccount] = useState('Richard Vance Taxable (••••-8491)');

  if (!isOpen) return null;

  const handleDecision = (decision: 'Approved' | 'Rejected') => {
    if (!selectedRequest) return;
    setIsSubmitting(true);
    setTimeout(() => {
      approvalService.reviewRequest(selectedRequest.id, decision, comments, currentUser);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const handleExecuteCompletion = () => {
    if (!selectedRequest) return;
    setIsSubmitting(true);
    setTimeout(() => {
      approvalService.completeRequest(selectedRequest.id, currentUser);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !reason.trim()) return;

    approvalService.submitRequest({
      user: currentUser,
      requestType,
      title,
      details: {
        amount: detailAmount ? parseFloat(detailAmount) : undefined,
        account: detailAccount,
        submittedVia: 'Nexgile Fiduciary Portal',
      },
      reason,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">
                {mode === 'create_new' ? 'Initiate Fiduciary Approval Request' : 'Fiduciary Review & Authorization Workflow'}
              </h3>
              <p className="text-xs text-slate-500">
                Multi-signature governance and compliance audit trail
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form or Details */}
        {mode === 'create_new' ? (
          <form onSubmit={handleCreateRequest} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Approval Action Type
              </label>
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value as ApprovalRequestType)}
                className="w-full text-sm rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="trade">Trade Authorization</option>
                <option value="rebalance">Portfolio Rebalancing Proposal</option>
                <option value="tlh">Tax-Loss Harvesting (TLH)</option>
                <option value="distribution">Trust / Cash Distribution</option>
                <option value="beneficiary_update">Beneficiary Allocation Change</option>
                <option value="plan_action">Institutional 401(k) Plan Amendment</option>
                <option value="compliance_attestation">Annual Compliance Attestation</option>
                <option value="account_correction">Custody Feed Account Correction</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Request Title / Subject
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Sell $150,000 Apple Inc. to fund real estate acquisition"
                required
                className="w-full text-sm rounded-lg border border-slate-300 p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Affected Account
                </label>
                <input
                  type="text"
                  value={detailAccount}
                  onChange={(e) => setDetailAccount(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Transaction Amount ($)
                </label>
                <input
                  type="number"
                  value={detailAmount}
                  onChange={(e) => setDetailAmount(e.target.value)}
                  placeholder="Optional, e.g. 50000"
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Fiduciary Justification & Reason
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                required
                placeholder="Detail why this action is requested, tax consequences considered, and client authorization status..."
                className="w-full text-sm rounded-lg border border-slate-300 p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Submit for Fiduciary Review
              </button>
            </div>
          </form>
        ) : selectedRequest ? (
          <div className="p-6 space-y-5 text-sm max-h-[75vh] overflow-y-auto">
            {/* Step Progress Tracker */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
                <span>1. REQUEST</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span>2. PENDING REVIEW</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span>3. APPROVED / REJECTED</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span>4. COMPLETED</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Current Lifecycle:</span>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    selectedRequest.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedRequest.status === 'Approved'
                      ? 'bg-blue-100 text-blue-800'
                      : selectedRequest.status === 'Rejected'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {selectedRequest.status === 'Completed' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : selectedRequest.status === 'Approved' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : selectedRequest.status === 'Rejected' ? (
                    <XCircle className="w-3.5 h-3.5" />
                  ) : (
                    <Clock className="w-3.5 h-3.5" />
                  )}
                  {selectedRequest.status}
                </span>
              </div>
            </div>

            {/* Request Details Card */}
            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Request Item
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-0.5">{selectedRequest.title}</h4>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500">Requester:</span>
                  <p className="font-semibold text-slate-800">{selectedRequest.requesterName}</p>
                  <p className="text-slate-500 text-[11px]">{selectedRequest.requesterRole}</p>
                </div>
                <div>
                  <span className="text-slate-500">Submission Date:</span>
                  <p className="font-semibold text-slate-800">{selectedRequest.requestedAt}</p>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Supporting Information & Parameters
                </span>
                <div className="bg-slate-900 text-slate-200 p-3.5 rounded-lg font-mono text-xs mt-1 overflow-x-auto">
                  <pre>{JSON.stringify(selectedRequest.details, null, 2)}</pre>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Stated Fiduciary Reason
                </span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 mt-1 leading-relaxed">
                  {selectedRequest.reason}
                </p>
              </div>
            </div>

            {/* Review Decision Outcome if already reviewed */}
            {selectedRequest.reviewerName && (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Review Decision:</span>
                  <span className="text-xs font-semibold text-slate-800">
                    Decided by {selectedRequest.reviewerName} on {selectedRequest.decisionAt}
                  </span>
                </div>
                {selectedRequest.reviewerComments && (
                  <p className="text-xs text-slate-700 italic bg-white p-2.5 rounded border border-slate-200">
                    "{selectedRequest.reviewerComments}"
                  </p>
                )}
              </div>
            )}

            {/* Action Box for Reviewers */}
            {selectedRequest.status === 'Pending Review' && (
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3">
                <h5 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-indigo-700" />
                  Reviewer Decision Sign-Off (Current User: {currentUser.name})
                </h5>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Enter fiduciary comments or compliance verification notes..."
                  rows={2}
                  className="w-full text-xs rounded-lg border border-indigo-200 p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex items-center justify-end gap-2.5 pt-1">
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleDecision('Rejected')}
                    className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject Request
                  </button>
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleDecision('Approved')}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve & Sign-off
                  </button>
                </div>
              </div>
            )}

            {/* Execution Completion button for Approved requests */}
            {selectedRequest.status === 'Approved' && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-blue-900">Ready for Execution</h5>
                  <p className="text-[11px] text-blue-700">
                    Fiduciary approval confirmed. Ready to execute custodial order and write to book of record.
                  </p>
                </div>
                <button
                  disabled={isSubmitting}
                  onClick={handleExecuteCompletion}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shrink-0"
                >
                  Mark as Executed & Completed
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-sm">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            No request selected.
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
