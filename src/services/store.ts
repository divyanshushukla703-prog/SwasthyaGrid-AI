import {
  Facility,
  InventoryItem,
  StockTransaction,
  PatientFootfall,
  Bed,
  StaffRoster,
  DiagnosticTest,
  Alert,
  FacilityInterventionCase,
  RedistributionRecommendation,
  AuditLog,
  User,
  OperationalMetrics,
  UserRole,
} from '../types';
import {
  SEED_FACILITIES,
  SEED_INVENTORY,
  SEED_STOCK_TRANSACTIONS,
  SEED_BEDS,
  SEED_STAFF_ROSTER,
  SEED_DIAGNOSTICS,
  SEED_FOOTFALL,
  SEED_ALERTS,
  SEED_REDISTRIBUTION_RECOMMENDATIONS,
  SEED_INTERVENTIONS,
  SEED_AUDIT_LOGS,
  SEED_USERS,
} from '../data/seedData';

const STORAGE_KEY = 'swasthyagrid_state_v1';

export interface AppState {
  currentUser: User;
  facilities: Facility[];
  inventory: InventoryItem[];
  transactions: StockTransaction[];
  beds: Bed[];
  roster: StaffRoster[];
  diagnostics: DiagnosticTest[];
  footfall: PatientFootfall[];
  alerts: Alert[];
  redistributions: RedistributionRecommendation[];
  interventions: FacilityInterventionCase[];
  auditLogs: AuditLog[];
  isOnline: boolean;
  offlineQueueCount: number;
}

function loadInitialState(): AppState {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          currentUser: parsed.currentUser || SEED_USERS[0],
          facilities: parsed.facilities || SEED_FACILITIES,
          inventory: parsed.inventory || SEED_INVENTORY,
          transactions: parsed.transactions || SEED_STOCK_TRANSACTIONS,
          beds: parsed.beds || SEED_BEDS,
          roster: parsed.roster || SEED_STAFF_ROSTER,
          diagnostics: parsed.diagnostics || SEED_DIAGNOSTICS,
          footfall: parsed.footfall || SEED_FOOTFALL,
          alerts: parsed.alerts || SEED_ALERTS,
          redistributions: parsed.redistributions || SEED_REDISTRIBUTION_RECOMMENDATIONS,
          interventions: parsed.interventions || SEED_INTERVENTIONS,
          auditLogs: parsed.auditLogs || SEED_AUDIT_LOGS,
          isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
          offlineQueueCount: 0,
        };
      }
    }
  } catch (e) {
    console.error('Failed to parse saved state:', e);
  }

  return {
    currentUser: SEED_USERS[0], // Dr. Rajesh Sharma (District CMO)
    facilities: SEED_FACILITIES,
    inventory: SEED_INVENTORY,
    transactions: SEED_STOCK_TRANSACTIONS,
    beds: SEED_BEDS,
    roster: SEED_STAFF_ROSTER,
    diagnostics: SEED_DIAGNOSTICS,
    footfall: SEED_FOOTFALL,
    alerts: SEED_ALERTS,
    redistributions: SEED_REDISTRIBUTION_RECOMMENDATIONS,
    interventions: SEED_INTERVENTIONS,
    auditLogs: SEED_AUDIT_LOGS,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    offlineQueueCount: 0,
  };
}

let state: AppState = loadInitialState();
const listeners = new Set<(state: AppState) => void>();

function notify() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }
  listeners.forEach((l) => l({ ...state }));
}

