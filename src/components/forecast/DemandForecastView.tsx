import { useState, useMemo } from 'react';
import { useTranslation } from '../../locales/i18n';
import { DemandForecast, InventoryItem, Facility } from '../../types';
import { computeDemandForecasts } from '../../services/aiService';
import {
  TrendingUp,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';

interface DemandForecastViewProps {
  inventory: InventoryItem[];
  facilities: Facility[];
}

export function DemandForecastView({ inventory, facilities }: DemandForecastViewProps) {
  const { t } = useTranslation();
  const [selectedFacility, setSelectedFacility] = useState<string>('ALL');
  const [recalcCounter, setRecalcCounter] = useState(0);

  const forecasts = useMemo(() => {
    return computeDemandForecasts(inventory, facilities);
  }, [inventory, facilities, recalcCounter]);

  const filteredForecasts = forecasts.filter((fc) => {
    if (selectedFacility !== 'ALL' && fc.facilityId !== selectedFacility) return false;
    return true;
  });

  const handleRecalculate = () => {
    setRecalcCounter((prev) => prev + 1);
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">{t.forecast.title}</h2>
            <span className="text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded">
              Time-Series Model: Exponential Smoothing (α=0.35)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{t.forecast.subtitle}</p>
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
            onClick={handleRecalculate}
            className="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.forecast.runModel}</span>
          </button>
        </div>
      </div>

      {/* Model Transparency & Formula Explainer */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-teal-600 shrink-0" />
          <span>
            <strong>Deterministic Forecast Equation:</strong>{' '}
            <code className="bg-white px-2 py-0.5 rounded border border-slate-300 font-mono text-[11px] text-slate-800">
              Days Remaining = Usable Stock / Projected Daily Velocity
            </code>
          </span>
        </div>
        <div className="text-[11px] text-slate-500">
          Confidence intervals derived from 14-day sample variance. Automated background recalculation on every stock transaction.
        </div>
      </div>

      {/* Forecast Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredForecasts.map((fc) => {
          const isCritical = fc.riskSeverity === 'CRITICAL';
          const isWarning = fc.riskSeverity === 'WARNING';

          return (
            <div
              key={fc.id}
              className={`rounded-xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                isCritical
                  ? 'bg-rose-50/40 border-rose-300'
                  : isWarning
                  ? 'bg-amber-50/40 border-amber-300'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">{fc.facilityName}</span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      isCritical
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : isWarning
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {fc.riskSeverity}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mt-1">{fc.medicineName}</h3>

                {/* Numbers */}
                <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-white/80 rounded-lg border border-slate-200/80 text-xs">
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase font-semibold">Current Stock</div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">{fc.currentStock} units</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase font-semibold">Est. Depletion</div>
                    <div className={`font-bold text-sm mt-0.5 ${isCritical ? 'text-rose-700' : 'text-slate-800'}`}>
                      {fc.daysRemaining} days left
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase font-semibold">Daily Velocity</div>
                    <div className="font-semibold text-slate-800 mt-0.5">{fc.projectedDailyDemand} / day</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] uppercase font-semibold">Depot Lead Time</div>
                    <div className="font-semibold text-slate-800 mt-0.5">{fc.replenishmentLeadDays} days</div>
                  </div>
                </div>

                {/* Confidence Interval & Data Completeness */}
                <div className="mt-3 text-[11px] text-slate-600 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Demand 90% CI:</span>
                    <span className="font-mono text-slate-700">
                      [{fc.confidenceInterval.lower} – {fc.confidenceInterval.upper}] / day
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Data Completeness:</span>
                    <span className="font-semibold text-emerald-700">{fc.dataCompletenessScore}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Stockout Date:</span>
                    <span className="font-semibold text-slate-800">{fc.expectedStockoutDate || 'N/A'}</span>
                  </div>
                </div>

                {/* Influencing factors */}
                <div className="mt-3 pt-3 border-t border-slate-200 text-[11px]">
                  <div className="font-semibold text-slate-700 mb-1">{t.forecast.influencingFactors}:</div>
                  <ul className="space-y-1 text-slate-500">
                    {fc.influencingFactors.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-teal-600 font-bold">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommended Action */}
              <div
                className={`mt-4 p-2.5 rounded-lg text-[11px] font-medium border ${
                  isCritical
                    ? 'bg-rose-100 text-rose-900 border-rose-300'
                    : isWarning
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <strong>Action:</strong> {fc.recommendedAction}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
