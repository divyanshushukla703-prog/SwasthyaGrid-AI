import { useState } from 'react';
import { useTranslation } from '../../locales/i18n';
import { FacilityInterventionCase, Facility, User } from '../../types';
import { StateManager } from '../../services/store';
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Send,
  Calendar,
} from 'lucide-react';

interface InterventionCasesViewProps {
  interventions: FacilityInterventionCase[];
  facilities: Facility[];
  currentUser: User;
}

export function InterventionCasesView({
  interventions,
  facilities,
  currentUser,
}: InterventionCasesViewProps) {
  const { t } = useTranslation();

  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [activeCase, setActiveCase] = useState<FacilityInterventionCase | null>(interventions[0] || null);
  const [actionNote, setActionNote] = useState('');
  const [resolutionEvidence, setResolutionEvidence] = useState('');

  const filteredCases = interventions.filter((c) => {
    if (selectedStatus !== 'ALL' && c.status !== selectedStatus) return false;
    return true;
  });

  const handleAddAction = (statusChange?: FacilityInterventionCase['status']) => {
    if (!activeCase) return;
    try {
      StateManager.updateInterventionCase(activeCase.id, {
        status: statusChange,
        actionNote: actionNote || (statusChange ? `Status modified to ${statusChange}` : 'Follow-up noted'),
        resolutionEvidence: statusChange === 'RESOLVED' ? resolutionEvidence : undefined,
        user: currentUser,
      });
      setActionNote('');
      setResolutionEvidence('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">{t.interventions.title}</h2>
            <span className="text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded">
              Automated Threshold Breach Case Engine (Adequacy &lt; 60/100)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{t.interventions.subtitle}</p>
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium"
        >
          <option value="ALL">All Case Statuses</option>
          <option value="OPEN">Open Cases</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved Cases</option>
          <option value="ESCALATED">Escalated to CMO</option>
        </select>
      </div>

      {/* Two-Column Case Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Case List */}
        <div className="space-y-3">
          {filteredCases.map((c) => {
            const isSelected = activeCase?.id === c.id;
            const isCritical = c.severity === 'CRITICAL';

            return (
              <div
                key={c.id}
                onClick={() => setActiveCase(c)}
                className={`p-4 rounded-xl border text-xs cursor-pointer transition-all shadow-xs ${
                  isSelected
                    ? 'bg-teal-50/50 border-teal-500 ring-1 ring-teal-500'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900">{c.caseNumber}</span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      c.status === 'OPEN'
                        ? 'bg-rose-100 text-rose-800'
                        : c.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <div className="font-bold text-slate-900 text-sm mt-1">{c.facilityName}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">District: {c.district}</div>

                <div className="mt-2 flex items-center justify-between text-[11px] border-t border-slate-100 pt-2">
                  <span className="font-semibold text-rose-700">Adequacy: {c.adequacyScore}/100</span>
                  <span className="text-slate-400">SLA: {c.deadline}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Detailed Case Workspace */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs text-xs space-y-5">
          {activeCase ? (
            <>
              {/* Case Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-slate-900">{activeCase.caseNumber}</span>
                    <span className="font-bold uppercase text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                      {activeCase.severity} SEVERITY
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-teal-900 mt-1">{activeCase.facilityName}</h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">{activeCase.triggerCondition}</p>
                </div>

                <div className="text-right sm:text-left text-[11px] text-slate-500">
                  <div>Assigned Officer: <strong className="text-slate-800">{activeCase.assignedOfficer}</strong></div>
                  <div>SLA Deadline: <strong className="text-rose-700 font-mono">{activeCase.deadline}</strong></div>
                </div>
              </div>

              {/* Multi-Factor Adequacy Breakdown (Transparent, No Mystery Score!) */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-3">
                  Transparent Factor Evaluation ({activeCase.adequacyScore} / 100)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-slate-400 text-[10px] uppercase font-semibold">Medicine Buffer</div>
                    <div className="text-lg font-bold text-slate-900 mt-1">
                      {activeCase.breakdownIndicators.medicineAvailability}%
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-slate-400 text-[10px] uppercase font-semibold">Bed Capacity</div>
                    <div className="text-lg font-bold text-slate-900 mt-1">
                      {activeCase.breakdownIndicators.bedCapacity}%
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-slate-400 text-[10px] uppercase font-semibold">Staff Duty</div>
                    <div className="text-lg font-bold text-slate-900 mt-1">
                      {activeCase.breakdownIndicators.staffingCoverage}%
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-slate-400 text-[10px] uppercase font-semibold">Lab Diagnostics</div>
                    <div className="text-lg font-bold text-slate-900 mt-1">
                      {activeCase.breakdownIndicators.diagnosticReadiness}%
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-slate-400 text-[10px] uppercase font-semibold">Reporting Sync</div>
                    <div className="text-lg font-bold text-slate-900 mt-1">
                      {activeCase.breakdownIndicators.reportingCompliance}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended Next Actions */}
              <div className="p-4 bg-teal-50/60 rounded-lg border border-teal-200">
                <h4 className="font-bold text-teal-900 text-xs mb-2">Recommended Corrective Actions:</h4>
                <ul className="space-y-1.5 text-slate-700">
                  {activeCase.recommendedActions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-teal-700 font-bold">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action History / Audit Trail */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                  Intervention Case History & Evidence
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {activeCase.actionHistory.map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px]">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="font-medium text-slate-700">{item.actor}</span>
                        <span className="font-mono">{item.timestamp}</span>
                      </div>
                      <div className="font-semibold text-slate-800 mt-0.5">{item.action}</div>
                      <div className="text-slate-600 mt-0.5">{item.notes}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Progress Note & Workflow Actions */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Record Corrective Progress / Administrative Note
                  </label>
                  <textarea
                    rows={2}
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    placeholder="e.g. Conducted video briefing with facility MOIC. Emergency drug shipment dispatch confirmed."
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>

                {activeCase.status !== 'RESOLVED' && (
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Resolution Evidence (Required to Mark Resolved)
                    </label>
                    <input
                      type="text"
                      value={resolutionEvidence}
                      onChange={(e) => setResolutionEvidence(e.target.value)}
                      placeholder="e.g. Physical inventory received, 300 strips verified on ledger, doctor attendance restored."
                      className="w-full border border-slate-300 rounded-lg p-2"
                    />
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-end gap-2">
                  {activeCase.status !== 'IN_PROGRESS' && activeCase.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleAddAction('IN_PROGRESS')}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 font-medium cursor-pointer"
                    >
                      Set In Progress
                    </button>
                  )}
                  {activeCase.status !== 'ESCALATED' && activeCase.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleAddAction('ESCALATED')}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 font-medium cursor-pointer"
                    >
                      Escalate to CMO
                    </button>
                  )}
                  {activeCase.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleAddAction('RESOLVED')}
                      disabled={!resolutionEvidence}
                      className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold cursor-pointer"
                    >
                      Mark Case Resolved
                    </button>
                  )}
                  {actionNote && (
                    <button
                      onClick={() => handleAddAction()}
                      className="px-4 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold cursor-pointer"
                    >
                      Save Note
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-slate-400">Select an intervention case from the left panel.</div>
          )}
        </div>
      </div>
    </div>
  );
}
