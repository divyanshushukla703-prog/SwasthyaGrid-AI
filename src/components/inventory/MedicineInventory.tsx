import { useState } from 'react';
import { useTranslation } from '../../locales/i18n';
import { InventoryItem, StockTransaction, Facility, User } from '../../types';
import { StateManager } from '../../services/store';
import {
  Pill,
  Plus,
  Minus,
  RotateCcw,
  Search,
  Filter,
  AlertTriangle,
  History,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface MedicineInventoryProps {
  inventory: InventoryItem[];
  transactions: StockTransaction[];
  facilities: Facility[];
  currentUser: User;
}

export function MedicineInventory({
  inventory,
  transactions,
  facilities,
  currentUser,
}: MedicineInventoryProps) {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'inventory' | 'ledger'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modals for Transactions
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<InventoryItem | null>(null);

  // Form states
  const [batchNo, setBatchNo] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [quantity, setQuantity] = useState<number>(50);
  const [supplier, setSupplier] = useState('UPMSCL Central Depot');
  const [reason, setReason] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const filteredInventory = inventory.filter((item) => {
    if (selectedFacilityId !== 'ALL' && item.facilityId !== selectedFacilityId) return false;
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (
      searchQuery &&
      !item.medicineName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.genericName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.catalogId.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const filteredTransactions = transactions.filter((txn) => {
    if (selectedFacilityId !== 'ALL' && txn.facilityId !== selectedFacilityId) return false;
    return true;
  });

  const handleOpenReceipt = (item: InventoryItem) => {
    setActiveItem(item);
    setBatchNo(`BAT-${Math.floor(1000 + Math.random() * 9000)}`);
    setExpiryDate('2027-12-31');
    setQuantity(100);
    setSupplier('UPMSCL Central Depot');
    setErrorMessage('');
    setReceiptModalOpen(true);
  };

  const handleOpenIssue = (item: InventoryItem) => {
    setActiveItem(item);
    const firstActiveBatch = item.batches[0];
    setBatchNo(firstActiveBatch ? firstActiveBatch.batchNumber : '');
    setQuantity(10);
    setReason('Dispensed to OPD Pharmacy Counter');
    setErrorMessage('');
    setIssueModalOpen(true);
  };

  const handleOpenAdjust = (item: InventoryItem) => {
    setActiveItem(item);
    const firstActiveBatch = item.batches[0];
    setBatchNo(firstActiveBatch ? firstActiveBatch.batchNumber : '');
    setQuantity(0);
    setReason('Physical verification count audit');
    setErrorMessage('');
    setAdjustModalOpen(true);
  };

  const submitReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;
    try {
      StateManager.recordStockReceipt({
        facilityId: activeItem.facilityId,
        itemId: activeItem.id,
        batchNumber: batchNo,
        expiryDate,
        quantity: Number(quantity),
        supplier,
        user: currentUser,
      });
      setReceiptModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to record receipt');
    }
  };

  const submitIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;
    try {
      StateManager.recordStockIssue({
        facilityId: activeItem.facilityId,
        itemId: activeItem.id,
        batchNumber: batchNo,
        quantity: Number(quantity),
        reason,
        user: currentUser,
      });
      setIssueModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to record issue');
    }
  };

  const submitAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;
    try {
      StateManager.recordStockAdjustment({
        facilityId: activeItem.facilityId,
        itemId: activeItem.id,
        batchNumber: batchNo,
        quantityDelta: Number(quantity),
        reason,
        user: currentUser,
      });
      setAdjustModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to record adjustment');
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">{t.inventory.title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{t.inventory.subtitle}</p>
        </div>

        {/* Tab switch: Inventory vs Ledger */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Active Stock & Batches</span>
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === 'ledger'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{t.inventory.transactionsLedger}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-1 min-w-[260px] items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={t.inventory.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Facility Filter */}
          <select
            value={selectedFacilityId}
            onChange={(e) => setSelectedFacilityId(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium"
          >
            <option value="ALL">All Health Centres</option>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.type})
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium"
          >
            <option value="ALL">All Categories</option>
            <option value="ANTIBIOTIC">Antibiotics</option>
            <option value="ANALGESIC">Analgesics & Antipyretics</option>
            <option value="MATERNAL">Maternal & Child Health</option>
            <option value="VACCINE">Vaccines (Cold Chain)</option>
            <option value="DIABETIC">Diabetic Care</option>
            <option value="EMERGENCY">Emergency / ORS</option>
          </select>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'inventory' ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3 font-semibold">Medicine & Catalog</th>
                <th className="px-4 py-3 font-semibold">Facility</th>
                <th className="px-4 py-3 font-semibold">Category / Unit</th>
                <th className="px-4 py-3 font-semibold">Usable Stock</th>
                <th className="px-4 py-3 font-semibold">Daily Consumption</th>
                <th className="px-4 py-3 font-semibold">Stock Remaining</th>
                <th className="px-4 py-3 font-semibold">Lead Time Risk</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.map((item) => {
                const facility = facilities.find((f) => f.id === item.facilityId);
                const isCritical = item.daysOfStockRemaining <= item.replenishmentLeadDays;
                const hasNearExpiry = item.batches.some((b) => b.status === 'NEAR_EXPIRY');

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{item.medicineName}</div>
                      <div className="text-[11px] text-slate-500">
                        {item.genericName} · <span className="font-mono text-slate-400">{item.catalogId}</span>
                      </div>
                      {/* Active Batches info */}
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.batches.map((b) => (
                          <span
                            key={b.id}
                            className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                              b.status === 'NEAR_EXPIRY'
                                ? 'bg-amber-100 text-amber-800 font-semibold'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                            title={`Batch: ${b.batchNumber} | Exp: ${b.expiryDate} | Qty: ${b.quantity}`}
                          >
                            #{b.batchNumber} ({b.quantity}) · Exp {b.expiryDate}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-800">{facility?.name}</div>
                      <div className="text-[11px] text-slate-400">{facility?.block}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-700">{item.category}</div>
                      <div className="text-[11px] text-slate-500">{item.unit}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className={`font-bold text-sm ${isCritical ? 'text-rose-700 font-mono' : 'text-slate-900'}`}>
                        {item.usableStock} {item.unit}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Buffer Min: {item.minThreshold} | Reorder: {item.reorderLevel}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-700 font-medium">
                      {item.avgDailyConsumption.toFixed(1)} / day
                    </td>

                    <td className="px-4 py-3.5">
                      <div className={`font-bold ${isCritical ? 'text-rose-700' : 'text-slate-800'}`}>
                        {item.daysOfStockRemaining.toFixed(1)} days left
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Depletion: {item.predictedStockoutDate || 'Calculated soon'}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          item.leadTimeRisk === 'HIGH'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : item.leadTimeRisk === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {item.leadTimeRisk} ({item.replenishmentLeadDays}d lead)
                      </span>
                      {hasNearExpiry && (
                        <div className="text-[10px] text-amber-700 font-semibold mt-0.5">Near Expiry Batch</div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenReceipt(item)}
                          className="bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 px-2 py-1 rounded text-[11px] font-semibold cursor-pointer"
                          title="Record Stock Receipt"
                        >
                          + Receive
                        </button>
                        <button
                          onClick={() => handleOpenIssue(item)}
                          className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 px-2 py-1 rounded text-[11px] font-semibold cursor-pointer"
                          title="Record Stock Issue / Dispensation"
                        >
                          - Issue
                        </button>
                        <button
                          onClick={() => handleOpenAdjust(item)}
                          className="text-slate-400 hover:text-slate-700 p-1 rounded cursor-pointer"
                          title="Stock Adjustment"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Immutable Transaction Ledger View */
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3 font-semibold">Txn ID / Timestamp</th>
                <th className="px-4 py-3 font-semibold">Facility</th>
                <th className="px-4 py-3 font-semibold">Medicine & Batch</th>
                <th className="px-4 py-3 font-semibold">Txn Type</th>
                <th className="px-4 py-3 font-semibold">Quantity Delta</th>
                <th className="px-4 py-3 font-semibold">Balance After</th>
                <th className="px-4 py-3 font-semibold">Authorized By</th>
                <th className="px-4 py-3 font-semibold">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredTransactions.map((txn) => {
                const facility = facilities.find((f) => f.id === txn.facilityId);
                const isPositive = txn.quantity > 0;

                return (
                  <tr key={txn.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-sans">
                      <div className="font-semibold text-slate-900">{txn.id}</div>
                      <div className="text-[10px] text-slate-400">{txn.timestamp}</div>
                    </td>
                    <td className="px-4 py-3 font-sans text-slate-800">{facility?.name}</td>
                    <td className="px-4 py-3 font-sans">
                      <div className="font-semibold text-slate-900">{txn.medicineName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Batch: #{txn.batchNumber}</div>
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          txn.type === 'RECEIPT' || txn.type === 'TRANSFER_IN'
                            ? 'bg-emerald-100 text-emerald-800'
                            : txn.type === 'ISSUE' || txn.type === 'TRANSFER_OUT'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {txn.type}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 font-bold text-sm ${
                        isPositive ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {isPositive ? `+${txn.quantity}` : txn.quantity}
                    </td>
                    <td className="px-4 py-3 text-slate-900 font-bold">{txn.balanceAfter}</td>
                    <td className="px-4 py-3 font-sans">
                      <div className="text-slate-800">{txn.authorizedBy}</div>
                      <div className="text-[10px] text-teal-600">{txn.userRole}</div>
                    </td>
                    <td className="px-4 py-3 font-sans text-slate-600 italic">{txn.reason || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Record Stock Receipt */}
      {receiptModalOpen && activeItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Record Stock Receipt</h3>
            <p className="text-xs text-slate-500 mt-1">
              Adding verified batch receipt for <strong>{activeItem.medicineName}</strong>
            </p>

            {errorMessage && (
              <div className="p-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs mt-3">
                {errorMessage}
              </div>
            )}

            <form onSubmit={submitReceipt} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Batch Number</label>
                <input
                  type="text"
                  required
                  value={batchNo}
                  onChange={(e) => setBatchNo(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Receipt Quantity ({activeItem.unit})</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Supplier / Depository</label>
                <input
                  type="text"
                  required
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReceiptModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold cursor-pointer"
                >
                  Confirm Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Stock Issue */}
      {issueModalOpen && activeItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Record Stock Issue / Dispense</h3>
            <p className="text-xs text-slate-500 mt-1">
              Deduct usable stock for <strong>{activeItem.medicineName}</strong>
            </p>

            {errorMessage && (
              <div className="p-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs mt-3">
                {errorMessage}
              </div>
            )}

            <form onSubmit={submitIssue} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Select Batch (FEFO Guidance)</label>
                <select
                  value={batchNo}
                  onChange={(e) => setBatchNo(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                >
                  {activeItem.batches.map((b) => (
                    <option key={b.id} value={b.batchNumber}>
                      Batch #{b.batchNumber} (Available: {b.quantity}) · Exp: {b.expiryDate}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Quantity to Dispense ({activeItem.unit})</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={activeItem.usableStock}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg p-2 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Dispensation Reason / Clinical Department</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIssueModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold cursor-pointer"
                >
                  Confirm Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Stock Adjustment (Audited) */}
      {adjustModalOpen && activeItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Audited Stock Adjustment</h3>
            <p className="text-xs text-slate-500 mt-1">
              Correct physical balance for <strong>{activeItem.medicineName}</strong> (Current: {activeItem.usableStock})
            </p>

            {errorMessage && (
              <div className="p-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs mt-3">
                {errorMessage}
              </div>
            )}

            <form onSubmit={submitAdjust} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Batch Number</label>
                <select
                  value={batchNo}
                  onChange={(e) => setBatchNo(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                >
                  {activeItem.batches.map((b) => (
                    <option key={b.id} value={b.batchNumber}>
                      Batch #{b.batchNumber} (Current: {b.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Quantity Delta (Positive to add, Negative to deduct)
                </label>
                <input
                  type="number"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg p-2 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Mandatory Regulatory Reason</label>
                <textarea
                  required
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Physical inventory reconciliation difference found during monthly CMO inspection."
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold cursor-pointer"
                >
                  Commit Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
