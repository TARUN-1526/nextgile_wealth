import React, { useState, useEffect } from 'react';
import { reconciliationService, PROVIDER_STATUSES } from '../../../services/reconciliationService';
import { DataException, UserProfile } from '../../../types';
import { AuditHistoryTable } from '../../common/AuditHistoryTable';
import { PrototypeBadge } from '../../common/PrototypeBadge';
import {
  ShieldAlert,
  Server,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Edit3,
  Check,
  X,
  Radio,
  FileCheck,
  Clock,
} from 'lucide-react';

interface AuditComplianceModuleProps {
  currentUser: UserProfile;
}

export const AuditComplianceModule: React.FC<AuditComplianceModuleProps> = ({
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'audit_trail' | 'exceptions' | 'provider_health'>('audit_trail');
  const [exceptions, setExceptions] = useState<DataException[]>(reconciliationService.getExceptions());
  const [selectedException, setSelectedException] = useState<DataException | null>(null);

  // Correction workflow form state
  const [correctedValue, setCorrectedValue] = useState('');
  const [correctionReason, setCorrectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return reconciliationService.subscribe(() => {
      setExceptions(reconciliationService.getExceptions());
    });
  }, []);

  const handleOpenResolution = (exc: DataException) => {
    setSelectedException(exc);
    setCorrectedValue(exc.currentValue || '');
    setCorrectionReason('');
  };

  const handleSaveCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedException || !correctedValue.trim() || !correctionReason.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      reconciliationService.resolveException({
        exceptionId: selectedException.id,
        resolvedBy: currentUser,
        newValue: correctedValue,
        resolutionNotes: correctionReason,
      });
      setIsSubmitting(false);
      setSelectedException(null);
    }, 400);
  };

  const openExceptionsCount = exceptions.filter((e) => e.status === 'Open').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              Audit, Compliance & Custodial Reconciliation Engine
            </h1>
            <PrototypeBadge label="Immutable Audit System" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            SEC Rule 204-2 compliance ledger, custody feeds health, and exception remediation queue
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('audit_trail')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'audit_trail' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
            Audit Ledger
          </button>
          <button
            onClick={() => setActiveTab('exceptions')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'exceptions' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-indigo-600" />
            Exception Queue ({openExceptionsCount})
          </button>
          <button
            onClick={() => setActiveTab('provider_health')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'provider_health' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-indigo-600" />
            Provider Feeds ({PROVIDER_STATUSES.length})
          </button>
        </div>
      </div>

      {/* TAB 1: AUDIT TRAIL */}
      {activeTab === 'audit_trail' && (
        <div className="space-y-4">
          <AuditHistoryTable />
        </div>
      )}

      {/* TAB 2: EXCEPTION QUEUE */}
      {activeTab === 'exceptions' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Data Quality, Reconciliation & Exception Queue
                </h3>
                <p className="text-xs text-slate-500">
                  Detects duplicate records, stale data warnings, and tax-lot discrepancies
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                {openExceptionsCount} Pending Resolution
              </span>
            </div>

            <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 overflow-hidden bg-white">
              {exceptions.map((exc) => (
                <div key={exc.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          exc.severity === 'high'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {exc.severity} Priority
                      </span>
                      <span className="text-xs font-bold text-slate-900">{exc.type}</span>
                      <span className="text-[11px] text-slate-400">• Detected {exc.detectedAt}</span>
                    </div>

                    <p className="text-xs font-semibold text-slate-800">{exc.description}</p>
                    <p className="text-[11px] text-slate-500">Affected Entity: <span className="font-mono text-slate-700">{exc.affectedEntity}</span></p>

                    {exc.currentValue && (
                      <div className="text-[11px] text-slate-600 bg-slate-100 px-2.5 py-1 rounded inline-block font-mono">
                        Current Inconsistent Value: {exc.currentValue}
                      </div>
                    )}

                    {exc.status === 'Resolved' && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium pt-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Resolved by {exc.resolvedBy}: "{exc.resolutionNotes}"</span>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0">
                    {exc.status === 'Open' ? (
                      <button
                        onClick={() => handleOpenResolution(exc)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Review & Correct
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 rounded-full border border-emerald-200">
                        Resolved
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PROVIDER HEALTH */}
      {activeTab === 'provider_health' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Institutional Integration Feeds & Custodial Gateway Status
              </h3>
              <p className="text-xs text-slate-500">
                Real-time API latency, ingestion volume, and reconciliation health
              </p>
            </div>
            <PrototypeBadge label="Simulated Feeds" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROVIDER_STATUSES.map((prov) => (
              <div key={prov.name} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span
                        className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          prov.status === 'Healthy' ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                      />
                      <span
                        className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                          prov.status === 'Healthy' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                    </span>
                    <span className="text-xs font-bold text-slate-900 leading-snug">{prov.name}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      prov.status === 'Healthy'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {prov.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200/80">
                  <div>
                    <span className="text-slate-400 block">Feed Type:</span>
                    <span className="font-semibold text-slate-700">{prov.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Latency:</span>
                    <span className="font-mono font-semibold text-slate-800">{prov.latency}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Records Today:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {prov.recordsProcessedToday.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Unreconciled:</span>
                    <span
                      className={`font-mono font-bold ${
                        prov.unreconciledCount > 0 ? 'text-amber-700' : 'text-emerald-600'
                      }`}
                    >
                      {prov.unreconciledCount}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between">
                  <span>Last Handshake:</span>
                  <span>{prov.lastSync}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Correction Dialog Modal */}
      {selectedException && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-900">Custodial Feed Data Correction</h4>
              </div>
              <button
                onClick={() => setSelectedException(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCorrection} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                <span className="font-bold block">Correction Audit Mandate:</span>
                Every change creates an immutable SEC 204-2 compliance audit record tracking your user ID, previous value, corrected value, and rationale.
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Entity
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedException.affectedEntity}
                  className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Corrected Value
                </label>
                <input
                  type="text"
                  required
                  value={correctedValue}
                  onChange={(e) => setCorrectedValue(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Fiduciary Justification & Resolution Notes
                </label>
                <textarea
                  required
                  rows={3}
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="Explain source verification, trade ticket match, or custodian confirmation..."
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedException(null)}
                  className="px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Correction & Commit Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
