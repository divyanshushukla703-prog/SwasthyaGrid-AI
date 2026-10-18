import { useState } from 'react';
import { useTranslation } from '../../locales/i18n';
import { Facility, User } from '../../types';
import { StateManager } from '../../services/store';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
} from 'lucide-react';

interface BulkDataImportProps {
  facilities: Facility[];
  currentUser: User;
}

interface ParsedRow {
  rowNumber: number;
  data: Record<string, string>;
  isValid: boolean;
  errors: string[];
}

export function BulkDataImport({ facilities, currentUser }: BulkDataImportProps) {
  const { t } = useTranslation();

  const [importType, setImportType] = useState<'INVENTORY_RECEIPT' | 'DAILY_FOOTFALL'>('INVENTORY_RECEIPT');
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [commitMessage, setCommitMessage] = useState('');

  const sampleInventoryCsv = `FacilityCode,MedicineName,BatchNumber,Quantity,ExpiryDate,Supplier
UP-LKO-CHC-001,Amoxicillin Capsules 500mg,AMX-BATCH-882,150,2027-10-31,UPMSCL Central Store
UP-LKO-PHC-102,Paracetamol Tablets 500mg,PCM-BATCH-401,200,2027-08-31,UPMSCL
UP-LKO-CHC-002,Oral Rehydration Salts (ORS) 21.8g,ORS-BATCH-991,500,2027-05-31,Govt Medical Depot`;

  const sampleFootfallCsv = `FacilityCode,OPDVisits,IPDAdmissions,EmergencyVisits,ReferralsIn,ReferralsOut,Discharges,Notes
UP-LKO-CHC-001,290,12,24,5,3,9,Routine weekly clinic
UP-LKO-PHC-102,160,3,10,2,4,2,ANC registration drive
UP-LKO-CHC-003,420,18,35,8,4,14,Surge in pediatric fever`;

  const handleLoadSample = () => {
    setCommitMessage('');
    if (importType === 'INVENTORY_RECEIPT') {
      setCsvText(sampleInventoryCsv);
      validateCsv(sampleInventoryCsv, 'INVENTORY_RECEIPT');
    } else {
      setCsvText(sampleFootfallCsv);
      validateCsv(sampleFootfallCsv, 'DAILY_FOOTFALL');
    }
  };

  const handleDownloadTemplate = () => {
    const content = importType === 'INVENTORY_RECEIPT' ? sampleInventoryCsv : sampleFootfallCsv;
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SwasthyaGrid_Template_${importType}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const validateCsv = (text: string, type: 'INVENTORY_RECEIPT' | 'DAILY_FOOTFALL') => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      setParsedRows([]);
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim());
    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      const rowData: Record<string, string> = {};
      headers.forEach((h, idx) => {
        rowData[h] = cols[idx] || '';
      });

      const errors: string[] = [];

      // Validate facility code exists
      const facilityCode = rowData['FacilityCode'];
      const facility = facilities.find((f) => f.code === facilityCode);
      if (!facility) {
        errors.push(`Invalid FacilityCode: '${facilityCode}' not registered in district master.`);
      }

      if (type === 'INVENTORY_RECEIPT') {
        if (!rowData['MedicineName']) errors.push('MedicineName is required');
        if (!rowData['BatchNumber']) errors.push('BatchNumber is required');
        const qty = Number(rowData['Quantity']);
        if (isNaN(qty) || qty <= 0) errors.push('Quantity must be a positive integer');
        if (!rowData['ExpiryDate'] || !rowData['ExpiryDate'].match(/^\d{4}-\d{2}-\d{2}$/)) {
          errors.push('ExpiryDate must follow YYYY-MM-DD format');
        }
      } else {
        const opd = Number(rowData['OPDVisits']);
        if (isNaN(opd) || opd < 0) errors.push('OPDVisits must be a non-negative number');
      }

      rows.push({
        rowNumber: i,
        data: rowData,
        isValid: errors.length === 0,
        errors,
      });
    }

    setParsedRows(rows);
  };

  const handleCommit = () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    let committedCount = 0;

    validRows.forEach((row) => {
      const facility = facilities.find((f) => f.code === row.data['FacilityCode']);
      if (!facility) return;

      if (importType === 'INVENTORY_RECEIPT') {
        const items = StateManager.getState().inventory.filter((i) => i.facilityId === facility.id);
        const matchedItem = items.find(
          (i) => i.medicineName.toLowerCase() === row.data['MedicineName'].toLowerCase()
        ) || items[0];

        if (matchedItem) {
          StateManager.recordStockReceipt({
            facilityId: facility.id,
            itemId: matchedItem.id,
            batchNumber: row.data['BatchNumber'],
            expiryDate: row.data['ExpiryDate'],
            quantity: Number(row.data['Quantity']),
            supplier: row.data['Supplier'] || 'UPMSCL Bulk Import',
            user: currentUser,
          });
          committedCount++;
        }
      } else {
        StateManager.recordPatientFootfall(
          {
            facilityId: facility.id,
            facilityName: facility.name,
            date: new Date().toISOString().split('T')[0],
            opdVisits: Number(row.data['OPDVisits'] || 100),
            ipdAdmissions: Number(row.data['IPDAdmissions'] || 10),
            emergencyVisits: Number(row.data['EmergencyVisits'] || 15),
            referralsIn: Number(row.data['ReferralsIn'] || 2),
            referralsOut: Number(row.data['ReferralsOut'] || 1),
            discharges: Number(row.data['Discharges'] || 8),
            departmentCounts: { generalMedicine: 60, maternalChild: 30, immunization: 15, geriatric: 5 },
            demandSpikePercent: 5.0,
            isSpikeAlert: false,
            notes: row.data['Notes'] || 'Imported via CSV',
          },
          currentUser
        );
        committedCount++;
      }
    });

    setCommitMessage(`Successfully validated and committed ${committedCount} operational records to live ledger.`);
    setParsedRows([]);
    setCsvText('');
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const errorCount = parsedRows.filter((r) => !r.isValid).length;

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">{t.import.title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{t.import.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.import.downloadTemplate}</span>
          </button>

          <button
            onClick={handleLoadSample}
            className="flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Load Sample Valid Data</span>
          </button>
        </div>
      </div>

      {commitMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{commitMessage}</span>
        </div>
      )}

      {/* CSV Input Workspace */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label className="font-semibold text-slate-700">Data Domain:</label>
            <select
              value={importType}
              onChange={(e) => {
                setImportType(e.target.value as any);
                setParsedRows([]);
              }}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 font-medium text-slate-800"
            >
              <option value="INVENTORY_RECEIPT">Medicine Inventory Batch Receipts</option>
              <option value="DAILY_FOOTFALL">Daily Patient Footfall Log</option>
            </select>
          </div>

          <div className="text-slate-400 text-[11px]">
            Ensure column headers strictly match standard UP Health MIS schema.
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">
            CSV / Spreadsheet Plain Text (Paste raw CSV below):
          </label>
          <textarea
            rows={5}
            value={csvText}
            onChange={(e) => {
              setCsvText(e.target.value);
              validateCsv(e.target.value, importType);
            }}
            placeholder="Paste comma-separated rows or click 'Load Sample Valid Data' above..."
            className="w-full border border-slate-300 rounded-lg p-3 font-mono text-[11px]"
          />
        </div>

        {/* Validation Summary and Commit */}
        {parsedRows.length > 0 && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-800 text-sm">{t.import.previewRows}</span>
                <span className="text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                  {validCount} {t.import.validRows}
                </span>
                {errorCount > 0 && (
                  <span className="text-rose-700 font-semibold bg-rose-100 px-2 py-0.5 rounded text-[11px]">
                    {errorCount} {t.import.errorRows}
                  </span>
                )}
              </div>

              <button
                onClick={handleCommit}
                disabled={validCount === 0}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs shadow-xs cursor-pointer"
              >
                {t.import.commitImport} ({validCount} Records)
              </button>
            </div>

            {/* Row Validation Inspection */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {parsedRows.map((row) => (
                <div
                  key={row.rowNumber}
                  className={`p-2.5 rounded-lg border text-[11px] flex items-center justify-between gap-3 ${
                    row.isValid ? 'bg-white border-slate-200' : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-400">Row #{row.rowNumber}:</span>
                    <span className="font-mono text-slate-700 truncate max-w-md">
                      {JSON.stringify(row.data)}
                    </span>
                  </div>

                  {row.isValid ? (
                    <div className="flex items-center gap-1 text-emerald-700 font-semibold shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Valid</span>
                    </div>
                  ) : (
                    <div className="text-rose-700 font-medium shrink-0">
                      {row.errors.join('; ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
