import React, { useState } from 'react';
import { UserProfile } from '../../../types';
import { MOCK_HOUSEHOLDS } from '../../../data/mockData';
import { reportingService, GeneratedReport, ReportFilterOptions } from '../../../services/reportingService';
import { FinancialFigure } from '../../common/FinancialFigure';
import { PrototypeBadge } from '../../common/PrototypeBadge';
import {
  FileText,
  Download,
  Filter,
  Calendar,
  Layers,
  PieChart,
  ShieldCheck,
  Building2,
  Users,
  CheckCircle2,
  Table,
} from 'lucide-react';

interface ReportingModuleProps {
  currentUser: UserProfile;
}

export const ReportingModule: React.FC<ReportingModuleProps> = ({ currentUser }) => {
  const [reportType, setReportType] = useState<ReportFilterOptions['reportType']>('portfolio_summary');
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string>('hh_vance');
  const [currentReport, setCurrentReport] = useState<GeneratedReport>(
    reportingService.generateReport({
      reportType: 'portfolio_summary',
      householdId: 'hh_vance',
    })
  );
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleGenerate = (type: ReportFilterOptions['reportType']) => {
    setReportType(type);
    const rep = reportingService.generateReport({
      reportType: type,
      householdId: selectedHouseholdId,
    });
    setCurrentReport(rep);
  };

  const handleExportCsv = () => {
    reportingService.exportReportCsv(currentReport);
    setDownloadSuccess(`Exported "${currentReport.title}.csv"`);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              Reporting, Disclosures & Fiduciary Exports Studio
            </h1>
            <PrototypeBadge label="SEC Rule 204-2" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate and export institutional-grade client reports, tax summaries, 401(k) compliance files, and audit trails
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          Export Report as CSV
        </button>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {downloadSuccess}
        </div>
      )}

      {/* Report Type Selector Buttons */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleGenerate('portfolio_summary')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              reportType === 'portfolio_summary'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            Portfolio Valuation & Holdings
          </button>

          <button
            onClick={() => handleGenerate('tax_opportunities')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              reportType === 'tax_opportunities'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Tax Harvesting & Wash-Sale
          </button>

          <button
            onClick={() => handleGenerate('retirement_plan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              reportType === 'retirement_plan'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Institutional 401(k) Menu
          </button>

          <button
            onClick={() => handleGenerate('audit_approvals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              reportType === 'audit_approvals'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Audit & Fiduciary Approvals
          </button>
        </div>

        {reportType === 'portfolio_summary' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Household:</span>
            <select
              value={selectedHouseholdId}
              onChange={(e) => {
                setSelectedHouseholdId(e.target.value);
                const rep = reportingService.generateReport({
                  reportType: 'portfolio_summary',
                  householdId: e.target.value,
                });
                setCurrentReport(rep);
              }}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium"
            >
              {MOCK_HOUSEHOLDS.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Generated Report Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
              {currentReport.category} Official Statement
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">{currentReport.title}</h2>
            <p className="text-[11px] text-slate-400">Generated: {currentReport.generatedAt}</p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {Object.entries(currentReport.parameters).map(([k, v]) => (
              <span
                key={k}
                className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium border border-slate-200"
              >
                <strong className="text-slate-900">{k}:</strong> {v}
              </span>
            ))}
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {currentReport.summaryMetrics.map((m, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 block">{m.label}</span>
              <span className="font-bold text-slate-900 text-sm font-mono mt-0.5 block">{m.value}</span>
            </div>
          ))}
        </div>

        {/* Report Data Table */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                {currentReport.headers.map((h, i) => (
                  <th key={i} className="py-2.5 px-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {currentReport.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="py-2.5 px-4 font-medium text-slate-800">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
