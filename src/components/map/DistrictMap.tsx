import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../../locales/i18n';
import { Facility, InventoryItem, Alert, Bed } from '../../types';
import L from 'leaflet';
import {
  MapPin,
  List,
  Filter,
  Building2,
  Phone,
  BedDouble,
  Pill,
  Clock,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface DistrictMapProps {
  facilities: Facility[];
  inventory: InventoryItem[];
  alerts: Alert[];
  beds: Bed[];
  onNavigateToFacilityDetails?: (facilityId: string) => void;
}

export function DistrictMap({
  facilities,
  inventory,
  alerts,
  beds,
  onNavigateToFacilityDetails,
}: DistrictMapProps) {
  const { t } = useTranslation();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(facilities[0] || null);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredFacilities = facilities.filter((f) => {
    if (typeFilter !== 'ALL' && f.type !== typeFilter) return false;
    if (statusFilter !== 'ALL' && f.operationalStatus !== statusFilter) return false;
    return true;
  });

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (viewMode !== 'map' || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [26.85, 80.95],
        zoom: 10,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | SwasthyaGrid AI',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add marker for each filtered facility
    filteredFacilities.forEach((f) => {
      let pinColor = '#10b981'; // optimal green
      if (f.operationalStatus === 'CRITICAL') pinColor = '#ef4444'; // red
      else if (f.operationalStatus === 'WARNING') pinColor = '#f59e0b'; // amber
      else if (f.operationalStatus === 'STALE_DATA' || f.reportingStatus === 'DELAYED') pinColor = '#6b7280'; // grey

      const iconHtml = `
        <div style="background-color: ${pinColor}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">
          ${f.type === 'CHC' ? 'C' : 'P'}
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-facility-pin',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([f.lat, f.lng], { icon: customIcon }).addTo(map);
      marker.on('click', () => {
        setSelectedFacility(f);
      });

      marker.bindTooltip(`<b>${f.name}</b><br/>Score: ${f.adequacyScore}/100`, {
        direction: 'top',
        offset: [0, -10],
      });

      markersRef.current.push(marker);
    });

    return () => {
      // Cleanup on unmount handled gracefully
    };
  }, [viewMode, filteredFacilities]);

  // Selected Facility contextual data
  const facilityInventory = selectedFacility
    ? inventory.filter((i) => i.facilityId === selectedFacility.id)
    : [];
  const facilityAlerts = selectedFacility
    ? alerts.filter((a) => a.facilityId === selectedFacility.id && a.status === 'OPEN')
    : [];
  const facilityBeds = selectedFacility
    ? beds.filter((b) => b.facilityId === selectedFacility.id)
    : [];
  const functionalBeds = facilityBeds.filter((b) => b.status !== 'OUT_OF_SERVICE');
  const availableBeds = functionalBeds.filter((b) => b.status === 'AVAILABLE');

  return (
    <div className="space-y-4">
      {/* Header and Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">{t.nav.districtMap}</h2>
          <p className="text-xs text-slate-500">
            Interactive geospatial monitoring of Primary & Community Health Centres in Lucknow District
          </p>
        </div>

        {/* View Toggle and Filter Selects */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Facility Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700"
          >
            <option value="ALL">All Facility Types</option>
            <option value="PHC">Primary Health Centres (PHC)</option>
            <option value="CHC">Community Health Centres (CHC)</option>
          </select>

          {/* Operational Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700"
          >
            <option value="ALL">All Operational States</option>
            <option value="OPTIMAL">Optimal Operations</option>
            <option value="WARNING">Monitoring Needed</option>
            <option value="CRITICAL">Critical Shortage</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'map' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Accessible Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Leaflet Map Container */}
          <div className="lg:col-span-2 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden h-[540px] relative shadow-inner">
            <div ref={mapContainerRef} className="w-full h-full z-10" />

            {/* Map Legend Floating */}
            <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-xs border border-slate-300 p-2.5 rounded-lg shadow-md text-[11px] space-y-1">
              <div className="font-semibold text-slate-800 text-[10px] uppercase tracking-wider mb-1">
                Facility Status Legend
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block border border-white" />
                <span>Optimal Operation (&ge; 75/100)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block border border-white" />
                <span>Monitoring Required (55 - 74)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block border border-white" />
                <span>Critical Shortage (&lt; 55)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <span className="w-3 h-3 rounded-full bg-slate-400 inline-block border border-white" />
                <span>Delayed / Stale Sync</span>
              </div>
            </div>
          </div>

          {/* Facility Detail Summary Drawer */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between h-[540px] overflow-y-auto">
            {selectedFacility ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                      {selectedFacility.type} · {selectedFacility.code}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        selectedFacility.adequacyScore < 55
                          ? 'bg-rose-100 text-rose-800'
                          : selectedFacility.adequacyScore < 75
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      Adequacy: {selectedFacility.adequacyScore}/100
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-2">{selectedFacility.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedFacility.address}</p>
                </div>

                <div className="text-xs text-slate-600 space-y-1.5 border-t border-b border-slate-100 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Block:</span>
                    <span className="font-medium text-slate-800">{selectedFacility.block}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Medical Officer:</span>
                    <span className="font-medium text-slate-800">{selectedFacility.administratorName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Emergency Contact:</span>
                    <span className="font-medium text-slate-800">{selectedFacility.contactPhone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Last Synced:</span>
                    <span className="font-medium text-slate-800">{selectedFacility.lastSyncTime}</span>
                  </div>
                </div>

                {/* Key Status Indicators */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="text-slate-500 text-[11px]">Beds (Available / Total)</div>
                    <div className="font-bold text-slate-900 mt-1">
                      {availableBeds.length} / {functionalBeds.length}
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="text-slate-500 text-[11px]">Active Alerts</div>
                    <div className={`font-bold mt-1 ${facilityAlerts.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                      {facilityAlerts.length}
                    </div>
                  </div>
                </div>

                {/* Services capabilities */}
                <div>
                  <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Service Capabilities
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedFacility.servicesOffered.map((svc, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                      >
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Immediate shortages at this facility */}
                {facilityInventory.some((i) => i.daysOfStockRemaining <= i.replenishmentLeadDays) && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs">
                    <div className="font-bold text-rose-900 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                      <span>Critical Stockout Risk Detected</span>
                    </div>
                    <p className="text-[11px] text-rose-700 mt-1">
                      One or more essential medicines will deplete before supply delivery. Inter-facility redistribution is advised.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 text-xs text-slate-400">
                Click on any facility marker on the map to inspect live metrics.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Accessible Table List View */
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3 font-semibold">Facility Name</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Block</th>
                <th className="px-4 py-3 font-semibold">Beds (Avail / Func)</th>
                <th className="px-4 py-3 font-semibold">Adequacy Score</th>
                <th className="px-4 py-3 font-semibold">Operational Status</th>
                <th className="px-4 py-3 font-semibold">Last Sync</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFacilities.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{f.name}</div>
                    <div className="text-[11px] text-slate-400">{f.code}</div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{f.type}</td>
                  <td className="px-4 py-3 text-slate-600">{f.block}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {beds.filter((b) => b.facilityId === f.id && b.status === 'AVAILABLE').length} /{' '}
                    {f.functionalBeds}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        f.adequacyScore < 55
                          ? 'bg-rose-100 text-rose-800'
                          : f.adequacyScore < 75
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {f.adequacyScore} / 100
                    </span>
                  </td>
                  <td className="px-4 py-3">
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
                  </td>
                  <td className="px-4 py-3 text-slate-500">{f.lastSyncTime}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        setSelectedFacility(f);
                        setViewMode('map');
                      }}
                      className="text-teal-700 hover:text-teal-900 font-semibold text-xs cursor-pointer"
                    >
                      View on Map
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
