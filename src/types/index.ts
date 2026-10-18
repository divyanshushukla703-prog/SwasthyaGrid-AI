export type UserRole =
  | 'STATE_ADMIN'
  | 'DISTRICT_ADMIN'
  | 'FACILITY_MO'
  | 'PHARMACIST'
  | 'HEALTHCARE_WORKER'
  | 'DATA_ENTRY'
  | 'AUDITOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  facilityId?: string;
  districtId: string;
  stateId: string;
  avatar?: string;
  phone?: string;
}

export type FacilityType = 'PHC' | 'CHC' | 'DH' | 'SUB_CENTRE';

export type OperationalStatus = 'OPTIMAL' | 'WARNING' | 'CRITICAL' | 'STALE_DATA';

export interface Facility {
  id: string;
  code: string;
  name: string;
  type: FacilityType;
  district: string;
  block: string;
  address: string;
  lat: number;
  lng: number;
  administratorName: string;
  contactPhone: string;
  servicesOffered: string[];
  totalBeds: number;
  functionalBeds: number;
  reportingStatus: 'REPORTED_TODAY' | 'DELAYED' | 'STALE' | 'OFFLINE';
  lastSyncTime: string;
  operationalStatus: OperationalStatus;
  adequacyScore: number; // 0 - 100
  interventionRequired: boolean;
}

export interface InventoryItem {
  id: string;
  facilityId: string;
  medicineName: string;
  genericName: string;
  catalogId: string;
  category: 'ANTIBIOTIC' | 'ANALGESIC' | 'MATERNAL' | 'VACCINE' | 'CARDIOVASCULAR' | 'DIABETIC' | 'CONSUMABLE' | 'EMERGENCY';
  dosageForm: string; // Tablets, Ampoules, Vial, Syrup, Packets
  unit: string; // Strip, Vial, Bottle, Ampoule, Unit
  usableStock: number;
  reservedStock: number;
  minThreshold: number;
  reorderLevel: number;
  maxStock: number;
  avgDailyConsumption: number; // calculated from transactions
  daysOfStockRemaining: number; // usableStock / avgDailyConsumption
  predictedStockoutDate: string | null;
  replenishmentLeadDays: number;
  leadTimeRisk: 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE';
  lastRestockDate: string;
  batches: InventoryBatch[];
}

export interface InventoryBatch {
  id: string;
  itemId: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  supplier: string;
  receivedDate: string;
  status: 'ACTIVE' | 'NEAR_EXPIRY' | 'EXPIRED' | 'QUARANTINED';
}

export type TransactionType = 'RECEIPT' | 'ISSUE' | 'ADJUSTMENT' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'RETURN' | 'DAMAGE';

export interface StockTransaction {
  id: string;
  timestamp: string;
  facilityId: string;
  itemId: string;
  medicineName: string;
  batchNumber: string;
  type: TransactionType;
  quantity: number; // positive or negative depending on context
  balanceAfter: number;
  reason?: string;
  authorizedBy: string;
  userRole: UserRole;
  referenceId?: string; // transfer request id or order id
}

export interface DemandForecast {
  id: string;
  facilityId: string;
  facilityName: string;
  itemId: string;
  medicineName: string;
  forecastHorizonDays: number; // e.g. 14, 30
  currentStock: number;
  projectedDailyDemand: number;
  expectedStockoutDate: string | null;
  daysRemaining: number;
  replenishmentLeadDays: number;
  riskSeverity: 'CRITICAL' | 'WARNING' | 'NORMAL';
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  dataCompletenessScore: number; // 0 - 100%
  modelUsed: 'EXPONENTIAL_SMOOTHING' | 'WEIGHTED_MOVING_AVG' | 'SEASONAL_HEURISTIC';
  influencingFactors: string[];
  recommendedAction: string;
  lastCalculated: string;
}

export interface RedistributionRecommendation {
  id: string;
  medicineId: string;
  medicineName: string;
  unit: string;
  sourceFacilityId: string;
  sourceFacilityName: string;
  sourceCurrentStock: number;
  sourceSafetyReserve: number;
  sourceStockAfterTransfer: number;
  targetFacilityId: string;
  targetFacilityName: string;
  targetCurrentStock: number;
  targetDailyConsumption: number;
  targetStockoutDays: number;
  targetStockAfterReceipt: number;
  suggestedQuantity: number;
  distanceKm: number;
  estimatedTransitHours: number;
  urgency: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'DISPATCHED' | 'RECEIVED' | 'REJECTED' | 'CANCELLED';
  rejectionReason?: string;
  explanation: string;
  batchNumber: string;
  expiryDate: string;
  approvalActor?: string;
  dispatchedAt?: string;
  receivedAt?: string;
  createdAt: string;
}

