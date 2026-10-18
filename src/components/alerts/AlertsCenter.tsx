import { useState } from 'react';
import { useTranslation } from '../../locales/i18n';
import { Alert, AlertSeverity, AlertCategory, Facility, User } from '../../types';
import { StateManager } from '../../services/store';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  ShieldAlert,
  Search,
} from 'lucide-react';

interface AlertsCenterProps {
  alerts: Alert[];
  facilities: Facility[];
  currentUser: User;
}

export function AlertsCenter({ alerts, facilities, currentUser }: AlertsCenterProps) {
  const { t } = useTranslation();

  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [activeAlert, setActiveAlert] = useState<Alert | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const filteredAlerts = alerts.filter((a) => {
    if (selectedSeverity !== 'ALL' && a.severity !== selectedSeverity) return false;
    if (selectedStatus !== 'ALL' && a.status !== selectedStatus) return false;
    return true;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && a.status === 'OPEN').length;
  const warningCount = alerts.filter((a) => a.severity === 'WARNING' && a.status === 'OPEN').length;
  const resolvedCount = alerts.filter((a) => a.status === 'RESOLVED').length;

  const handleAcknowledge = (alertId: string) => {
    StateManager.acknowledgeAlert(alertId, currentUser);
  };

  const handleOpenResolve = (alert: Alert) => {
    setActiveAlert(alert);
    setResolutionNotes('Verified resolution on site. Normal operating parameters restored.');
    setResolveModalOpen(true);
  };

  const handleSubmitResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAlert) return;
    StateManager.resolveAlert(activeAlert.id, resolutionNotes, currentUser);
    setResolveModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">{t.alerts.title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{t.alerts.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Severity Filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="WARNING">Warnings</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open Only</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Aggregate Alert Severity Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-xs">
          <div className="text-rose-800 font-medium">Critical Unresolved Alerts</div>
          <div className="text-2xl font-bold text-rose-700 mt-1">{criticalCount}</div>
          <div className="text-[11px] text-rose-600 mt-1">Imminent stockout or severe coverage breach</div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-xs">
          <div className="text-amber-800 font-medium">Operational Warnings</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{warningCount}</div>
          <div className="text-[11px] text-amber-600 mt-1">High bed capacity, diagnostic outages</div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-xs">
          <div className="text-emerald-800 font-medium">Audited & Resolved</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{resolvedCount}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Closed with verification notes</div>
        </div>
      </div>

      {/* Alerts Table / List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.severity === 'CRITICAL';
          const isOpen = alert.status === 'OPEN';
          const isAck = alert.status === 'ACKNOWLEDGED';
          const isResolved = alert.status === 'RESOLVED';

          return (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border text-xs shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isResolved
                  ? 'bg-slate-50 border-slate-200 opacity-75'
                  : isCritical
                  ? 'bg-rose-50/50 border-rose-300'
                  : 'bg-amber-50/50 border-amber-300'
              }`}
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      isCritical ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <span className="font-semibold text-slate-700 bg-white/80 border border-slate-200 px-2 py-0.5 rounded text-[10px]">
                    {alert.category.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">#{alert.id}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mt-1">{alert.title}</h3>
                <div className="text-slate-600 font-medium">{alert.facilityName}</div>
                <p className="text-slate-500 text-[11px] leading-relaxed">{alert.description}</p>

                {alert.evidence && (
                  <div className="mt-1 p-2 bg-white/90 border border-slate-200 rounded text-[11px] font-mono text-slate-700">
                    Evidence: {alert.evidence}
                  </div>
                )}

                <div className="text-[10px] text-slate-400 flex flex-wrap items-center gap-3 pt-1">
                  <span>Logged: {alert.createdAt}</span>
                  {alert.assignedTo && <span>Assigned: {alert.assignedTo}</span>}
                  {alert.acknowledgedBy && (
                    <span className="text-teal-700 font-medium">
                      Ack by {alert.acknowledgedBy} at {alert.acknowledgedAt}
                    </span>
                  )}
                  {alert.resolutionNotes && (
                    <span className="text-emerald-700 font-medium">
                      Resolved: {alert.resolutionNotes} ({alert.resolvedAt})
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {isOpen && (
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 font-medium text-slate-700 cursor-pointer"
                  >
                    {t.actions.acknowledge}
                  </button>
                )}

                {!isResolved && (
                  <button
                    onClick={() => handleOpenResolve(alert)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer shadow-xs"
                  >
                    {t.actions.resolve}
                  </button>
                )}

                {isResolved && (
                  <div className="flex items-center gap-1 text-emerald-800 font-semibold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Resolved</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resolve Modal */}
      {resolveModalOpen && activeAlert && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-xs">
            <h3 className="text-base font-bold text-slate-900">Resolve Operational Alert</h3>
            <p className="text-slate-500 mt-1">
              Alert: <strong>{activeAlert.title}</strong> ({activeAlert.facilityName})
            </p>

            <form onSubmit={handleSubmitResolve} className="space-y-3 mt-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Resolution Notes & Corrective Steps Taken
                </label>
                <textarea
                  required
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder={t.alerts.resolutionNotesPlaceholder}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResolveModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer"
                >
                  Confirm & Close Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
