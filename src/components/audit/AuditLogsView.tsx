import { useState } from 'react';
import { useTranslation } from '../../locales/i18n';
import { AuditLog, Facility } from '../../types';
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Calendar,
  Lock,
} from 'lucide-react';

interface AuditLogsViewProps {
  auditLogs: AuditLog[];
  facilities: Facility[];
}

export function AuditLogsView({ auditLogs, facilities }: AuditLogsViewProps) {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    if (entityFilter !== 'ALL' && log.entityType !== entityFilter) return false;
    if (
      search &&
      !log.action.toLowerCase().includes(search.toLowerCase()) &&
      !log.actorName.toLowerCase().includes(search.toLowerCase()) &&
      !(log.facilityName && log.facilityName.toLowerCase().includes(search.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  const handleExportCsv = () => {
    let csv = 'data:text/csv;charset=utf-8,Timestamp,ActorName,ActorRole,Action,Facility,EntityType,EntityID,PreviousValue,NewValue\n';
    filteredLogs.forEach((l) => {
      csv += `"${l.timestamp}","${l.actorName}","${l.actorRole}","${l.action}","${l.facilityName || ''}","${l.entityType}","${l.entityId}","${l.previousValue || ''}","${l.newValue || ''}"\n`;
    });
    const encoded = encodeURI(csv);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `SwasthyaGrid_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">{t.audit.title}</h2>
            <span className="flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 rounded">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>Immutable Ledger (DPDP Act 2023 Aligned)</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{t.audit.subtitle}</p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Trail (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-1 min-w-[260px] items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search action, actor name, facility..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium"
        >
          <option value="ALL">All Entity Types</option>
          <option value="INVENTORY">Inventory & Stock</option>
          <option value="BED">Beds & Wards</option>
          <option value="ATTENDANCE">Staff Roster & Duty</option>
          <option value="DIAGNOSTIC">Diagnostic Services</option>
          <option value="REDISTRIBUTION">Resource Transfers</option>
          <option value="INTERVENTION">Intervention Cases</option>
          <option value="ALERT">Alert Operations</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-4 py-3 font-semibold">Timestamp</th>
              <th className="px-4 py-3 font-semibold">Authorized Actor</th>
              <th className="px-4 py-3 font-semibold">Action</th>
              <th className="px-4 py-3 font-semibold">Facility</th>
              <th className="px-4 py-3 font-semibold">Entity & ID</th>
              <th className="px-4 py-3 font-semibold">Before & After Changes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-4 py-3.5 font-sans text-slate-500 whitespace-nowrap">
                  {log.timestamp}
                </td>

                <td className="px-4 py-3.5 font-sans">
                  <div className="font-bold text-slate-900">{log.actorName}</div>
                  <div className="text-[10px] text-teal-700 font-medium">{log.actorRole}</div>
                </td>

                <td className="px-4 py-3.5 font-sans">
                  <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                    {log.action}
                  </span>
                </td>

                <td className="px-4 py-3.5 font-sans text-slate-700">
                  {log.facilityName || 'District Health Authority'}
                </td>

                <td className="px-4 py-3.5">
                  <div className="text-slate-800 font-semibold">{log.entityType}</div>
                  <div className="text-[10px] text-slate-400">{log.entityId}</div>
                </td>

                <td className="px-4 py-3.5 font-sans max-w-sm">
                  {log.previousValue && (
                    <div className="text-slate-400 line-through text-[10px]">
                      Prev: {log.previousValue}
                    </div>
                  )}
                  {log.newValue && (
                    <div className="text-teal-900 font-medium text-[11px]">
                      New: {log.newValue}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
