import { useState } from 'react';
import { useTranslation } from '../../locales/i18n';
import {
  OperationalMetrics,
  Facility,
  InventoryItem,
  Alert,
  RedistributionRecommendation,
  User,
} from '../../types';
import { generateOperationalAiSummary, AiNarrativeReport } from '../../services/aiService';
import {
  Building2,
  Clock,
  AlertTriangle,
  BedDouble,
  Users,
  UserCheck,
  FlaskConical,
  ArrowLeftRight,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface OverviewDashboardProps {
  metrics: OperationalMetrics;
  facilities: Facility[];
  inventory: InventoryItem[];
  alerts: Alert[];
  redistributions: RedistributionRecommendation[];
  currentUser: User;
  onNavigateTab: (tab: string) => void;
}

export function OverviewDashboard({
  metrics,
  facilities,
  inventory,
  alerts,
  redistributions,
  currentUser,
  onNavigateTab,
}: OverviewDashboardProps) {
  const { lang, t } = useTranslation();
  const [aiReport, setAiReport] = useState<AiNarrativeReport | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const criticalInventory = inventory.filter((i) => i.daysOfStockRemaining <= i.replenishmentLeadDays);
  const openAlerts = alerts.filter((a) => a.status === 'OPEN').slice(0, 4);
  const pendingTransfers = redistributions.filter((r) => r.status === 'PENDING_APPROVAL');

  const handleGenerateAiSummary = async () => {
    setLoadingAi(true);
    try {
      const report = await generateOperationalAiSummary(lang, {
        criticalItemsCount: metrics.criticalMedicineShortages,
        bedOccupancy: metrics.bedOccupancyRate,
        staleFacilities: metrics.staleReporting,
        criticalAlerts: metrics.openCriticalAlerts,
        topRiskItems: criticalInventory.slice(0, 3).map((item) => ({
          medicine: item.medicineName,
          facility: facilities.find((f) => f.id === item.facilityId)?.name || 'Facility',
          daysLeft: item.daysOfStockRemaining,
        })),
      });
      setAiReport(report);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Operational Subtitle */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t.dashboard.title}</h1>
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-semibold border border-slate-200">
              District Lucknow (UP)
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">{t.dashboard.subtitle}</p>
        </div>

        {/* AI Brief Button */}
        <button
          onClick={handleGenerateAiSummary}
          disabled={loadingAi}
          className="flex items-center gap-2 bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${loadingAi ? 'animate-spin' : ''}`} />
          <span>{loadingAi ? 'Analyzing Grid Data...' : t.actions.simulateAiInsights}</span>
        </button>
      </div>

      {/* AI Narrative Intelligence Card (if generated or default prompt) */}
      {aiReport && (
        <div className="bg-gradient-to-br from-teal-950 via-slate-900 to-slate-900 border border-teal-800/60 rounded-xl p-5 text-white shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-teal-800/40">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-300" />
              <h2 className="text-sm font-bold text-teal-200 tracking-wide uppercase">
                {t.forecast.narrativeExplanation}
              </h2>
            </div>
            <span className="text-xs text-slate-400">Generated: {aiReport.generatedAt}</span>
          </div>
          <p className="text-sm text-teal-50 mt-3 leading-relaxed">{aiReport.summary}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800">
            <div>
              <h3 className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2">
                Operational Deficits
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {aiReport.criticalInsights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-teal-300 uppercase tracking-wider mb-2">
                Immediate Interventions Required
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {aiReport.immediateActions.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Primary KPI Grid (10 Core Metrics with Click-Through Filters) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Metric 1: Facilities */}
        <div
          onClick={() => onNavigateTab('facilities')}
          className="bg-white border border-slate-200 hover:border-teal-500 rounded-xl p-4 shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t.metrics.totalFacilities}</span>
            <Building2 className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{metrics.totalFacilities}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
            <span className="text-emerald-700 font-semibold">{metrics.reportingToday} reporting</span>
            <span>·</span>
            <span className="text-amber-700 font-medium">{metrics.staleReporting} delayed</span>
          </div>
        </div>

        {/* Metric 2: Critical Medicine Shortages */}
        <div
          onClick={() => onNavigateTab('inventory')}
          className={`border rounded-xl p-4 shadow-xs transition-all cursor-pointer group ${
            metrics.criticalMedicineShortages > 0
              ? 'bg-rose-50/50 border-rose-200 hover:border-rose-400'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t.metrics.criticalShortages}</span>
            <TrendingDown
              className={`w-4 h-4 ${
                metrics.criticalMedicineShortages > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-400'
              }`}
            />
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-2">{metrics.criticalMedicineShortages}</div>
          <div className="text-[11px] text-rose-600 mt-1 font-medium">
            Depletion before supplier lead time
          </div>
        </div>

        {/* Metric 3: Bed Occupancy Rate */}
        <div
          onClick={() => onNavigateTab('beds')}
          className="bg-white border border-slate-200 hover:border-teal-500 rounded-xl p-4 shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t.metrics.bedOccupancy}</span>
            <BedDouble className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{metrics.bedOccupancyRate}%</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {metrics.occupiedBeds} occupied / {metrics.totalFunctionalBeds} functional beds
          </div>
        </div>

        {/* Metric 4: Footfall Today */}
        <div
          onClick={() => onNavigateTab('footfall')}
          className="bg-white border border-slate-200 hover:border-teal-500 rounded-xl p-4 shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t.metrics.footfallToday}</span>
            <Users className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{metrics.totalFootfallToday}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            Across 8 District Health Units
          </div>
        </div>

        {/* Metric 5: Doctor Attendance */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="bg-white border border-slate-200 hover:border-teal-500 rounded-xl p-4 shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t.metrics.doctorAttendance}</span>
            <UserCheck className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{metrics.doctorAttendanceRate}%</div>
          <div className="text-[11px] text-slate-500 mt-1">Verified on roster shifts</div>
        </div>

        {/* Metric 6: Diagnostics Available */}
        <div
          onClick={() => onNavigateTab('diagnostics')}
          className="bg-white border border-slate-200 hover:border-teal-500 rounded-xl p-4 shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t.metrics.diagnosticsAvailable}</span>
            <FlaskConical className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {metrics.availableDiagnosticsCount} / {metrics.totalDiagnosticsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {metrics.totalDiagnosticsCount - metrics.availableDiagnosticsCount} outage / limited
          </div>
        </div>

        {/* Metric 7: Open Critical Alerts */}
        <div
          onClick={() => onNavigateTab('alerts')}
          className="bg-white border border-slate-200 hover:border-rose-500 rounded-xl p-4 shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t.metrics.criticalAlerts}</span>
            <AlertTriangle className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-2">{metrics.openCriticalAlerts}</div>
          <div className="text-[11px] text-slate-500 mt-1">Require immediate sign-off</div>
        </div>

        {/* Metric 8: Pending Transfers */}
        <div
          onClick={() => onNavigateTab('redistribution')}
          className="bg-white border border-slate-200 hover:border-amber-500 rounded-xl p-4 shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t.metrics.pendingTransfers}</span>
            <ArrowLeftRight className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">{metrics.pendingRedistributions}</div>
          <div className="text-[11px] text-slate-500 mt-1">Surplus-to-deficit matches</div>
        </div>

        {/* Metric 9: Under-Resourced Facilities */}
        <div
          onClick={() => onNavigateTab('interventions')}
          className="bg-white border border-slate-200 hover:border-rose-500 rounded-xl p-4 shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t.metrics.underResourced}</span>
            <ShieldAlert className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-2">
            {metrics.underResourcedFacilitiesCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Adequacy score &lt; 60%</div>
        </div>

        {/* Metric 10: Reporting Stale */}
        <div
          onClick={() => onNavigateTab('facilities')}
          className="bg-white border border-slate-200 hover:border-slate-400 rounded-xl p-4 shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t.metrics.staleReporting}</span>
            <Clock className="w-4 h-4 text-slate-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-slate-700 mt-2">{metrics.staleReporting}</div>
          <div className="text-[11px] text-slate-500 mt-1">Facilities with delayed sync</div>
        </div>
      </div>

      {/* Two-Column Operational Command Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Urgent Stockout Depletion Timeline & Pending Redistribution */}
        <div className="lg:col-span-2 space-y-6">
          {/* Critical Medicine Depletion Timeline */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                  {t.dashboard.inventoryDepletion}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Comparison between remaining usable stock and supplier replenishment lead time
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('inventory')}
                className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Full Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {criticalInventory.map((item) => {
                const facility = facilities.find((f) => f.id === item.facilityId);
                const percentOfLeadTime = Math.min(
                  100,
                  Math.round((item.daysOfStockRemaining / item.replenishmentLeadDays) * 100)
                );

                return (
                  <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{item.medicineName}</span>
                        <span className="text-slate-500 ml-2">({facility?.name})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-rose-700 font-bold">
                          {item.daysOfStockRemaining.toFixed(1)} days stock left
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-600">Lead Time: {item.replenishmentLeadDays}d</span>
                      </div>
                    </div>

                    {/* Visual Countdown Bar */}
                    <div className="mt-2 w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                      <div
                        className="bg-rose-600 h-full transition-all"
                        style={{ width: `${percentOfLeadTime}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                      <span>Usable Stock: {item.usableStock} {item.unit}</span>
                      <span>Depletion Date: {item.predictedStockoutDate || 'Calculated Soon'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending Resource Redistribution Actions */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                  {t.dashboard.redistributionOpportunities}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Surplus-to-deficit transfer recommendations ready for CMO approval
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('redistribution')}
                className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Manage Transfers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingTransfers.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No pending transfer recommendations awaiting sign-off.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTransfers.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 bg-teal-50/50 rounded-lg border border-teal-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-teal-900 text-sm">{rec.medicineName}</span>
                        <span className="bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded text-[10px]">
                          {rec.urgency}
                        </span>
                      </div>
                      <div className="text-slate-600 mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                        <span>From: <strong>{rec.sourceFacilityName}</strong> (Surplus)</span>
                        <span>→</span>
                        <span>To: <strong>{rec.targetFacilityName}</strong> (Critical deficit)</span>
                        <span>·</span>
                        <span>Quantity: <strong>{rec.suggestedQuantity} {rec.unit}</strong></span>
                        <span>·</span>
                        <span>Transit: <strong>{rec.distanceKm} km ({rec.estimatedTransitHours} hrs)</strong></span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-1.5 italic">{rec.explanation}</p>
                    </div>

                    <button
                      onClick={() => onNavigateTab('redistribution')}
                      className="shrink-0 bg-teal-700 hover:bg-teal-800 text-white px-3 py-1.5 rounded-md font-semibold text-xs shadow-xs cursor-pointer"
                    >
                      Review & Approve
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live High Priority Alerts & Facility Adequacy Snapshot */}
        <div className="space-y-6">
          {/* Active Alerts List */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                  {t.dashboard.recentAlerts}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Active operational warnings</p>
              </div>
              <button
                onClick={() => onNavigateTab('alerts')}
                className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Inbox</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {openAlerts.map((alt) => (
                <div
                  key={alt.id}
                  className={`p-3 rounded-lg border text-xs ${
                    alt.severity === 'CRITICAL'
                      ? 'bg-rose-50/60 border-rose-200 text-rose-900'
                      : 'bg-amber-50/60 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{alt.title}</span>
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-white/70">
                      {alt.severity}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">{alt.facilityName}</div>
                  <p className="text-[11px] text-slate-500 mt-1">{alt.description}</p>
                  <div className="text-[10px] text-slate-400 mt-1.5 flex items-center justify-between">
                    <span>{alt.createdAt}</span>
                    <span className="font-medium text-slate-600">{alt.assignedTo}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Under-Resourced Facilities Spotlight */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                  {t.dashboard.urgentInterventions}
                </h3>
                <p className="text-xs text-slate-500">Facilities requiring CMO intervention</p>
              </div>
              <button
                onClick={() => onNavigateTab('interventions')}
                className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Cases</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {facilities
                .filter((f) => f.adequacyScore < 70)
                .map((f) => (
                  <div key={f.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{f.name}</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          f.adequacyScore < 50
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        Score: {f.adequacyScore}/100
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Block: {f.block} · MOIC: {f.administratorName}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-rose-700 font-semibold">
                        {f.operationalStatus === 'CRITICAL' ? 'Immediate Intervention' : 'Monitoring Required'}
                      </span>
                      <button
                        onClick={() => onNavigateTab('interventions')}
                        className="text-teal-700 hover:underline font-semibold cursor-pointer"
                      >
                        Open Case &rarr;
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
