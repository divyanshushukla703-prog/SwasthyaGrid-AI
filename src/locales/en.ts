export const en = {
  appName: 'SwasthyaGrid AI',
  tagline: 'Smarter Resources. Stronger Healthcare. Healthier Communities.',
  demoNotice: 'DEMO ENVIRONMENT — Operational simulation for District Health Administrations in India',

  // Roles
  roles: {
    STATE_ADMIN: 'State Administrator',
    DISTRICT_ADMIN: 'District Health Administrator',
    FACILITY_MO: 'Facility Medical Officer',
    PHARMACIST: 'Pharmacist / Inventory Manager',
    HEALTHCARE_WORKER: 'Doctor / Healthcare Worker',
    DATA_ENTRY: 'Data Entry Operator',
    AUDITOR: 'Auditor / Read-Only Officer',
  },

  // Navigation
  nav: {
    overview: 'Overview Dashboard',
    districtMap: 'District Map',
    facilities: 'Facilities Directory',
    inventory: 'Medicine Inventory',
    forecasting: 'AI Demand Forecasts',
    footfall: 'Patient Footfall',
    beds: 'Bed Availability',
    attendance: 'Staff Attendance',
    diagnostics: 'Diagnostics & Labs',
    redistribution: 'Resource Transfers',
    interventions: 'Interventions & Cases',
    alerts: 'Alerts & Notifications',
    reports: 'Reports & Exports',
    dataImport: 'Bulk Data Import',
    auditLogs: 'Audit Logs',
  },

  // Common actions
  actions: {
    refresh: 'Refresh',
    exportCsv: 'Export CSV',
    printReport: 'Print / Save PDF',
    filter: 'Filter',
    search: 'Search...',
    allDistricts: 'All Districts',
    allBlocks: 'All Blocks',
    allFacilities: 'All Facilities',
    allStatuses: 'All Statuses',
    close: 'Close',
    cancel: 'Cancel',
    save: 'Save Changes',
    confirm: 'Confirm Action',
    approve: 'Approve Transfer',
    reject: 'Reject',
    dispatch: 'Dispatch Stock',
    receive: 'Confirm Receipt',
    acknowledge: 'Acknowledge',
    resolve: 'Resolve Issue',
    submit: 'Submit Record',
    simulateAiInsights: 'Generate AI Narrative Insights',
    switchRole: 'Switch Role',
    offline: 'Offline Mode (Local Cache Active)',
    online: 'Online (Connected to District Grid)',
    syncNow: 'Sync Queued Records',
  },

  // Metrics
  metrics: {
    totalFacilities: 'Registered Facilities',
    reportingToday: 'Reported Today',
    staleReporting: 'Stale / Missing Reports',
    criticalShortages: 'Critical Medicine Deficits',
    bedOccupancy: 'Functional Bed Occupancy',
    footfallToday: "Today's Patient Footfall",
    doctorAttendance: 'Doctor Attendance Rate',
    diagnosticsAvailable: 'Diagnostic Availability',
    criticalAlerts: 'Active Critical Alerts',
    pendingTransfers: 'Pending Resource Transfers',
    underResourced: 'Under-Resourced Facilities',
    daysStockRemaining: 'Days Stock Remaining',
    leadTimeRisk: 'Replenishment Lead Risk',
  },

  // Statuses
  statuses: {
    optimal: 'Optimal Operations',
    warning: 'Monitoring Needed',
    critical: 'Critical Shortage',
    staleData: 'Stale / Delayed Data',
    available: 'Available',
    occupied: 'Occupied',
    reserved: 'Reserved',
    cleaning: 'Cleaning / Turnaround',
    outOfService: 'Out of Service',
    present: 'Present & Verified',
    absent: 'Unexplained Absence',
    approvedLeave: 'Approved Leave',
    gracePeriod: 'Grace Period Active',
  },

  // Dashboard Sections
  dashboard: {
    title: 'District Healthcare Command Center',
    subtitle: 'Real-time resource adequacy, predictive shortages, and verified service availability',
    footfallTrend: 'Patient Footfall & Service Demand Trends (OPD / IPD / Emergency)',
    inventoryDepletion: 'Critical Medicine Depletion Timeline vs Supplier Lead Time',
    facilityAdequacyMap: 'Facility Operational Risk Distribution',
    urgentInterventions: 'Immediate Interventions Required',
    recentAlerts: 'Live High-Priority Alerts',
    redistributionOpportunities: 'AI-Recommended Stock Transfers',
  },

  // Inventory
  inventory: {
    title: 'Essential Medicine Inventory & Transaction Ledger',
    subtitle: 'Immutable stock balance calculations, batch FEFO tracking, and stockout warnings',
    addReceipt: 'Record Medicine Receipt',
    issueStock: 'Record Stock Issue / Dispense',
    adjustStock: 'Stock Adjustment (Audited)',
    searchPlaceholder: 'Search medicine name, generic salt, batch number...',
    batchNumber: 'Batch No.',
    expiryDate: 'Expiry Date',
    usableStock: 'Usable Stock',
    avgDailyConsumption: 'Avg Daily Consumption',
    leadDays: 'Lead Days',
    predictedStockout: 'Projected Stockout',
    riskLevel: 'Risk Level',
    transactionsLedger: 'Immutable Transaction Ledger',
  },

  // Forecast
  forecast: {
    title: 'AI-Driven Demand & Stockout Forecasting Engine',
    subtitle: 'Grounded statistical time-series forecasting with supply-chain lead-time safety analysis',
    narrativeExplanation: 'Plain-Language Operational Analysis',
    projectedDemand: 'Projected Daily Demand',
    confidenceScore: 'Confidence Interval',
    dataCompleteness: 'Data Completeness Score',
    influencingFactors: 'Key Influencing Factors',
    recommendedAction: 'Recommended Operational Action',
    runModel: 'Recalculate District Demand Forecasts',
  },

  // Redistribution
  redistribution: {
    title: 'District Resource Redistribution Engine',
    subtitle: 'Algorithmic transfer matching: surplus-to-deficit rebalancing without donor compromise',
    donorFacility: 'Donor Facility (Verified Surplus)',
    recipientFacility: 'Recipient Facility (Critical Shortage)',
    suggestedQuantity: 'Safe Transfer Quantity',
    donorSafetyReserve: 'Donor Safety Reserve Protected',
    distanceTransit: 'Distance & Est. Transit',
    actionRequired: 'Administrator Action Required',
    statusFlow: 'Lifecycle: Draft → Pending Approval → Approved → Dispatched → Received & Verified',
  },

  // Interventions
  interventions: {
    title: 'Under-Resourced Facility Interventions',
    subtitle: 'Automated case management for facilities failing resource adequacy thresholds',
    adequacyScore: 'Resource Adequacy Score',
    indicators: 'Multi-Factor Evaluation (Medicine, Beds, Staff, Diagnostics, Reporting)',
    caseNumber: 'Case ID',
    assignedOfficer: 'Assigned Officer',
    deadline: 'SLA Deadline',
    actionPlan: 'Corrective Action Plan',
    escalate: 'Escalate to Chief Medical Officer (CMO)',
  },

  // Alerts
  alerts: {
    title: 'Alert & Notification Center',
    subtitle: 'Deduplicated operational alerts with automated priority routing and resolution tracking',
    filterAll: 'All Categories',
    acknowledgeAlert: 'Acknowledge Alert',
    resolveAlert: 'Mark as Resolved',
    resolutionNotesPlaceholder: 'Enter verification steps and resolution details...',
  },

  // Beds
  beds: {
    title: 'Bed Availability & Inpatient Management',
    subtitle: 'Bed-level operational state tracking across General, Maternity, Pediatric, and Emergency wards',
    functionalBedsNote: 'Denominators strictly calculate functional beds (excluding out-of-service beds)',
    updateBed: 'Update Bed Status',
    wardBreakdown: 'Ward Occupancy Breakdown',
  },

  // Staff
  staff: {
    title: 'Doctor Roster & Staff Duty Coverage',
    subtitle: 'Verified duty attendance, shift scheduling, and critical service staffing alerts',
    checkIn: 'Verify Check-in',
    recordLeave: 'Record Authorized Leave',
    shiftGracePeriodNote: 'Unexplained absences flagged strictly after shift start + 30-min grace period',
  },

  // Diagnostics
  diagnostics: {
    title: 'Diagnostic Service Catalogue & Lab Availability',
    subtitle: 'Essential laboratory test availability, equipment uptime, and reagent stock status',
    updateStatus: 'Update Test Availability',
    reagentStatus: 'Reagents & Consumables',
    equipmentStatus: 'Equipment Operability',
  },

  // Data Import
  import: {
    title: 'Bulk CSV / Spreadsheet Data Import',
    subtitle: 'Standardized operational data ingestion with row-level validation and duplicate safeguards',
    downloadTemplate: 'Download CSV Template',
    uploadPrompt: 'Select or drag & drop CSV file to import',
    previewRows: 'Import Data Validation Preview',
    validRows: 'Valid Rows',
    errorRows: 'Row-Level Errors Detected',
    commitImport: 'Commit Validated Records to Database',
  },

  // Audit Logs
  audit: {
    title: 'Immutable Audit Trail & Regulatory Logs',
    subtitle: 'Tamper-evident chronological log of all stock adjustments, bed updates, approvals, and duty changes',
    timestamp: 'Timestamp',
    actor: 'Authorized Actor',
    action: 'Operational Action',
    entity: 'Entity & Target ID',
    diff: 'Previous vs New Value',
  },
};
