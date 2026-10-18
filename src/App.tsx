import { useState, useEffect } from 'react';
import { I18nProvider, useTranslation } from './locales/i18n';
import { StateManager, AppState } from './services/store';
import { Header } from './components/common/Header';
import { Navigation, NavTab } from './components/common/Navigation';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { DistrictMap } from './components/map/DistrictMap';
import { FacilityDirectory } from './components/facilities/FacilityDirectory';
import { MedicineInventory } from './components/inventory/MedicineInventory';
import { DemandForecastView } from './components/forecast/DemandForecastView';
import { PatientFootfallView } from './components/footfall/PatientFootfallView';
import { BedManagement } from './components/beds/BedManagement';
import { StaffAttendanceView } from './components/staff/StaffAttendanceView';
import { DiagnosticAvailabilityView } from './components/diagnostics/DiagnosticAvailabilityView';
import { ResourceRedistributionView } from './components/redistribution/ResourceRedistributionView';
import { InterventionCasesView } from './components/interventions/InterventionCasesView';
import { AlertsCenter } from './components/alerts/AlertsCenter';
import { ReportsView } from './components/reports/ReportsView';
import { BulkDataImport } from './components/import/BulkDataImport';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { UserRole } from './types';
import { SEED_USERS } from './data/seedData';

function MainApp() {
  const { t } = useTranslation();
  const [appState, setAppState] = useState<AppState>(StateManager.getState());
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');

  useEffect(() => {
    const unsubscribe = StateManager.subscribe((newState) => {
      setAppState(newState);
    });

    const handleOnline = () => {
      setAppState((prev) => ({ ...prev, isOnline: true }));
    };
    const handleOffline = () => {
      setAppState((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const metrics = StateManager.getCalculatedMetrics();
  const openAlertsCount = appState.alerts.filter((a) => a.status === 'OPEN').length;
  const pendingTransfersCount = appState.redistributions.filter(
    (r) => r.status === 'PENDING_APPROVAL'
  ).length;
  const interventionsCount = appState.interventions.filter((c) => c.status !== 'RESOLVED').length;

  const handleSelectRole = (role: UserRole) => {
    const userMatch = SEED_USERS.find((u) => u.role === role);
    if (userMatch) {
      StateManager.setCurrentUser(userMatch);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Universal Header */}
      <Header
        currentUser={appState.currentUser}
        onSelectRole={handleSelectRole}
        isOnline={appState.isOnline}
        activeAlertCount={openAlertsCount}
        onNavigateToAlerts={() => setCurrentTab('alerts')}
      />

      {/* Main Module Navigation Bar */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        openAlertsCount={openAlertsCount}
        pendingTransfersCount={pendingTransfersCount}
        interventionsCount={interventionsCount}
      />

      {/* Primary Workspace View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'overview' && (
          <OverviewDashboard
            metrics={metrics}
            facilities={appState.facilities}
            inventory={appState.inventory}
            alerts={appState.alerts}
            redistributions={appState.redistributions}
            currentUser={appState.currentUser}
            onNavigateTab={(tab) => setCurrentTab(tab as NavTab)}
          />
        )}

        {currentTab === 'districtMap' && (
          <DistrictMap
            facilities={appState.facilities}
            inventory={appState.inventory}
            alerts={appState.alerts}
            beds={appState.beds}
          />
        )}

        {currentTab === 'facilities' && (
          <FacilityDirectory
            facilities={appState.facilities}
            inventory={appState.inventory}
            alerts={appState.alerts}
            beds={appState.beds}
          />
        )}

        {currentTab === 'inventory' && (
          <MedicineInventory
            inventory={appState.inventory}
            transactions={appState.transactions}
            facilities={appState.facilities}
            currentUser={appState.currentUser}
          />
        )}

        {currentTab === 'forecasting' && (
          <DemandForecastView
            inventory={appState.inventory}
            facilities={appState.facilities}
          />
        )}

        {currentTab === 'footfall' && (
          <PatientFootfallView
            footfall={appState.footfall}
            facilities={appState.facilities}
            currentUser={appState.currentUser}
          />
        )}

        {currentTab === 'beds' && (
          <BedManagement
            beds={appState.beds}
            facilities={appState.facilities}
            currentUser={appState.currentUser}
          />
        )}

        {currentTab === 'attendance' && (
          <StaffAttendanceView
            roster={appState.roster}
            facilities={appState.facilities}
            currentUser={appState.currentUser}
          />
        )}

        {currentTab === 'diagnostics' && (
          <DiagnosticAvailabilityView
            diagnostics={appState.diagnostics}
            facilities={appState.facilities}
            currentUser={appState.currentUser}
          />
        )}

        {currentTab === 'redistribution' && (
          <ResourceRedistributionView
            redistributions={appState.redistributions}
            facilities={appState.facilities}
            currentUser={appState.currentUser}
          />
        )}

        {currentTab === 'interventions' && (
          <InterventionCasesView
            interventions={appState.interventions}
            facilities={appState.facilities}
            currentUser={appState.currentUser}
          />
        )}

        {currentTab === 'alerts' && (
          <AlertsCenter
            alerts={appState.alerts}
            facilities={appState.facilities}
            currentUser={appState.currentUser}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsView
            facilities={appState.facilities}
            inventory={appState.inventory}
            footfall={appState.footfall}
            beds={appState.beds}
            roster={appState.roster}
            diagnostics={appState.diagnostics}
            currentUser={appState.currentUser}
          />
        )}

        {currentTab === 'dataImport' && (
          <BulkDataImport
            facilities={appState.facilities}
            currentUser={appState.currentUser}
          />
        )}

        {currentTab === 'auditLogs' && (
          <AuditLogsView
            auditLogs={appState.auditLogs}
            facilities={appState.facilities}
          />
        )}
      </main>

      {/* Official Health Authority Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-bold text-slate-200 tracking-wide text-sm">{t.appName}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">{t.tagline}</p>
          </div>
          <div className="text-center md:text-right text-[11px] text-slate-400 space-y-0.5">
            <div>Department of Medical Health & Family Welfare, Government of Uttar Pradesh</div>
            <div>Built for operational resource optimization. Conforms to DPDP Act 2023 & NHA EHR Standards.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <MainApp />
    </I18nProvider>
  );
}
