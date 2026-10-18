import { en } from './en';

export const hi: typeof en = {
  appName: 'स्वास्थ्यग्रिड एआई (SwasthyaGrid AI)',
  tagline: 'बेहतर संसाधन। मजबूत स्वास्थ्य सेवा। स्वस्थ समुदाय।',
  demoNotice: 'डेमो वातावरण — भारत में जिला स्वास्थ्य प्रशासनों के लिए परिचालन सिमुलेशन',

  // Roles
  roles: {
    STATE_ADMIN: 'राज्य प्रशासक (State Admin)',
    DISTRICT_ADMIN: 'जिला स्वास्थ्य प्रशासक (CMO/Admin)',
    FACILITY_MO: 'प्रभारी चिकित्सा अधिकारी (MOIC)',
    PHARMACIST: 'फार्मासिस्ट / भंडार प्रबंधक',
    HEALTHCARE_WORKER: 'डॉक्टर / स्वास्थ्य कार्यकर्ता',
    DATA_ENTRY: 'डेटा एंट्री ऑपरेटर',
    AUDITOR: 'लेखा परीक्षक / निरीक्षण अधिकारी',
  },

  // Navigation
  nav: {
    overview: 'मुख्य डैशबोर्ड (Overview)',
    districtMap: 'जिला मानचित्र (District Map)',
    facilities: 'स्वास्थ्य केंद्र निर्देशिका (Facilities)',
    inventory: 'दवा भंडार व खाता (Medicine Inventory)',
    forecasting: 'एआई मांग पूर्वानुमान (Forecasts)',
    footfall: 'मरीज आगमन व प्रवाह (Footfall)',
    beds: 'बिस्तर उपलब्धता (Bed Management)',
    attendance: 'डॉक्टर व स्टाफ उपस्थिति (Attendance)',
    diagnostics: 'जांच व लैब सेवाएं (Diagnostics)',
    redistribution: 'संसाधन पुनर्वितरण (Transfers)',
    interventions: 'हस्तक्षेप व मामले (Interventions)',
    alerts: 'सचेतक व सूचनाएं (Alerts & Notifications)',
    reports: 'रिपोर्ट व निर्यात (Reports & Exports)',
    dataImport: 'थोक डेटा आयात (Bulk CSV Import)',
    auditLogs: 'ऑडिट लॉग्स (Audit Trail)',
  },

  // Common actions
  actions: {
    refresh: 'ताज़ा करें',
    exportCsv: 'सीएसवी निर्यात',
    printReport: 'प्रिंट / पीडीएफ सहेजें',
    filter: 'फ़िल्टर करें',
    search: 'खोजें...',
    allDistricts: 'सभी जिले',
    allBlocks: 'सभी ब्लॉक',
    allFacilities: 'सभी स्वास्थ्य केंद्र',
    allStatuses: 'सभी स्थितियां',
    close: 'बंद करें',
    cancel: 'रद्द करें',
    save: 'परिवर्तन सहेजें',
    confirm: 'पुष्टि करें',
    approve: 'हस्तांतरण स्वीकृत करें',
    reject: 'अस्वीकार करें',
    dispatch: 'स्टॉक प्रेषित करें',
    receive: 'प्राप्ति सत्यापित करें',
    acknowledge: 'स्वीकार करें (Acknowledge)',
    resolve: 'समाधान दर्ज करें',
    submit: 'रिकॉर्ड जमा करें',
    simulateAiInsights: 'एआई विवरण व अंतर्दृष्टि तैयार करें',
    switchRole: 'भूमिका बदलें',
    offline: 'ऑफ़लाइन मोड (स्थानीय कैश सक्रिय)',
    online: 'ऑनलाइन (जिला ग्रिड से जुड़ा)',
    syncNow: 'लंबित रिकॉर्ड सिंक करें',
  },

  // Metrics
  metrics: {
    totalFacilities: 'कुल पंजीकृत केंद्र',
    reportingToday: 'आज रिपोर्ट किए गए',
    staleReporting: 'विलंबित / अप्राप्त रिपोर्ट',
    criticalShortages: 'गंभीर दवा कमी',
    bedOccupancy: 'सक्रिय बिस्तर अधिभोग',
    footfallToday: 'आज के कुल मरीज',
    doctorAttendance: 'डॉक्टर उपस्थिति दर',
    diagnosticsAvailable: 'उपलब्ध लैब जांच',
    criticalAlerts: 'सक्रिय आपात चेतावनी',
    pendingTransfers: 'लंबित संसाधन स्थानांतरण',
    underResourced: 'संसाधन-वंचित केंद्र',
    daysStockRemaining: 'शेष स्टॉक (दिन)',
    leadTimeRisk: 'पुनर्प्राप्ति समय जोखिम',
  },

  // Statuses
  statuses: {
    optimal: 'सामान्य व सुचारू',
    warning: 'निगरानी आवश्यक',
    critical: 'गंभीर कमी',
    staleData: 'पुराना / अप्रमाणित डेटा',
    available: 'उपलब्ध',
    occupied: 'व्यस्त (Occupied)',
    reserved: 'आरक्षित',
    cleaning: 'सफाई / स्वच्छता में',
    outOfService: 'मरम्मत / निष्क्रिय',
    present: 'उपस्थित व प्रमाणित',
    absent: 'बिना सूचना अनुपस्थित',
    approvedLeave: 'स्वीकृत अवकाश',
    gracePeriod: 'समीक्षा अवधि सक्रिय',
  },

  // Dashboard Sections
  dashboard: {
    title: 'जिला स्वास्थ्य नियंत्रण केंद्र (Command Center)',
    subtitle: 'वास्तविक समय में संसाधन उपलब्धता, पूर्वानुमानित कमी, और प्रमाणित सेवाएं',
    footfallTrend: 'मरीज आगमन व सेवा मांग का रुझान (ओपीडी / आईपीडी / आपातकालीन)',
    inventoryDepletion: 'दवा स्टॉक समाप्त होने की समयसीमा बनाम आपूर्ति समय',
    facilityAdequacyMap: 'स्वास्थ्य केंद्रों का परिचालन जोखिम वितरण',
    urgentInterventions: 'त्वरित प्रशासनिक हस्तक्षेप की आवश्यकता',
    recentAlerts: 'सक्रिय उच्च-प्राथमिकता चेतावनियां',
    redistributionOpportunities: 'एआई-अनुशंसित दवा स्थानांतरण',
  },

  // Inventory
  inventory: {
    title: 'आवश्यक दवा भंडार व लेनदेन खाता (Ledger)',
    subtitle: 'अपरिवर्तनीय स्टॉक संतुलन, बैच FEFO ट्रैकिंग, और कमी की पूर्व चेतावनी',
    addReceipt: 'दवा प्राप्ति दर्ज करें',
    issueStock: 'दवा वितरण / निकासी दर्ज करें',
    adjustStock: 'स्टॉक समायोजन (ऑडिटेड)',
    searchPlaceholder: 'दवा का नाम, जेनेरिक नाम, बैच संख्या खोजें...',
    batchNumber: 'बैच संख्या',
    expiryDate: 'समाप्ति तिथि (Expiry)',
    usableStock: 'उपयोगी स्टॉक',
    avgDailyConsumption: 'औसत दैनिक खपत',
    leadDays: 'आपूर्ति समय (दिन)',
    predictedStockout: 'संभावित समाप्ति तिथि',
    riskLevel: 'जोखिम स्तर',
    transactionsLedger: 'अपरिवर्तनीय लेनदेन बहीखाता',
  },

  // Forecast
  forecast: {
    title: 'एआई-संचालित मांग व स्टॉकआउट पूर्वानुमान',
    subtitle: 'पारदर्शी सांख्यिकीय टाइम-सीरीज़ पूर्वानुमान और आपूर्ति-श्रृंखला सुरक्षा विश्लेषण',
    narrativeExplanation: 'सरल भाषा में परिचालन विश्लेषण',
    projectedDemand: 'अनुमानित दैनिक मांग',
    confidenceScore: 'पूर्वानुमान विश्वसनीयता अंतराल',
    dataCompleteness: 'डेटा पूर्णता स्कोर',
    influencingFactors: 'प्रमुख प्रभावशाली कारक',
    recommendedAction: 'अनुशंसित प्रशासनिक कार्रवाई',
    runModel: 'जिला मांग पूर्वानुमान पुनर्गणना करें',
  },

  // Redistribution
  redistribution: {
    title: 'जिला संसाधन पुनर्वितरण प्रणाली',
    subtitle: 'अधिशेष से कमी वाले केंद्रों में सुरक्षित स्थानांतरण (दाता सुरक्षा स्टॉक सुरक्षित रखते हुए)',
    donorFacility: 'दाता केंद्र (सत्यापित अधिशेष स्टॉक)',
    recipientFacility: 'प्राप्तकर्ता केंद्र (गंभीर कमी)',
    suggestedQuantity: 'सुरक्षित स्थानांतरण मात्रा',
    donorSafetyReserve: 'दाता का सुरक्षा बफर सुरक्षित',
    distanceTransit: 'दूरी व अनुमानित परिवहन समय',
    actionRequired: 'प्रशासक अनुमोदन अपेक्षित',
    statusFlow: 'प्रक्रिया: प्रारूप → अनुमोदन लंबित → स्वीकृत → प्रेषित → प्राप्त व सत्यापित',
  },

  // Interventions
  interventions: {
    title: 'संसाधन-वंचित स्वास्थ्य केंद्र हस्तक्षेप',
    subtitle: 'न्यूनतम मानक से कम स्कोर वाले केंद्रों के लिए स्वचालित मामला प्रबंधन',
    adequacyScore: 'संसाधन पर्याप्तता स्कोर',
    indicators: 'बहु-कारकीय मूल्यांकन (दवा, बिस्तर, स्टाफ, जांच, रिपोर्टिंग)',
    caseNumber: 'प्रकरण संख्या',
    assignedOfficer: 'नामित नोडल अधिकारी',
    deadline: 'निस्तारण समयसीमा (SLA)',
    actionPlan: 'सुधारात्मक कार्ययोजना',
    escalate: 'मुख्य चिकित्सा अधिकारी (CMO) को अग्रेषित करें',
  },

  // Alerts
  alerts: {
    title: 'चेतावनी व अधिसूचना केंद्र',
    subtitle: 'डुप्लिकेट-मुक्त परिचालन सचेतक, प्राथमिकता रूटिंग और समाधान ट्रैकिंग',
    filterAll: 'सभी श्रेणियां',
    acknowledgeAlert: 'चेतावनी संज्ञान लें',
    resolveAlert: 'समाधान पूर्ण चिह्नित करें',
    resolutionNotesPlaceholder: 'सत्यापन विवरण व सुधारात्मक उपाय दर्ज करें...',
  },

  // Beds
  beds: {
    title: 'बिस्तर उपलब्धता व अंतरंग (IPD) प्रबंधन',
    subtitle: 'सामान्य, प्रसूति, बाल चिकित्सा, व आपातकालीन वार्डों में बिस्तरवार स्थिति',
    functionalBedsNote: 'प्रतिशत गणना केवल सक्रिय कार्यात्मक बिस्तरों पर आधारित है (मरम्मत वाले बिस्तर छोड़कर)',
    updateBed: 'बिस्तर स्थिति बदलें',
    wardBreakdown: 'वार्ड-वार अधिभोग विवरण',
  },

  // Staff
  staff: {
    title: 'डॉक्टर रोस्टर व ड्यूटी कवरेज',
    subtitle: 'प्रमाणित ड्यूटी उपस्थिति, शिफ्ट समय और आवश्यक सेवा स्टाफिंग अलर्ट',
    checkIn: 'उपस्थिति सत्यापित करें',
    recordLeave: 'स्वीकृत अवकाश दर्ज करें',
    shiftGracePeriodNote: 'बिना सूचना अनुपस्थिति केवल 30 मिनट की छूट अवधि के बाद ही चिह्नित की जाती है',
  },

  // Diagnostics
  diagnostics: {
    title: 'निदान परीक्षण सूची व लैब उपलब्धता',
    subtitle: 'आवश्यक पैथोलॉजी व रेडियोलॉजी जांच, उपकरण क्रियाशीलता, और रीएजेंट स्टॉक',
    updateStatus: 'जांच स्थिति अद्यतन करें',
    reagentStatus: 'रीएजेंट व उपभोग्य वस्तुएं',
    equipmentStatus: 'उपकरण स्थिति',
  },

  // Data Import
  import: {
    title: 'थोक सीएसवी डेटा आयात (Bulk Import)',
    subtitle: 'पंक्तिवार सत्यापन और डुप्लिकेट रोकथाम के साथ परिचालन डेटा अपलोड',
    downloadTemplate: 'सीएसवी प्रारूप (Template) डाउनलोड करें',
    uploadPrompt: 'सीएसवी फ़ाइल चुनें या खींच कर लाएं',
    previewRows: 'आयात डेटा सत्यापन पूर्वावलोकन',
    validRows: 'वैध पंक्तियां',
    errorRows: 'पंक्तिवार त्रुटियां मिलीं',
    commitImport: 'सत्यापित रिकॉर्ड डेटाबेस में सहेजें',
  },

  // Audit Logs
  audit: {
    title: 'अपरिवर्तनीय ऑडिट ट्रेल व विनियामक लॉग',
    subtitle: 'सभी स्टॉक समायोजन, बिस्तर अद्यतन, अनुमोदन और उपस्थिति संशोधनों का सुरक्षित रिकॉर्ड',
    timestamp: 'समय मुहर',
    actor: 'अधिकृत उपयोगकर्ता',
    action: 'परिचालन कार्रवाई',
    entity: 'इकाई व लक्ष्य आईडी',
    diff: 'पूर्व मान बनाम नवीन मान',
  },
};