export const StateManager = {
  getState(): AppState {
    return { ...state };
  },

  subscribe(listener: (state: AppState) => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  setCurrentUser(user: User) {
    state.currentUser = user;
    notify();
  },

  resetToSeed() {
    state = {
      currentUser: SEED_USERS[0],
      facilities: JSON.parse(JSON.stringify(SEED_FACILITIES)),
      inventory: JSON.parse(JSON.stringify(SEED_INVENTORY)),
      transactions: JSON.parse(JSON.stringify(SEED_STOCK_TRANSACTIONS)),
      beds: JSON.parse(JSON.stringify(SEED_BEDS)),
      roster: JSON.parse(JSON.stringify(SEED_STAFF_ROSTER)),
      diagnostics: JSON.parse(JSON.stringify(SEED_DIAGNOSTICS)),
      footfall: JSON.parse(JSON.stringify(SEED_FOOTFALL)),
      alerts: JSON.parse(JSON.stringify(SEED_ALERTS)),
      redistributions: JSON.parse(JSON.stringify(SEED_REDISTRIBUTION_RECOMMENDATIONS)),
      interventions: JSON.parse(JSON.stringify(SEED_INTERVENTIONS)),
      auditLogs: JSON.parse(JSON.stringify(SEED_AUDIT_LOGS)),
      isOnline: navigator.onLine,
      offlineQueueCount: 0,
    };
    notify();
  },

  // Record Stock Receipt
  recordStockReceipt(params: {
    facilityId: string;
    itemId: string;
    batchNumber: string;
    expiryDate: string;
    quantity: number;
    supplier: string;
    user: User;
  }) {
    const item = state.inventory.find((i) => i.id === params.itemId);
    if (!item) throw new Error('Item not found');

    const prevUsable = item.usableStock;
    item.usableStock += params.quantity;
    item.lastRestockDate = new Date().toISOString().split('T')[0];

    // check if batch already exists
    let batch = item.batches.find((b) => b.batchNumber === params.batchNumber);
    if (batch) {
      batch.quantity += params.quantity;
    } else {
      batch = {
        id: 'B-' + Date.now(),
        itemId: item.id,
        batchNumber: params.batchNumber,
        expiryDate: params.expiryDate,
        quantity: params.quantity,
        supplier: params.supplier,
        receivedDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
      };
      item.batches.push(batch);
    }

    // recalculate days remaining & lead risk
    this.recalculateInventoryMetrics(item);

    const txn: StockTransaction = {
      id: 'TXN-' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      facilityId: params.facilityId,
      itemId: item.id,
      medicineName: item.medicineName,
      batchNumber: params.batchNumber,
      type: 'RECEIPT',
      quantity: params.quantity,
      balanceAfter: item.usableStock,
      reason: `Receipt from ${params.supplier}`,
      authorizedBy: params.user.name,
      userRole: params.user.role,
    };
    state.transactions.unshift(txn);

    this.addAuditLog({
      actor: params.user,
      action: 'STOCK_RECEIPT',
      facilityId: params.facilityId,
      entityType: 'INVENTORY',
      entityId: item.id,
      previousValue: `Stock: ${prevUsable} ${item.unit}`,
      newValue: `Stock: ${item.usableStock} ${item.unit} (+${params.quantity})`,
    });

    this.evaluateFacilityAdequacy(params.facilityId);
    notify();
  },

  // Record Stock Issue / Dispense
  recordStockIssue(params: {
    facilityId: string;
    itemId: string;
    batchNumber: string;
    quantity: number;
    reason: string;
    user: User;
  }) {
    const item = state.inventory.find((i) => i.id === params.itemId);
    if (!item) throw new Error('Item not found');

    if (item.usableStock < params.quantity) {
      throw new Error(`Insufficient usable stock. Available: ${item.usableStock}, Requested: ${params.quantity}`);
    }

    const batch = item.batches.find((b) => b.batchNumber === params.batchNumber);
    if (batch) {
      if (batch.quantity < params.quantity) {
        throw new Error(`Batch ${params.batchNumber} has only ${batch.quantity} units available.`);
      }
      batch.quantity -= params.quantity;
    }

    const prevUsable = item.usableStock;
    item.usableStock -= params.quantity;
    this.recalculateInventoryMetrics(item);

    const txn: StockTransaction = {
      id: 'TXN-' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      facilityId: params.facilityId,
      itemId: item.id,
      medicineName: item.medicineName,
      batchNumber: params.batchNumber,
      type: 'ISSUE',
      quantity: -params.quantity,
      balanceAfter: item.usableStock,
      reason: params.reason || 'Dispensed to Pharmacy/OPD',
      authorizedBy: params.user.name,
      userRole: params.user.role,
    };
    state.transactions.unshift(txn);

    this.addAuditLog({
      actor: params.user,
      action: 'STOCK_ISSUE',
      facilityId: params.facilityId,
      entityType: 'INVENTORY',
      entityId: item.id,
      previousValue: `Stock: ${prevUsable} ${item.unit}`,
      newValue: `Stock: ${item.usableStock} ${item.unit} (-${params.quantity})`,
    });

    // Check if critical alert needed
    if (item.daysOfStockRemaining <= item.replenishmentLeadDays) {
      this.triggerAlert({
        facilityId: params.facilityId,
        facilityName: state.facilities.find((f) => f.id === params.facilityId)?.name || 'Facility',
        category: 'MEDICINE_SHORTAGE',
        severity: item.daysOfStockRemaining < 3 ? 'CRITICAL' : 'WARNING',
        title: `Stockout Risk: ${item.medicineName} (${item.daysOfStockRemaining.toFixed(1)} days left)`,
        description: `Current usable stock is ${item.usableStock} ${item.unit}. Predicted depletion before supplier replenishment lead time (${item.replenishmentLeadDays} days).`,
        evidence: `Usable: ${item.usableStock} | Daily Consumption: ${item.avgDailyConsumption} | Lead Time: ${item.replenishmentLeadDays}d`,
      });
    }

    this.evaluateFacilityAdequacy(params.facilityId);
    notify();
  },

  // Record Stock Adjustment
  recordStockAdjustment(params: {
    facilityId: string;
    itemId: string;
    batchNumber: string;
    quantityDelta: number;
    reason: string;
    user: User;
  }) {
    const item = state.inventory.find((i) => i.id === params.itemId);
    if (!item) throw new Error('Item not found');

    const prevUsable = item.usableStock;
    const newStock = item.usableStock + params.quantityDelta;
    if (newStock < 0) {
      throw new Error('Adjustment cannot result in negative stock balance.');
    }

    item.usableStock = newStock;
    const batch = item.batches.find((b) => b.batchNumber === params.batchNumber);
    if (batch) {
      batch.quantity = Math.max(0, batch.quantity + params.quantityDelta);
    }

    this.recalculateInventoryMetrics(item);

    const txn: StockTransaction = {
      id: 'TXN-' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      facilityId: params.facilityId,
      itemId: item.id,
      medicineName: item.medicineName,
      batchNumber: params.batchNumber,
      type: 'ADJUSTMENT',
      quantity: params.quantityDelta,
      balanceAfter: item.usableStock,
      reason: `Audited Adjustment: ${params.reason}`,
      authorizedBy: params.user.name,
      userRole: params.user.role,
    };
    state.transactions.unshift(txn);

    this.addAuditLog({
      actor: params.user,
      action: 'STOCK_ADJUSTMENT',
      facilityId: params.facilityId,
      entityType: 'INVENTORY',
      entityId: item.id,
      previousValue: `Stock: ${prevUsable} ${item.unit}`,
      newValue: `Stock: ${item.usableStock} ${item.unit} (Delta: ${params.quantityDelta}) | Reason: ${params.reason}`,
    });

    this.evaluateFacilityAdequacy(params.facilityId);
    notify();
  },

  recalculateInventoryMetrics(item: InventoryItem) {
    if (item.avgDailyConsumption <= 0) {
      item.daysOfStockRemaining = 999;
      item.predictedStockoutDate = null;
      item.leadTimeRisk = 'SAFE';
      return;
    }

    const daysRemaining = Math.max(0, item.usableStock / item.avgDailyConsumption);
    item.daysOfStockRemaining = parseFloat(daysRemaining.toFixed(1));

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + Math.floor(daysRemaining));
    item.predictedStockoutDate = targetDate.toISOString().split('T')[0];

    if (daysRemaining <= item.replenishmentLeadDays * 0.5) {
      item.leadTimeRisk = 'HIGH';
    } else if (daysRemaining <= item.replenishmentLeadDays) {
      item.leadTimeRisk = 'HIGH';
    } else if (daysRemaining <= item.replenishmentLeadDays * 1.5) {
      item.leadTimeRisk = 'MEDIUM';
    } else {
      item.leadTimeRisk = 'SAFE';
    }
  },

  // Update Bed Status
  updateBedStatus(bedId: string, newStatus: Bed['status'], user: User, maintenanceNote?: string) {
    const bed = state.beds.find((b) => b.id === bedId);
    if (!bed) throw new Error('Bed not found');

    const prevStatus = bed.status;
    bed.status = newStatus;
    bed.lastUpdated = new Date().toISOString().replace('T', ' ').substring(0, 16);
    bed.updatedBy = user.name;
    if (maintenanceNote !== undefined) {
      bed.maintenanceNote = maintenanceNote;
    }

    this.addAuditLog({
      actor: user,
      action: 'BED_STATUS_UPDATE',
      facilityId: bed.facilityId,
      entityType: 'BED',
      entityId: bed.id,
      previousValue: `Status: ${prevStatus}`,
      newValue: `Status: ${newStatus}${maintenanceNote ? ` (${maintenanceNote})` : ''}`,
    });

    this.evaluateFacilityAdequacy(bed.facilityId);
    notify();
  },

  // Staff Attendance Check-in & Verification
  recordStaffAttendance(staffId: string, status: StaffRoster['attendanceStatus'], method: StaffRoster['verificationMethod'], user: User) {
    const staff = state.roster.find((s) => s.id === staffId);
    if (!staff) throw new Error('Staff member not found');

    const prev = staff.attendanceStatus;
    staff.attendanceStatus = status;
    staff.verificationMethod = method;
    if (status === 'PRESENT') {
      const now = new Date();
      staff.checkInTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      staff.isGracePeriodExceeded = false;
    }

    this.addAuditLog({
      actor: user,
      action: 'ATTENDANCE_RECORDED',
      facilityId: staff.facilityId,
      entityType: 'ATTENDANCE',
      entityId: staff.id,
      previousValue: `Status: ${prev}`,
      newValue: `Status: ${status} via ${method} at ${staff.checkInTime || 'N/A'}`,
    });

    this.evaluateFacilityAdequacy(staff.facilityId);
    notify();
  },

  // Diagnostic Test Status Update
  updateDiagnosticStatus(params: {
    testId: string;
    status: DiagnosticTest['status'];
    equipmentFunctional: boolean;
    reagentStockStatus: DiagnosticTest['reagentStockStatus'];
    unavailabilityReason?: string;
    user: User;
  }) {
    const test = state.diagnostics.find((d) => d.id === params.testId);
    if (!test) throw new Error('Diagnostic test not found');

    const prevStatus = test.status;
    test.status = params.status;
    test.equipmentFunctional = params.equipmentFunctional;
    test.reagentStockStatus = params.reagentStockStatus;
    test.unavailabilityReason = params.unavailabilityReason;
    test.lastVerified = new Date().toISOString().replace('T', ' ').substring(0, 16);

    this.addAuditLog({
      actor: params.user,
      action: 'DIAGNOSTIC_STATUS_UPDATE',
      facilityId: test.facilityId,
      entityType: 'DIAGNOSTIC',
      entityId: test.id,
      previousValue: `Status: ${prevStatus}`,
      newValue: `Status: ${params.status} | Reagents: ${params.reagentStockStatus} | Equip: ${params.equipmentFunctional ? 'OK' : 'DOWN'}`,
    });

    if (params.status === 'UNAVAILABLE') {
      this.triggerAlert({
        facilityId: test.facilityId,
        facilityName: test.facilityName,
        category: 'DIAGNOSTIC_OUTAGE',
        severity: 'WARNING',
        title: `Lab Test Outage: ${test.testName}`,
        description: `Service marked UNAVAILABLE. Reason: ${params.unavailabilityReason || 'Equipment/Reagent shortage'}`,
        evidence: `Equipment: ${params.equipmentFunctional ? 'OK' : 'BROKEN'} | Reagents: ${params.reagentStockStatus}`,
      });
    }

    this.evaluateFacilityAdequacy(test.facilityId);
    notify();
  },

  // Redistribution lifecycle
  approveRedistribution(recId: string, user: User) {
    const rec = state.redistributions.find((r) => r.id === recId);
    if (!rec) throw new Error('Recommendation not found');

    rec.status = 'APPROVED';
    rec.approvalActor = `${user.name} (${user.role})`;

    this.addAuditLog({
      actor: user,
      action: 'APPROVE_REDISTRIBUTION',
      facilityId: rec.targetFacilityId,
      entityType: 'REDISTRIBUTION',
      entityId: rec.id,
      previousValue: 'PENDING_APPROVAL',
      newValue: `APPROVED for transfer of ${rec.suggestedQuantity} ${rec.unit} ${rec.medicineName}`,
    });

    notify();
  },

  rejectRedistribution(recId: string, reason: string, user: User) {
    const rec = state.redistributions.find((r) => r.id === recId);
    if (!rec) throw new Error('Recommendation not found');

    rec.status = 'REJECTED';
    rec.rejectionReason = reason;

    this.addAuditLog({
      actor: user,
      action: 'REJECT_REDISTRIBUTION',
      facilityId: rec.targetFacilityId,
      entityType: 'REDISTRIBUTION',
      entityId: rec.id,
      previousValue: 'PENDING_APPROVAL',
      newValue: `REJECTED: ${reason}`,
    });

    notify();
  },

  dispatchRedistribution(recId: string, user: User) {
    const rec = state.redistributions.find((r) => r.id === recId);
    if (!rec) throw new Error('Recommendation not found');
    if (rec.status !== 'APPROVED') throw new Error('Transfer must be approved before dispatch');

    // Deduct physical stock from donor facility
    const donorItem = state.inventory.find(
      (i) => i.facilityId === rec.sourceFacilityId && i.medicineName === rec.medicineName
    );
    if (donorItem) {
      if (donorItem.usableStock < rec.suggestedQuantity) {
        throw new Error('Donor usable stock is lower than transfer quantity.');
      }
      donorItem.usableStock -= rec.suggestedQuantity;
      const batch = donorItem.batches.find((b) => b.batchNumber === rec.batchNumber);
      if (batch) {
        batch.quantity = Math.max(0, batch.quantity - rec.suggestedQuantity);
      }
      this.recalculateInventoryMetrics(donorItem);

      // Record dispatch transaction
      state.transactions.unshift({
        id: 'TXN-' + Date.now(),
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        facilityId: rec.sourceFacilityId,
        itemId: donorItem.id,
        medicineName: rec.medicineName,
        batchNumber: rec.batchNumber,
        type: 'TRANSFER_OUT',
        quantity: -rec.suggestedQuantity,
        balanceAfter: donorItem.usableStock,
        reason: `Dispatched to ${rec.targetFacilityName} via approved redistribution #${rec.id}`,
        authorizedBy: user.name,
        userRole: user.role,
        referenceId: rec.id,
      });
    }

    rec.status = 'DISPATCHED';
    rec.dispatchedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);

    this.addAuditLog({
      actor: user,
      action: 'DISPATCH_TRANSFER',
      facilityId: rec.sourceFacilityId,
      entityType: 'REDISTRIBUTION',
      entityId: rec.id,
      previousValue: 'APPROVED',
      newValue: `DISPATCHED: ${rec.suggestedQuantity} ${rec.unit} in transit to ${rec.targetFacilityName}`,
    });

    this.evaluateFacilityAdequacy(rec.sourceFacilityId);
    notify();
  },

  receiveRedistribution(recId: string, user: User) {
    const rec = state.redistributions.find((r) => r.id === recId);
    if (!rec) throw new Error('Recommendation not found');
    if (rec.status !== 'DISPATCHED') throw new Error('Transfer must be in dispatched status to confirm receipt');

    // Credit physical stock to recipient facility
    const recipientItem = state.inventory.find(
      (i) => i.facilityId === rec.targetFacilityId && i.medicineName === rec.medicineName
    );
    if (recipientItem) {
      recipientItem.usableStock += rec.suggestedQuantity;
      let batch = recipientItem.batches.find((b) => b.batchNumber === rec.batchNumber);
      if (batch) {
        batch.quantity += rec.suggestedQuantity;
      } else {
        recipientItem.batches.push({
          id: 'B-' + Date.now(),
          itemId: recipientItem.id,
          batchNumber: rec.batchNumber,
          expiryDate: rec.expiryDate,
          quantity: rec.suggestedQuantity,
          supplier: `Transfer from ${rec.sourceFacilityName}`,
          receivedDate: new Date().toISOString().split('T')[0],
          status: 'ACTIVE',
        });
      }
      this.recalculateInventoryMetrics(recipientItem);

      // Record receipt transaction
      state.transactions.unshift({
        id: 'TXN-' + Date.now(),
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        facilityId: rec.targetFacilityId,
        itemId: recipientItem.id,
        medicineName: rec.medicineName,
        batchNumber: rec.batchNumber,
        type: 'TRANSFER_IN',
        quantity: rec.suggestedQuantity,
        balanceAfter: recipientItem.usableStock,
        reason: `Received transfer from ${rec.sourceFacilityName} via redistribution #${rec.id}`,
        authorizedBy: user.name,
        userRole: user.role,
        referenceId: rec.id,
      });
    }

    rec.status = 'RECEIVED';
    rec.receivedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);

    this.addAuditLog({
      actor: user,
      action: 'CONFIRM_TRANSFER_RECEIPT',
      facilityId: rec.targetFacilityId,
      entityType: 'REDISTRIBUTION',
      entityId: rec.id,
      previousValue: 'DISPATCHED',
      newValue: `RECEIVED & VERIFIED: ${rec.suggestedQuantity} ${rec.unit} safely replenished`,
    });

    this.evaluateFacilityAdequacy(rec.targetFacilityId);
    notify();
  },

  // Alerts acknowledge & resolve
  acknowledgeAlert(alertId: string, user: User) {
    const alert = state.alerts.find((a) => a.id === alertId);
    if (!alert) return;
    alert.status = 'ACKNOWLEDGED';
    alert.acknowledgedBy = user.name;
    alert.acknowledgedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);

    this.addAuditLog({
      actor: user,
      action: 'ACKNOWLEDGE_ALERT',
      facilityId: alert.facilityId,
      entityType: 'ALERT',
      entityId: alert.id,
      previousValue: 'OPEN',
      newValue: `ACKNOWLEDGED by ${user.name}`,
    });

    notify();
  },

  resolveAlert(alertId: string, notes: string, user: User) {
    const alert = state.alerts.find((a) => a.id === alertId);
    if (!alert) return;
    alert.status = 'RESOLVED';
    alert.resolutionNotes = notes;
    alert.resolvedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);

    this.addAuditLog({
      actor: user,
      action: 'RESOLVE_ALERT',
      facilityId: alert.facilityId,
      entityType: 'ALERT',
      entityId: alert.id,
      previousValue: alert.status,
      newValue: `RESOLVED: ${notes}`,
    });

    notify();
  },

  triggerAlert(alertData: Omit<Alert, 'id' | 'createdAt' | 'status'>) {
    // Deduplication check: Do not re-create identical open alert for same facility and category within 4 hours
    const existing = state.alerts.find(
      (a) =>
        a.facilityId === alertData.facilityId &&
        a.category === alertData.category &&
        a.status !== 'RESOLVED' &&
        a.title === alertData.title
    );
    if (existing) return;

    const newAlert: Alert = {
      ...alertData,
      id: 'ALT-' + Date.now(),
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'OPEN',
    };
    state.alerts.unshift(newAlert);
    notify();
  },

  // Record Patient Footfall
  recordPatientFootfall(entry: Omit<PatientFootfall, 'id'>, user: User) {
    const newEntry: PatientFootfall = {
      ...entry,
      id: 'FF-' + Date.now(),
    };
    state.footfall.unshift(newEntry);

    // Update facility lastSyncTime and reportingStatus
    const facility = state.facilities.find((f) => f.id === entry.facilityId);
    if (facility) {
      facility.reportingStatus = 'REPORTED_TODAY';
      facility.lastSyncTime = new Date().toISOString().replace('T', ' ').substring(0, 16);
    }

    if (entry.isSpikeAlert) {
      this.triggerAlert({
        facilityId: entry.facilityId,
        facilityName: entry.facilityName,
        category: 'PATIENT_SURGE',
        severity: 'WARNING',
        title: `Surge in Patient Footfall (+${entry.demandSpikePercent.toFixed(1)}%)`,
        description: `Unusual footfall surge recorded (${entry.opdVisits} OPD visits). Check clinical staffing and bed availability.`,
        evidence: `OPD: ${entry.opdVisits} | IPD: ${entry.ipdAdmissions} | Baseline Delta: +${entry.demandSpikePercent}%`,
      });
    }

    this.addAuditLog({
      actor: user,
      action: 'RECORD_FOOTFALL',
      facilityId: entry.facilityId,
      entityType: 'USER_CONFIG',
      entityId: newEntry.id,
      newValue: `OPD: ${entry.opdVisits}, IPD: ${entry.ipdAdmissions}, Emergency: ${entry.emergencyVisits}`,
    });

    this.evaluateFacilityAdequacy(entry.facilityId);
    notify();
  },

  // Interventions case management
  updateInterventionCase(
    caseId: string,
    params: {
      status?: FacilityInterventionCase['status'];
      actionNote?: string;
      resolutionEvidence?: string;
      user: User;
    }
  ) {
    const c = state.interventions.find((i) => i.id === caseId);
    if (!c) throw new Error('Intervention case not found');

    if (params.status) {
      const prev = c.status;
      c.status = params.status;
      if (params.status === 'RESOLVED' && params.resolutionEvidence) {
        c.resolutionEvidence = params.resolutionEvidence;
      }

      this.addAuditLog({
        actor: params.user,
        action: 'UPDATE_INTERVENTION_STATUS',
        facilityId: c.facilityId,
        entityType: 'INTERVENTION',
        entityId: c.id,
        previousValue: `Status: ${prev}`,
        newValue: `Status: ${params.status}`,
      });
    }

    if (params.actionNote) {
      c.actionHistory.push({
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        actor: `${params.user.name} (${params.user.role})`,
        action: params.status ? `Status changed to ${params.status}` : 'Action Note Added',
        notes: params.actionNote,
      });
    }

    notify();
  },

  // Evaluate Facility Resource Adequacy Score (0-100)
  evaluateFacilityAdequacy(facilityId: string) {
    const facility = state.facilities.find((f) => f.id === facilityId);
    if (!facility) return;

    // 1. Medicine stock availability (weight: 30%)
    const facilityInventory = state.inventory.filter((i) => i.facilityId === facilityId);
    let medScore = 100;
    if (facilityInventory.length > 0) {
      const healthyItems = facilityInventory.filter((i) => i.daysOfStockRemaining >= i.replenishmentLeadDays).length;
      medScore = Math.round((healthyItems / facilityInventory.length) * 100);
    }

    // 2. Bed functional availability (weight: 20%)
    const facilityBeds = state.beds.filter((b) => b.facilityId === facilityId);
    let bedScore = 100;
    const functionalBeds = facilityBeds.filter((b) => b.status !== 'OUT_OF_SERVICE');
    if (functionalBeds.length > 0) {
      const availableBeds = functionalBeds.filter((b) => b.status === 'AVAILABLE').length;
      // High bed occupancy is good for utilization, but <10% buffer is a risk
      const availRatio = availableBeds / functionalBeds.length;
      bedScore = availRatio >= 0.1 ? 90 : 45;
    }

    // 3. Staffing coverage (weight: 25%)
    const facilityRoster = state.roster.filter((s) => s.facilityId === facilityId);
    let staffScore = 100;
    if (facilityRoster.length > 0) {
      const activeStaff = facilityRoster.filter(
        (s) => s.attendanceStatus === 'PRESENT' || s.attendanceStatus === 'APPROVED_LEAVE'
      ).length;
      staffScore = Math.round((activeStaff / facilityRoster.length) * 100);
    }

    // 4. Diagnostic readiness (weight: 15%)
    const facilityDiags = state.diagnostics.filter((d) => d.facilityId === facilityId);
    let diagScore = 100;
    if (facilityDiags.length > 0) {
      const availDiags = facilityDiags.filter((d) => d.status === 'AVAILABLE').length;
      diagScore = Math.round((availDiags / facilityDiags.length) * 100);
    }

    // 5. Reporting timeliness (weight: 10%)
    const reportingScore = facility.reportingStatus === 'REPORTED_TODAY' ? 100 : facility.reportingStatus === 'DELAYED' ? 40 : 10;

    // Weighted aggregate score
    const totalScore = Math.round(
      medScore * 0.3 + bedScore * 0.2 + staffScore * 0.25 + diagScore * 0.15 + reportingScore * 0.1
    );

    facility.adequacyScore = totalScore;
    if (totalScore < 55) {
      facility.operationalStatus = 'CRITICAL';
      facility.interventionRequired = true;

      // Ensure open intervention case exists
      const existingCase = state.interventions.find(
        (c) => c.facilityId === facilityId && (c.status === 'OPEN' || c.status === 'IN_PROGRESS')
      );
      if (!existingCase) {
        state.interventions.unshift({
          id: 'INT-' + Date.now(),
          caseNumber: `LKO-INT-${Math.floor(100 + Math.random() * 900)}`,
          facilityId: facility.id,
          facilityName: facility.name,
          district: facility.district,
          triggerCondition: `Resource adequacy score dropped to ${totalScore}/100. Medicines: ${medScore}%, Staffing: ${staffScore}%, Diagnostics: ${diagScore}%.`,
          severity: 'CRITICAL',
          adequacyScore: totalScore,
          breakdownIndicators: {
            medicineAvailability: medScore,
            bedCapacity: bedScore,
            staffingCoverage: staffScore,
            diagnosticReadiness: diagScore,
            reportingCompliance: reportingScore,
          },
          recommendedActions: [
            'District Admin immediate review of stock depletion & staffing gaps',
            'Dispatch emergency replenishment or inter-facility transfer',
            'Audit attendance records and assign backup medical officer',
          ],
          assignedOfficer: 'Dr. Rajesh Sharma (CMO)',
          assignedRole: 'DISTRICT_ADMIN',
          deadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 16),
          status: 'OPEN',
          actionHistory: [
            {
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              actor: 'Automated Adequacy Engine',
              action: 'Case Auto-Created',
              notes: `Threshold breach detected (Score: ${totalScore}/100)`,
            },
          ],
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        });
      }
    } else if (totalScore < 75) {
      facility.operationalStatus = 'WARNING';
      facility.interventionRequired = false;
    } else {
      facility.operationalStatus = 'OPTIMAL';
      facility.interventionRequired = false;
    }
  },

  // Audit Log helper
  addAuditLog(params: {
    actor: User;
    action: string;
    facilityId?: string;
    entityType: AuditLog['entityType'];
    entityId: string;
    previousValue?: string;
    newValue?: string;
  }) {
    const log: AuditLog = {
      id: 'AUD-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actorId: params.actor.id,
      actorName: params.actor.name,
      actorRole: params.actor.role,
      action: params.action,
      facilityId: params.facilityId,
      facilityName: state.facilities.find((f) => f.id === params.facilityId)?.name,
      entityType: params.entityType,
      entityId: params.entityId,
      previousValue: params.previousValue,
      newValue: params.newValue,
    };
    state.auditLogs.unshift(log);
  },

  // Calculate high-level District KPIs
  getCalculatedMetrics(): OperationalMetrics {
    const totalFacilities = state.facilities.length;
    const reportingToday = state.facilities.filter((f) => f.reportingStatus === 'REPORTED_TODAY').length;
    const staleReporting = totalFacilities - reportingToday;

    const criticalMedicineShortages = state.inventory.filter((i) => i.daysOfStockRemaining <= i.replenishmentLeadDays).length;

    const functionalBedsList = state.beds.filter((b) => b.status !== 'OUT_OF_SERVICE');
    const totalFunctionalBeds = functionalBedsList.length;
    const occupiedBeds = functionalBedsList.filter((b) => b.status === 'OCCUPIED').length;
    const availableBeds = functionalBedsList.filter((b) => b.status === 'AVAILABLE').length;
    const bedOccupancyRate = totalFunctionalBeds > 0 ? Math.round((occupiedBeds / totalFunctionalBeds) * 100) : 0;

    const totalFootfallToday = state.footfall.reduce((acc, f) => acc + f.opdVisits + f.ipdAdmissions + f.emergencyVisits, 0);

    const totalRostered = state.roster.length;
    const presentCount = state.roster.filter((r) => r.attendanceStatus === 'PRESENT').length;
    const doctorAttendanceRate = totalRostered > 0 ? Math.round((presentCount / totalRostered) * 100) : 0;

    const totalDiagnosticsCount = state.diagnostics.length;
    const availableDiagnosticsCount = state.diagnostics.filter((d) => d.status === 'AVAILABLE').length;

    const openCriticalAlerts = state.alerts.filter((a) => a.severity === 'CRITICAL' && a.status === 'OPEN').length;
    const pendingRedistributions = state.redistributions.filter((r) => r.status === 'PENDING_APPROVAL').length;
    const underResourcedFacilitiesCount = state.facilities.filter((f) => f.interventionRequired || f.adequacyScore < 60).length;

    return {
      totalFacilities,
      reportingToday,
      staleReporting,
      criticalMedicineShortages,
      totalFunctionalBeds,
      occupiedBeds,
      availableBeds,
      bedOccupancyRate,
      totalFootfallToday,
      doctorAttendanceRate,
      availableDiagnosticsCount,
      totalDiagnosticsCount,
      openCriticalAlerts,
      pendingRedistributions,
      underResourcedFacilitiesCount,
    };
  },
};
