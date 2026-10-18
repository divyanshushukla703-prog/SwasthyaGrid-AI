import { useState } from 'react';
import { useTranslation } from '../../locales/i18n';
import { PatientFootfall, Facility, User } from '../../types';
import { StateManager } from '../../services/store';
import {
  Users,
  Plus,
  TrendingUp,
  AlertTriangle,
  Activity,
  Calendar,
  Layers,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';

interface PatientFootfallViewProps {
  footfall: PatientFootfall[];
  facilities: Facility[];
  currentUser: User;
}

export function PatientFootfallView({
  footfall,
  facilities,
  currentUser,
}: PatientFootfallViewProps) {
  const { t } = useTranslation();

  const [selectedFacility, setSelectedFacility] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [facilityId, setFacilityId] = useState(facilities[0]?.id || '');
  const [opdVisits, setOpdVisits] = useState(150);
  const [ipdAdmissions, setIpdAdmissions] = useState(12);
  const [emergencyVisits, setEmergencyVisits] = useState(20);
  const [referralsIn, setReferralsIn] = useState(4);
  const [referralsOut, setReferralsOut] = useState(2);
  const [discharges, setDischarges] = useState(8);
  const [genMed, setGenMed] = useState(80);
  const [mch, setMch] = useState(45);
  const [immunization, setImmunization] = useState(20);
  const [geriatric, setGeriatric] = useState(5);
  const [notes, setNotes] = useState('');

  const filteredLogs = footfall.filter((f) => {
    if (selectedFacility !== 'ALL' && f.facilityId !== selectedFacility) return false;
    return true;
  });

  const totalOpd = filteredLogs.reduce((acc, l) => acc + l.opdVisits, 0);
  const totalIpd = filteredLogs.reduce((acc, l) => acc + l.ipdAdmissions, 0);
  const totalEmergency = filteredLogs.reduce((acc, l) => acc + l.emergencyVisits, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const facility = facilities.find((f) => f.id === facilityId);
    if (!facility) return;

    // Check if demand spike vs baseline (approx 200 OPD average for facility)
    const baseline = facility.type === 'CHC' ? 300 : 120;
    const spikePercent = parseFloat((((opdVisits - baseline) / baseline) * 100).toFixed(1));
    const isSpike = spikePercent >= 25.0;

    StateManager.recordPatientFootfall(
      {
        facilityId,
        facilityName: facility.name,
        date: new Date().toISOString().split('T')[0],
        opdVisits: Number(opdVisits),
        ipdAdmissions: Number(ipdAdmissions),
        emergencyVisits: Number(emergencyVisits),
        referralsIn: Number(referralsIn),
        referralsOut: Number(referralsOut),
        discharges: Number(discharges),
        departmentCounts: {
          generalMedicine: Number(genMed),
          maternalChild: Number(mch),
          immunization: Number(immunization),
          geriatric: Number(geriatric),
        },
        demandSpikePercent: spikePercent,
        isSpikeAlert: isSpike,
        notes: notes || undefined,
      },
      currentUser
    );

    setModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">{t.nav.footfall}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational patient-flow monitoring (OPD, IPD, Emergency, Referrals) with surge alerts
          </p>
        </div>

        <div className="flex items-center gap-3">
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

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Daily Footfall</span>
          </button>
        </div>
      </div>

      {/* Aggregate Volume Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Outpatient (OPD) Visits</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalOpd}</div>
          <div className="text-[11px] text-slate-400 mt-1">General medicine, maternal, pediatric</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Inpatient (IPD) Admissions</span>
            <Activity className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalIpd}</div>
          <div className="text-[11px] text-slate-400 mt-1">Hospitalized in functional wards</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Emergency / Trauma Footfall</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-1">{totalEmergency}</div>
          <div className="text-[11px] text-slate-400 mt-1">Acute care and casualty triage</div>
        </div>
      </div>

      {/* Footfall Logs Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-4 py-3 font-semibold">Date & Facility</th>
              <th className="px-4 py-3 font-semibold">OPD Visits</th>
              <th className="px-4 py-3 font-semibold">IPD Admissions</th>
              <th className="px-4 py-3 font-semibold">Emergency</th>
              <th className="px-4 py-3 font-semibold">Referrals In / Out</th>
              <th className="px-4 py-3 font-semibold">Discharges</th>
              <th className="px-4 py-3 font-semibold">Demand Spike</th>
              <th className="px-4 py-3 font-semibold">Operational Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.map((entry) => (
              <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-4 py-3.5">
                  <div className="font-bold text-slate-900">{entry.facilityName}</div>
                  <div className="text-[11px] text-slate-400">{entry.date}</div>
                </td>
                <td className="px-4 py-3.5 font-bold text-slate-900 text-sm">{entry.opdVisits}</td>
                <td className="px-4 py-3.5 font-medium text-slate-800">{entry.ipdAdmissions}</td>
                <td className="px-4 py-3.5 font-medium text-rose-700">{entry.emergencyVisits}</td>
                <td className="px-4 py-3.5 text-slate-700">
                  <span className="text-emerald-700 font-semibold">+{entry.referralsIn}</span> in /{' '}
                  <span className="text-amber-700 font-semibold">-{entry.referralsOut}</span> out
                </td>
                <td className="px-4 py-3.5 text-slate-700 font-medium">{entry.discharges}</td>
                <td className="px-4 py-3.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      entry.isSpikeAlert
                        ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                        : entry.demandSpikePercent > 0
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {entry.demandSpikePercent > 0 ? `+${entry.demandSpikePercent}%` : `${entry.demandSpikePercent}%`}
                    {entry.isSpikeAlert && ' (SURGE ALERT)'}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-slate-500 text-[11px] max-w-xs truncate">
                  {entry.notes || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Record Footfall Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Record Facility Daily Footfall</h3>
            <p className="text-xs text-slate-500 mt-1">
              Submit verified daily patient arrival registers (Aggregate operational counts)
            </p>

            <form onSubmit={handleSubmit} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Select Facility</label>
                <select
                  value={facilityId}
                  onChange={(e) => setFacilityId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                >
                  {facilities.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">OPD Visits</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={opdVisits}
                    onChange={(e) => setOpdVisits(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">IPD Admissions</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={ipdAdmissions}
                    onChange={(e) => setIpdAdmissions(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Emergency Visits</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={emergencyVisits}
                    onChange={(e) => setEmergencyVisits(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Referrals In</label>
                  <input
                    type="number"
                    min="0"
                    value={referralsIn}
                    onChange={(e) => setReferralsIn(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Referrals Out</label>
                  <input
                    type="number"
                    min="0"
                    value={referralsOut}
                    onChange={(e) => setReferralsOut(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Discharges</label>
                  <input
                    type="number"
                    min="0"
                    value={discharges}
                    onChange={(e) => setDischarges(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Operational Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Seasonal flu spike, local fair influx, etc."
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

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
                  Commit Footfall Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
