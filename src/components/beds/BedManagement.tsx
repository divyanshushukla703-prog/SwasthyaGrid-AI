import { useState } from 'react';
import { useTranslation } from '../../locales/i18n';
import { Bed, BedStatus, Facility, User } from '../../types';
import { StateManager } from '../../services/store';
import {
  BedDouble,
  CheckCircle2,
  AlertCircle,
  Wrench,
  RotateCcw,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface BedManagementProps {
  beds: Bed[];
  facilities: Facility[];
  currentUser: User;
}

export function BedManagement({ beds, facilities, currentUser }: BedManagementProps) {
  const { t } = useTranslation();

  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('ALL');
  const [selectedWard, setSelectedWard] = useState<string>('ALL');
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [activeBed, setActiveBed] = useState<Bed | null>(null);
  const [newStatus, setNewStatus] = useState<BedStatus>('AVAILABLE');
  const [maintenanceNote, setMaintenanceNote] = useState('');

  const filteredBeds = beds.filter((b) => {
    if (selectedFacilityId !== 'ALL' && b.facilityId !== selectedFacilityId) return false;
    if (selectedWard !== 'ALL' && b.ward !== selectedWard) return false;
    return true;
  });

  // Calculate metrics with strictly functional beds as denominator
  const totalRegistered = filteredBeds.length;
  const functionalBeds = filteredBeds.filter((b) => b.status !== 'OUT_OF_SERVICE');
  const totalFunctional = functionalBeds.length;
  const occupiedBeds = functionalBeds.filter((b) => b.status === 'OCCUPIED').length;
  const availableBeds = functionalBeds.filter((b) => b.status === 'AVAILABLE').length;
  const cleaningBeds = functionalBeds.filter((b) => b.status === 'CLEANING').length;
  const outOfServiceBeds = filteredBeds.filter((b) => b.status === 'OUT_OF_SERVICE').length;

  const occupancyRate = totalFunctional > 0 ? Math.round((occupiedBeds / totalFunctional) * 100) : 0;

  const handleOpenStatusModal = (bed: Bed) => {
    setActiveBed(bed);
    setNewStatus(bed.status);
    setMaintenanceNote(bed.maintenanceNote || '');
    setStatusModalOpen(true);
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBed) return;

    StateManager.updateBedStatus(
      activeBed.id,
      newStatus,
      currentUser,
      newStatus === 'OUT_OF_SERVICE' ? maintenanceNote : undefined
    );
    setStatusModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">{t.beds.title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{t.beds.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Facility Filter */}
          <select
            value={selectedFacilityId}
            onChange={(e) => setSelectedFacilityId(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium"
          >
            <option value="ALL">All Health Centres</option>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          {/* Ward Filter */}
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium"
          >
            <option value="ALL">All Wards</option>
            <option value="MALE_GENERAL">Male General Ward</option>
            <option value="FEMALE_GENERAL">Female General Ward</option>
            <option value="MATERNITY">Maternity / Labor Ward</option>
            <option value="PEDIATRIC">Pediatric Ward</option>
            <option value="EMERGENCY">Emergency / Casualty</option>
            <option value="ISOLATION">Isolation Ward</option>
          </select>
        </div>
      </div>

      {/* Verified Bed KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 text-xs">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 font-medium">Occupancy Rate</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{occupancyRate}%</div>
          <div className="text-[11px] text-slate-400 mt-1">{t.beds.functionalBedsNote}</div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-xs">
          <div className="text-emerald-800 font-medium">Available Beds</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{availableBeds}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Ready for patient intake</div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-slate-600 font-medium">Occupied Beds</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{occupiedBeds}</div>
          <div className="text-[11px] text-slate-500 mt-1">Currently admitted patients</div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-xs">
          <div className="text-amber-800 font-medium">Cleaning / Turnaround</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{cleaningBeds}</div>
          <div className="text-[11px] text-amber-600 mt-1">Sanitization in progress</div>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-xs">
          <div className="text-rose-800 font-medium">Out of Service</div>
          <div className="text-2xl font-bold text-rose-700 mt-1">{outOfServiceBeds}</div>
          <div className="text-[11px] text-rose-600 mt-1">Excluded from denominator</div>
        </div>
      </div>

      {/* Bed Grid Cards */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Bed-Level Real-Time Allocation Grid</h3>
          <span className="text-xs text-slate-500">Click any bed to update clinical status or record maintenance</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredBeds.map((bed) => {
            const isAvailable = bed.status === 'AVAILABLE';
            const isOccupied = bed.status === 'OCCUPIED';
            const isCleaning = bed.status === 'CLEANING';
            const isOutOfService = bed.status === 'OUT_OF_SERVICE';

            return (
              <div
                key={bed.id}
                onClick={() => handleOpenStatusModal(bed)}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all hover:scale-102 shadow-2xs flex flex-col justify-between ${
                  isAvailable
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 hover:border-emerald-500'
                    : isOccupied
                    ? 'bg-slate-100 border-slate-300 text-slate-900 hover:border-slate-400'
                    : isCleaning
                    ? 'bg-amber-50/80 border-amber-300 text-amber-900 hover:border-amber-500'
                    : 'bg-rose-50/80 border-rose-300 text-rose-900 opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm tracking-tight">{bed.bedCode}</span>
                    <BedDouble className="w-4 h-4 opacity-70" />
                  </div>
                  <div className="text-[10px] uppercase font-semibold text-slate-500 mt-1 tracking-wider">
                    {bed.ward.replace('_', ' ')}
                  </div>
                  <div className="text-[11px] text-slate-700 mt-0.5 truncate">{bed.facilityName}</div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        isAvailable
                          ? 'bg-emerald-200/60 text-emerald-800'
                          : isOccupied
                          ? 'bg-slate-200 text-slate-800'
                          : isCleaning
                          ? 'bg-amber-200/60 text-amber-800'
                          : 'bg-rose-200 text-rose-800'
                      }`}
                    >
                      {bed.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400">{bed.category.replace('_', ' ')}</span>
                  </div>
                  {bed.maintenanceNote && (
                    <div className="text-[10px] text-rose-700 truncate mt-1 italic">
                      {bed.maintenanceNote}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bed Status Update Modal */}
      {statusModalOpen && activeBed && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Update Bed Status: <span className="font-mono">{activeBed.bedCode}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Facility: {activeBed.facilityName} · Ward: {activeBed.ward.replace('_', ' ')}
            </p>

            <form onSubmit={handleSaveStatus} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">New Operational Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as BedStatus)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                >
                  <option value="AVAILABLE">AVAILABLE (Clean & Ready for Patient)</option>
                  <option value="OCCUPIED">OCCUPIED (Patient Admitted)</option>
                  <option value="CLEANING">CLEANING (Sanitization / Turnaround)</option>
                  <option value="RESERVED">RESERVED (Incoming Transfer / Emergency)</option>
                  <option value="OUT_OF_SERVICE">OUT OF SERVICE (Broken / Maintenance)</option>
                </select>
              </div>

              {newStatus === 'OUT_OF_SERVICE' && (
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Maintenance / Repair Note</label>
                  <input
                    type="text"
                    required
                    value={maintenanceNote}
                    onChange={(e) => setMaintenanceNote(e.target.value)}
                    placeholder="e.g., Latch broken, requisition logged #LKO-99"
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold cursor-pointer"
                >
                  Save Bed Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
