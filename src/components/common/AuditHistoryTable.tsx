import React, { useState, useEffect } from 'react';
import { auditService } from '../../services/auditService';
import { AuditEvent } from '../../types';
import { Shield, Search, Filter, ArrowUpDown } from 'lucide-react';

interface AuditHistoryTableProps {
  filterObject?: string;
  limit?: number;
}

export const AuditHistoryTable: React.FC<AuditHistoryTableProps> = ({
  filterObject,
  limit,
}) => {
  const [events, setEvents] = useState<AuditEvent[]>(auditService.getAllEvents());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');

  useEffect(() => {
    return auditService.subscribe(() => {
      setEvents(auditService.getAllEvents());
    });
  }, []);

  const filteredEvents = events.filter((ev) => {
    if (filterObject && !ev.objectAffected.toLowerCase().includes(filterObject.toLowerCase())) {
      return false;
    }
    if (selectedRoleFilter !== 'ALL' && !ev.userRole.toLowerCase().includes(selectedRoleFilter.toLowerCase())) {
      return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        ev.action.toLowerCase().includes(q) ||
        ev.userName.toLowerCase().includes(q) ||
        ev.objectAffected.toLowerCase().includes(q) ||
        ev.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const displayList = limit ? filteredEvents.slice(0, limit) : filteredEvents;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header bar with search and filters */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-200 text-slate-700 rounded-lg">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Cryptographic Audit & Compliance History</h4>
            <p className="text-[11px] text-slate-500">Immutable ledger of state alterations and sign-offs</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700"
          >
            <option value="ALL">All Roles</option>
            <option value="Advisor">Advisor</option>
            <option value="Fiduciary">Fiduciary</option>
            <option value="Compliance">Compliance</option>
            <option value="Operations">Operations</option>
            <option value="Estate">Estate Legal</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-100/75 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-2.5 px-4">Timestamp</th>
              <th className="py-2.5 px-4">Actor</th>
              <th className="py-2.5 px-4">Action</th>
              <th className="py-2.5 px-4">Object Affected</th>
              <th className="py-2.5 px-4">State Transition (Prev → New)</th>
              <th className="py-2.5 px-4">Reason / Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {displayList.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                  No audit events found matching the criteria.
                </td>
              </tr>
            ) : (
              displayList.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {ev.timestamp}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-semibold text-slate-800">{ev.userName}</span>
                    <span className="block text-[10px] text-slate-500">{ev.userRole}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                      {ev.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {ev.objectAffected}
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="space-y-0.5 text-[11px]">
                      <div className="text-slate-500 truncate" title={ev.previousValue}>
                        <span className="font-semibold text-slate-400">Prev:</span> {ev.previousValue}
                      </div>
                      <div className="text-indigo-700 font-medium truncate" title={ev.newValue}>
                        <span className="font-semibold text-indigo-500">New:</span> {ev.newValue}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 max-w-sm text-[11px] text-slate-600 leading-snug">
                    {ev.reason}
                    {ev.approvalRequestId && (
                      <span className="block text-[10px] font-mono text-indigo-600 mt-0.5">
                        Ref: #{ev.approvalRequestId}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
