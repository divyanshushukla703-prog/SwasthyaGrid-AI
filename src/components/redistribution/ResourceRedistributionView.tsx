import { useState } from 'react';
import { useTranslation } from '../../locales/i18n';
import { RedistributionRecommendation, Facility, InventoryItem, User } from '../../types';
import { StateManager } from '../../services/store';
import {
  ArrowLeftRight,
  CheckCircle2,
  XCircle,
  Truck,
  PackageCheck,
  ShieldCheck,
  Clock,
  AlertTriangle,
  ArrowRight,
  MapPin,
} from 'lucide-react';

interface ResourceRedistributionViewProps {
  redistributions: RedistributionRecommendation[];
  facilities: Facility[];
  currentUser: User;
}

export function ResourceRedistributionView({
  redistributions,
  facilities,
  currentUser,
}: ResourceRedistributionViewProps) {
  const { t } = useTranslation();

  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [activeRecId, setActiveRecId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const filteredRecs = redistributions.filter((r) => {
    if (selectedStatus !== 'ALL' && r.status !== selectedStatus) return false;
    return true;
  });

  const pendingCount = redistributions.filter((r) => r.status === 'PENDING_APPROVAL').length;
  const inTransitCount = redistributions.filter((r) => r.status === 'DISPATCHED').length;
  const completedCount = redistributions.filter((r) => r.status === 'RECEIVED').length;

  const handleApprove = (recId: string) => {
    try {
      StateManager.approveRedistribution(recId, currentUser);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOpenReject = (recId: string) => {
    setActiveRecId(recId);
    setRejectReason('Donor reserves require re-verification or cold chain transit constraint.');
    setErrorMessage('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRecId) return;
    try {
      StateManager.rejectRedistribution(activeRecId, rejectReason, currentUser);
      setRejectModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleDispatch = (recId: string) => {
    try {
      StateManager.dispatchRedistribution(recId, currentUser);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleConfirmReceipt = (recId: string) => {
    try {
      StateManager.receiveRedistribution(recId, currentUser);
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
            <h2 className="text-base font-bold text-slate-900 tracking-tight">{t.redistribution.title}</h2>
            <span className="text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded">
              Optimization Engine: Fair Allocation with Donor Safety Reserve Safeguard
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{t.redistribution.subtitle}</p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium"
          >
            <option value="ALL">All Lifecycle Stages</option>
            <option value="PENDING_APPROVAL">Pending CMO Approval</option>
            <option value="APPROVED">Approved (Awaiting Dispatch)</option>
            <option value="DISPATCHED">In Transit (Dispatched)</option>
            <option value="RECEIVED">Received & Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Lifecycle Flow Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-xs">
          <div className="text-amber-800 font-medium">Pending CMO Sanction</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{pendingCount}</div>
          <div className="text-[11px] text-amber-600 mt-1">Recommended by AI stockout model</div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-xs">
          <div className="text-blue-800 font-medium">In Transit / Dispatched</div>
          <div className="text-2xl font-bold text-blue-700 mt-1">{inTransitCount}</div>
          <div className="text-[11px] text-blue-600 mt-1">Stock deducted from donor facility</div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-xs">
          <div className="text-emerald-800 font-medium">Completed & Verified</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{completedCount}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Inventory ledger credited to recipient</div>
        </div>
      </div>

      {/* Redistribution Recommendations Cards List */}
      <div className="space-y-4">
        {filteredRecs.map((rec) => {
          const isPending = rec.status === 'PENDING_APPROVAL';
          const isApproved = rec.status === 'APPROVED';
          const isDispatched = rec.status === 'DISPATCHED';
          const isReceived = rec.status === 'RECEIVED';
          const isRejected = rec.status === 'REJECTED';

          return (
            <div
              key={rec.id}
              className={`border rounded-xl p-5 shadow-xs transition-all text-xs ${
                isPending
                  ? 'bg-amber-50/30 border-amber-300'
                  : isApproved
                  ? 'bg-teal-50/30 border-teal-300'
                  : isDispatched
                  ? 'bg-blue-50/30 border-blue-300'
                  : isReceived
                  ? 'bg-emerald-50/20 border-emerald-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-200/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center text-teal-800 font-bold shrink-0">
                    <ArrowLeftRight className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{rec.medicineName}</h3>
                      <span className="font-mono text-[10px] text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                        Batch #{rec.batchNumber} (Exp: {rec.expiryDate})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Recommendation ID: <span className="font-mono font-medium">{rec.id}</span> · Created:{' '}
                      {rec.createdAt}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold uppercase px-2.5 py-1 rounded text-[11px] ${
                      isPending
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : isApproved
                        ? 'bg-teal-100 text-teal-800 border border-teal-300'
                        : isDispatched
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : isReceived
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    Status: {rec.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Source vs Target Facility Balance Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Donor Side */}
                <div className="p-3.5 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase">
                    <span>{t.redistribution.donorFacility}</span>
                    <span className="text-emerald-700 font-bold">Surplus Protected</span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm mt-1">{rec.sourceFacilityName}</div>
                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px]">
                    <div>
                      <div className="text-slate-400">Current Stock</div>
                      <div className="font-bold text-slate-800">{rec.sourceCurrentStock} {rec.unit}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Safety Reserve</div>
                      <div className="font-bold text-teal-800">{rec.sourceSafetyReserve} {rec.unit}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">After Transfer</div>
                      <div className="font-bold text-emerald-700 font-mono">
                        {rec.sourceStockAfterTransfer} {rec.unit}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recipient Side */}
                <div className="p-3.5 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase">
                    <span>{t.redistribution.recipientFacility}</span>
                    <span className="text-rose-700 font-bold">Stockout Risk</span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm mt-1">{rec.targetFacilityName}</div>
                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px]">
                    <div>
                      <div className="text-slate-400">Shortage Stock</div>
                      <div className="font-bold text-rose-700 font-mono">{rec.targetCurrentStock} {rec.unit}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Depletion in</div>
                      <div className="font-bold text-rose-700">{rec.targetStockoutDays} days</div>
                    </div>
                    <div>
                      <div className="text-slate-400">After Receipt</div>
                      <div className="font-bold text-emerald-700 font-mono">
                        {rec.targetStockAfterReceipt} {rec.unit}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transit & AI Explanation Banner */}
              <div className="mt-3 p-3 bg-slate-100/70 rounded-lg text-[11px] text-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>
                    Suggested Transfer: <strong>{rec.suggestedQuantity} {rec.unit}</strong> · Travel Distance:{' '}
                    <strong>{rec.distanceKm} km</strong> (Est. transit: <strong>{rec.estimatedTransitHours} hrs</strong>)
                  </span>
                </div>
                {rec.approvalActor && (
                  <div className="text-slate-500">
                    Sanctioned by: <span className="font-medium text-slate-800">{rec.approvalActor}</span>
                  </div>
                )}
              </div>
              <p className="mt-2 text-[11px] text-slate-600 italic">{rec.explanation}</p>

              {/* Action Buttons based on status */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-end gap-2">
                {isPending && (
                  <>
                    <button
                      onClick={() => handleOpenReject(rec.id)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium cursor-pointer"
                    >
                      Reject Recommendation
                    </button>
                    <button
                      onClick={() => handleApprove(rec.id)}
                      className="px-4 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold shadow-xs cursor-pointer"
                    >
                      Approve Stock Redistribution
                    </button>
                  </>
                )}

                {isApproved && (
                  <button
                    onClick={() => handleDispatch(rec.id)}
                    className="px-4 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Dispatch Stock (Deduct Physical Inventory from Donor)</span>
                  </button>
                )}

                {isDispatched && (
                  <button
                    onClick={() => handleConfirmReceipt(rec.id)}
                    className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span>Confirm Receipt & Verification (Credit Physical Inventory to Recipient)</span>
                  </button>
                )}

                {isReceived && (
                  <div className="flex items-center gap-1 text-emerald-800 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Successfully Transferred & Verified at {rec.receivedAt}</span>
                  </div>
                )}

                {isRejected && (
                  <div className="text-rose-700 font-medium">
                    Rejected: {rec.rejectionReason}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-xs">
            <h3 className="text-base font-bold text-slate-900">Reject Redistribution Recommendation</h3>
            <p className="text-slate-500 mt-1">Provide an audited reason for rejecting this AI transfer recommendation</p>

            {errorMessage && (
              <div className="p-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg mt-3">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleConfirmReject} className="space-y-3 mt-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Rejection Reason</label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-semibold cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
