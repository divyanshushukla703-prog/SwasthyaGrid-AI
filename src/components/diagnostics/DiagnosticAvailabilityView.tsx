import { useState } from 'react';
import { useTranslation } from '../../locales/i18n';
import { DiagnosticTest, DiagnosticStatus, Facility, User } from '../../types';
import { StateManager } from '../../services/store';
import {
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Wrench,
  Search,
} from 'lucide-react';

interface DiagnosticAvailabilityViewProps {
  diagnostics: DiagnosticTest[];
  facilities: Facility[];
  currentUser: User;
}

export function DiagnosticAvailabilityView({
  diagnostics,
  facilities,
  currentUser,
}: DiagnosticAvailabilityViewProps) {
  const { t } = useTranslation();

  const [selectedFacility, setSelectedFacility] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTest, setActiveTest] = useState<DiagnosticTest | null>(null);

  // Form states
  const [status, setStatus] = useState<DiagnosticStatus>('AVAILABLE');
  const [equipmentOk, setEquipmentOk] = useState(true);
  const [reagentStatus, setReagentStatus] = useState<DiagnosticTest['reagentStockStatus']>('SUFFICIENT');
  const [reason, setReason] = useState('');

  const filteredTests = diagnostics.filter((d) => {
    if (selectedFacility !== 'ALL' && d.facilityId !== selectedFacility) return false;
    if (selectedCategory !== 'ALL' && d.category !== selectedCategory) return false;
    return true;
  });

  const availableCount = filteredTests.filter((d) => d.status === 'AVAILABLE').length;
  const limitedCount = filteredTests.filter((d) => d.status === 'LIMITED').length;
  const outageCount = filteredTests.filter((d) => d.status === 'UNAVAILABLE').length;

  const handleOpenEdit = (test: DiagnosticTest) => {
    setActiveTest(test);
    setStatus(test.status);
    setEquipmentOk(test.equipmentFunctional);
    setReagentStatus(test.reagentStockStatus);
    setReason(test.unavailabilityReason || '');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTest) return;

    StateManager.updateDiagnosticStatus({
      testId: activeTest.id,
      status,
      equipmentFunctional: equipmentOk,
      reagentStockStatus: reagentStatus,
      unavailabilityReason: status !== 'AVAILABLE' ? reason : undefined,
      user: currentUser,
    });
    setModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">{t.diagnostics.title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{t.diagnostics.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium"
          >
            <option value="ALL">All Health Centres</option>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium"
          >
            <option value="ALL">All Lab Categories</option>
            <option value="HEMATOLOGY">Hematology (CBC / Hb)</option>
            <option value="BIOCHEMISTRY">Biochemistry (Sugar, LFT, KFT)</option>
            <option value="INFECTIOUS">Infectious Screening (Malaria, Dengue, TB)</option>
            <option value="MATERNAL">Maternal Diagnostic (UPT, Blood Group)</option>
          </select>
        </div>
      </div>

      {/* Aggregate Readiness Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-xs">
          <div className="text-emerald-800 font-medium">Fully Available & Operational</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{availableCount}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Equipment functional & reagents in stock</div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-xs">
          <div className="text-amber-800 font-medium">Limited Availability</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{limitedCount}</div>
          <div className="text-[11px] text-amber-600 mt-1">Low reagent buffer remaining</div>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-xs">
          <div className="text-rose-800 font-medium">Service Outage / Breakdown</div>
          <div className="text-2xl font-bold text-rose-700 mt-1">{outageCount}</div>
          <div className="text-[11px] text-rose-600 mt-1">Analyzer or reagent depletion</div>
        </div>
      </div>

      {/* Diagnostic Catalog Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-4 py-3 font-semibold">Test Name & Category</th>
              <th className="px-4 py-3 font-semibold">Facility</th>
              <th className="px-4 py-3 font-semibold">Availability Status</th>
              <th className="px-4 py-3 font-semibold">Equipment Status</th>
              <th className="px-4 py-3 font-semibold">Reagent Stock</th>
              <th className="px-4 py-3 font-semibold">Est. Turnaround</th>
              <th className="px-4 py-3 font-semibold">Last Verified</th>
              <th className="px-4 py-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTests.map((test) => {
              const isAvail = test.status === 'AVAILABLE';
              const isLimited = test.status === 'LIMITED';
              const isOutage = test.status === 'UNAVAILABLE';

              return (
                <tr key={test.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900">{test.testName}</div>
                    <div className="text-[11px] text-slate-400 font-medium">{test.category}</div>
                    {test.unavailabilityReason && (
                      <div className="text-[10px] text-rose-700 mt-1 font-medium bg-rose-50 p-1 rounded border border-rose-200">
                        Reason: {test.unavailabilityReason}
                        {test.expectedRestorationDate && ` (ETA: ${test.expectedRestorationDate})`}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3.5 font-medium text-slate-800">{test.facilityName}</td>

                  <td className="px-4 py-3.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        isAvail
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isLimited
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {test.status}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span
                      className={`text-[11px] font-medium flex items-center gap-1 ${
                        test.equipmentFunctional ? 'text-emerald-700' : 'text-rose-700 font-bold'
                      }`}
                    >
                      {test.equipmentFunctional ? 'Functional' : 'Hardware Defect'}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        test.reagentStockStatus === 'SUFFICIENT'
                          ? 'bg-emerald-50 text-emerald-700'
                          : test.reagentStockStatus === 'LOW'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {test.reagentStockStatus}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 font-medium text-slate-800">{test.avgTurnaroundHours} hrs</td>
                  <td className="px-4 py-3.5 text-slate-500 text-[11px]">{test.lastVerified}</td>

                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => handleOpenEdit(test)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Diagnostic Update Modal */}
      {modalOpen && activeTest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Update Diagnostic Availability</h3>
            <p className="text-xs text-slate-500 mt-1">
              Test: <strong>{activeTest.testName}</strong> · {activeTest.facilityName}
            </p>

            <form onSubmit={handleSave} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Availability Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as DiagnosticStatus)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                >
                  <option value="AVAILABLE">AVAILABLE (Normal Testing On-Site)</option>
                  <option value="LIMITED">LIMITED (Low Reagent Stock / Selective Triage)</option>
                  <option value="UNAVAILABLE">UNAVAILABLE (Service Suspended)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Equipment Condition</label>
                <select
                  value={equipmentOk ? 'OK' : 'DOWN'}
                  onChange={(e) => setEquipmentOk(e.target.value === 'OK')}
                  className="w-full border border-slate-300 rounded-lg p-2"
                >
                  <option value="OK">Analyzer / Equipment Fully Functional</option>
                  <option value="DOWN">Equipment Defective / Awaiting Biomedical Repair</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Reagent & Consumables Level</label>
                <select
                  value={reagentStatus}
                  onChange={(e) => setReagentStatus(e.target.value as DiagnosticTest['reagentStockStatus'])}
                  className="w-full border border-slate-300 rounded-lg p-2"
                >
                  <option value="SUFFICIENT">Sufficient (&gt; 15 days supply)</option>
                  <option value="LOW">Low Reagents (&lt; 5 days supply)</option>
                  <option value="DEPLETED">Depleted (0 tests remaining)</option>
                </select>
              </div>

              {status !== 'AVAILABLE' && (
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Unavailability Reason / Action</label>
                  <input
                    type="text"
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Pump sensor error, repair engineer requested."
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold cursor-pointer"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
