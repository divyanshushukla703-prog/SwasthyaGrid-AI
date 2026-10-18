import { useState } from 'react';
import { useTranslation } from '../../locales/i18n';
import { StaffRoster, AttendanceStatus, Facility, User } from '../../types';
import { StateManager } from '../../services/store';
import {
  UserCheck,
  Clock,
  AlertTriangle,
  QrCode,
  Fingerprint,
  FileCheck,
  CheckCircle2,
  XCircle,
  Calendar,
} from 'lucide-react';

interface StaffAttendanceViewProps {
  roster: StaffRoster[];
  facilities: Facility[];
  currentUser: User;
}

export function StaffAttendanceView({
  roster,
  facilities,
  currentUser,
}: StaffAttendanceViewProps) {
  const { t } = useTranslation();

  const [selectedFacility, setSelectedFacility] = useState<string>('ALL');
  const [selectedShift, setSelectedShift] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeStaff, setActiveStaff] = useState<StaffRoster | null>(null);
  const [attendanceAction, setAttendanceAction] = useState<AttendanceStatus>('PRESENT');
  const [method, setMethod] = useState<StaffRoster['verificationMethod']>('BIOMETRIC_DEVICE');

  const filteredRoster = roster.filter((r) => {
    if (selectedFacility !== 'ALL' && r.facilityId !== selectedFacility) return false;
    if (selectedShift !== 'ALL' && r.shift !== selectedShift) return false;
    return true;
  });

  const totalRostered = filteredRoster.length;
  const presentCount = filteredRoster.filter((r) => r.attendanceStatus === 'PRESENT').length;
  const absentCount = filteredRoster.filter((r) => r.attendanceStatus === 'ABSENT').length;
  const leaveCount = filteredRoster.filter((r) => r.attendanceStatus === 'APPROVED_LEAVE').length;
  const coverageRate = totalRostered > 0 ? Math.round(((presentCount + leaveCount) / totalRostered) * 100) : 0;

  const handleOpenAttendanceModal = (staff: StaffRoster) => {
    setActiveStaff(staff);
    setAttendanceAction('PRESENT');
    setMethod('BIOMETRIC_DEVICE');
    setModalOpen(true);
  };

  const handleSubmitAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStaff) return;

    StateManager.recordStaffAttendance(
      activeStaff.id,
      attendanceAction,
      method,
      currentUser
    );
    setModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">{t.staff.title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{t.staff.subtitle}</p>
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
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium"
          >
            <option value="ALL">All Shifts</option>
            <option value="MORNING">Morning (08:00 - 16:00)</option>
            <option value="EVENING">Evening (16:00 - 24:00)</option>
            <option value="NIGHT">Night (00:00 - 08:00)</option>
          </select>
        </div>
      </div>

      {/* Roster & Coverage Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 font-medium">Duty Coverage Rate</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{coverageRate}%</div>
          <div className="text-[11px] text-slate-400 mt-1">Verified on active shifts</div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-xs">
          <div className="text-emerald-800 font-medium">Present & Verified</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{presentCount}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Clocked in via QR / Biometric</div>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-xs">
          <div className="text-rose-800 font-medium">Unexplained Absence</div>
          <div className="text-2xl font-bold text-rose-700 mt-1">{absentCount}</div>
          <div className="text-[11px] text-rose-600 mt-1">Grace period exceeded</div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-slate-600 font-medium">Approved Leave</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{leaveCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Sanctioned by MOIC</div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-4 py-3 font-semibold">Staff Name & ID</th>
              <th className="px-4 py-3 font-semibold">Clinical Designation</th>
              <th className="px-4 py-3 font-semibold">Assigned Facility</th>
              <th className="px-4 py-3 font-semibold">Shift Hours</th>
              <th className="px-4 py-3 font-semibold">Attendance Status</th>
              <th className="px-4 py-3 font-semibold">Clock-In Time</th>
              <th className="px-4 py-3 font-semibold">Verification Channel</th>
              <th className="px-4 py-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRoster.map((s) => {
              const isPresent = s.attendanceStatus === 'PRESENT';
              const isAbsent = s.attendanceStatus === 'ABSENT';
              const isLeave = s.attendanceStatus === 'APPROVED_LEAVE';

              return (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900">{s.name}</div>
                    <div className="text-[11px] font-mono text-slate-400">{s.staffId}</div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {s.roleTitle.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 font-medium text-slate-700">{s.facilityName}</td>

                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-800">{s.shift}</div>
                    <div className="text-[11px] text-slate-400">
                      {s.shiftStart} – {s.shiftEnd}
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        isPresent
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isAbsent
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {s.attendanceStatus.replace('_', ' ')}
                    </span>
                    {s.isGracePeriodExceeded && (
                      <div className="text-[10px] text-rose-700 font-semibold mt-0.5">
                        Grace Period Exceeded (+30m)
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3.5 font-mono font-medium text-slate-800">
                    {s.checkInTime || '—'}
                  </td>

                  <td className="px-4 py-3.5 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      {s.verificationMethod === 'BIOMETRIC_DEVICE' && (
                        <Fingerprint className="w-3.5 h-3.5 text-teal-600" />
                      )}
                      {s.verificationMethod === 'QR_CODE' && <QrCode className="w-3.5 h-3.5 text-blue-600" />}
                      {s.verificationMethod === 'MANUAL_VERIFIED' && (
                        <FileCheck className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      <span>{s.verificationMethod.replace('_', ' ')}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => handleOpenAttendanceModal(s)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer"
                    >
                      Verify / Duty Change
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Attendance Modal */}
      {modalOpen && activeStaff && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Verify Staff Duty Attendance</h3>
            <p className="text-xs text-slate-500 mt-1">
              Staff: <strong>{activeStaff.name}</strong> ({activeStaff.roleTitle}) · {activeStaff.facilityName}
            </p>

            <form onSubmit={handleSubmitAttendance} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Attendance Status</label>
                <select
                  value={attendanceAction}
                  onChange={(e) => setAttendanceAction(e.target.value as AttendanceStatus)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                >
                  <option value="PRESENT">PRESENT (Duty Commenced)</option>
                  <option value="APPROVED_LEAVE">APPROVED LEAVE (Sanctioned by MOIC)</option>
                  <option value="ABSENT">ABSENT (Unnotified Non-attendance)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Verification Channel</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as StaffRoster['verificationMethod'])}
                  className="w-full border border-slate-300 rounded-lg p-2"
                >
                  <option value="BIOMETRIC_DEVICE">Biometric Device Verification (Aadhaar/UIDAI)</option>
                  <option value="QR_CODE">Geo-Fenced Dynamic QR Code Scan</option>
                  <option value="MANUAL_VERIFIED">Manual Authorization by Facility MOIC</option>
                </select>
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
                  Commit Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
