import { useState } from 'react';
import { useTranslation } from '../../locales/i18n';
import { Facility, InventoryItem, Alert, Bed } from '../../types';
import {
  Building2,
  Search,
  Filter,
  Phone,
  MapPin,
  BedDouble,
  ShieldAlert,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface FacilityDirectoryProps {
  facilities: Facility[];
  inventory: InventoryItem[];
  alerts: Alert[];
  beds: Bed[];
  onSelectFacilityForMap?: (facilityId: string) => void;
}

export function FacilityDirectory({
  facilities,
  inventory,
  alerts,
  beds,
  onSelectFacilityForMap,
}: FacilityDirectoryProps) {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [blockFilter, setBlockFilter] = useState('ALL');

  const blocks = Array.from(new Set(facilities.map((f) => f.block)));

  const filtered = facilities.filter((f) => {
    if (typeFilter !== 'ALL' && f.type !== typeFilter) return false;
    if (blockFilter !== 'ALL' && f.block !== blockFilter) return false;
    if (
      search &&
      !f.name.toLowerCase().includes(search.toLowerCase()) &&
      !f.code.toLowerCase().includes(search.toLowerCase()) &&
      !f.administratorName.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">{t.nav.facilities}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Directory of Primary Health Centres (PHCs) & Community Health Centres (CHCs) in Lucknow District
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search facility name, code, MOIC..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-slate-900 focus:outline-none placeholder:text-slate-400"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium"
          >
            <option value="ALL">All Facility Types</option>
            <option value="PHC">PHC</option>
            <option value="CHC">CHC</option>
          </select>

          <select
            value={blockFilter}
            onChange={(e) => setBlockFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium"
          >
            <option value="ALL">All Blocks</option>
            {blocks.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Facilities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((f) => {
          const facilityAlerts = alerts.filter((a) => a.facilityId === f.id && a.status === 'OPEN');
          const facilityBeds = beds.filter((b) => b.facilityId === f.id);
          const availableBeds = facilityBeds.filter((b) => b.status === 'AVAILABLE').length;

          return (
            <div
              key={f.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between text-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                    {f.type} · {f.code}
                  </span>
                  <span
                    className={`font-bold text-[11px] px-2 py-0.5 rounded ${
                      f.adequacyScore < 55
                        ? 'bg-rose-100 text-rose-800'
                        : f.adequacyScore < 75
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    Adequacy: {f.adequacyScore}/100
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mt-2">{f.name}</h3>
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{f.address}</span>
                </div>

                <div className="mt-3 py-2.5 border-t border-b border-slate-100 space-y-1 text-slate-600 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Block:</span>
                    <span className="font-medium text-slate-800">{f.block}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Medical Officer:</span>
                    <span className="font-medium text-slate-800">{f.administratorName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Phone:</span>
                    <span className="font-medium text-slate-800">{f.contactPhone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Last Sync:</span>
                    <span className="font-medium text-slate-800">{f.lastSyncTime}</span>
                  </div>
                </div>

                {/* Metrics pill summary */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-slate-400 text-[10px] uppercase font-semibold">Available Beds</div>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {availableBeds} / {f.functionalBeds}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-slate-400 text-[10px] uppercase font-semibold">Active Alerts</div>
                    <div
                      className={`font-bold mt-0.5 ${
                        facilityAlerts.length > 0 ? 'text-rose-600' : 'text-slate-900'
                      }`}
                    >
                      {facilityAlerts.length}
                    </div>
                  </div>
                </div>

                {/* Service badges */}
                <div className="mt-3">
                  <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1">Capabilities</div>
                  <div className="flex flex-wrap gap-1">
                    {f.servicesOffered.slice(0, 3).map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200"
                      >
                        {s}
                      </span>
                    ))}
                    {f.servicesOffered.length > 3 && (
                      <span className="text-[10px] text-slate-400">+{f.servicesOffered.length - 3} more</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status pill & intervention flag */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    f.operationalStatus === 'OPTIMAL'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : f.operationalStatus === 'WARNING'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {f.operationalStatus}
                </span>

                <span className="text-[11px] text-teal-700 font-semibold cursor-pointer hover:underline">
                  View Full Metrics &rarr;
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