export interface PatientFootfall {
  id: string;
  facilityId: string;
  facilityName: string;
  date: string;
  opdVisits: number;
  ipdAdmissions: number;
  emergencyVisits: number;
  referralsIn: number;
  referralsOut: number;
  discharges: number;
  departmentCounts: {
    generalMedicine: number;
    maternalChild: number;
    immunization: number;
    geriatric: number;
  };
  demandSpikePercent: number; // vs 14-day baseline
  isSpikeAlert: boolean;
  notes?: string;
}

export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING' | 'OUT_OF_SERVICE';

export interface Bed {
  id: string;
  bedCode: string;
  facilityId: string;
  facilityName: string;
  ward: 'MALE_GENERAL' | 'FEMALE_GENERAL' | 'MATERNITY' | 'PEDIATRIC' | 'EMERGENCY' | 'ISOLATION';
  category: 'REGULAR' | 'OXYGEN_SUPPORT' | 'ICU_STEPDOWN';
  status: BedStatus;
  lastUpdated: string;
  updatedBy: string;
  maintenanceNote?: string;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'APPROVED_LEAVE' | 'SHIFT_NOT_STARTED' | 'PENDING_VERIFICATION';

export interface StaffRoster {
  id: string;
  staffId: string;
  name: string;
  roleTitle: 'MEDICAL_OFFICER' | 'STAFF_NURSE' | 'PHARMACIST' | 'LAB_TECHNICIAN' | 'ANM' | 'DATA_OPERATOR';
  facilityId: string;
  facilityName: string;
  shift: 'MORNING' | 'EVENING' | 'NIGHT';
  shiftStart: string; // e.g. "08:00"
  shiftEnd: string; // e.g. "16:00"
  attendanceStatus: AttendanceStatus;
  checkInTime: string | null;
  checkOutTime: string | null;
  isGracePeriodExceeded: boolean;
  verificationMethod: 'MANUAL_VERIFIED' | 'BIOMETRIC_DEVICE' | 'QR_CODE';
  date: string;
}

export type DiagnosticStatus = 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE' | 'UNREPORTED';

export interface DiagnosticTest {
  id: string;
  facilityId: string;
  facilityName: string;
  testName: string;
  category: 'HEMATOLOGY' | 'BIOCHEMISTRY' | 'INFECTIOUS' | 'MATERNAL' | 'RADIOLOGY_ECG';
  status: DiagnosticStatus;
  equipmentFunctional: boolean;
  reagentStockStatus: 'SUFFICIENT' | 'LOW' | 'DEPLETED';
  technicianAvailable: boolean;
  avgTurnaroundHours: number;
  unavailabilityReason?: string;
  expectedRestorationDate?: string;
  lastVerified: string;
}

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';
export type AlertCategory =
  | 'MEDICINE_SHORTAGE'
  | 'STOCKOUT_RISK'
  | 'BED_OCCUPANCY_HIGH'
  | 'STAFF_DEFICIT'
  | 'DIAGNOSTIC_OUTAGE'
  | 'PATIENT_SURGE'
  | 'STALE_REPORTING';

export interface Alert {
  id: string;
  facilityId: string;
  facilityName: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  description: string;
  evidence: string;
  createdAt: string;
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
  assignedTo?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
}

export interface FacilityInterventionCase {
  id: string;
  caseNumber: string;
  facilityId: string;
  facilityName: string;
  district: string;
  triggerCondition: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  adequacyScore: number;
  breakdownIndicators: {
    medicineAvailability: number; // 0-100
    bedCapacity: number; // 0-100
    staffingCoverage: number; // 0-100
    diagnosticReadiness: number; // 0-100
    reportingCompliance: number; // 0-100
  };
  recommendedActions: string[];
  assignedOfficer: string;
  assignedRole: string;
  deadline: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED';
  actionHistory: {
    timestamp: string;
    actor: string;
    action: string;
    notes: string;
  }[];
  resolutionEvidence?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  facilityId?: string;
  facilityName?: string;
  entityType: 'INVENTORY' | 'BED' | 'ATTENDANCE' | 'DIAGNOSTIC' | 'REDISTRIBUTION' | 'INTERVENTION' | 'ALERT' | 'USER_CONFIG';
  entityId: string;
  previousValue?: string;
  newValue?: string;
  ipAddress?: string;
}

export interface OperationalMetrics {
  totalFacilities: number;
  reportingToday: number;
  staleReporting: number;
  criticalMedicineShortages: number;
  totalFunctionalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  bedOccupancyRate: number;
  totalFootfallToday: number;
  doctorAttendanceRate: number;
  availableDiagnosticsCount: number;
  totalDiagnosticsCount: number;
  openCriticalAlerts: number;
  pendingRedistributions: number;
  underResourcedFacilitiesCount: number;
}
