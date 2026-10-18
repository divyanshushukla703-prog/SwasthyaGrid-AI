import { useTranslation } from '../../locales/i18n';
import {
  LayoutDashboard,
  MapPin,
  Building2,
  Pill,
  TrendingUp,
  Users,
  BedDouble,
  ClipboardCheck,
  FlaskConical,
  ArrowLeftRight,
  ShieldAlert,
  Bell,
  FileSpreadsheet,
  Upload,
  History,
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'districtMap'
  | 'facilities'
  | 'inventory'
  | 'forecasting'
  | 'footfall'
  | 'beds'
  | 'attendance'
  | 'diagnostics'
  | 'redistribution'
  | 'interventions'
  | 'alerts'
  | 'reports'
  | 'dataImport'
  | 'auditLogs';

interface NavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  openAlertsCount: number;
  pendingTransfersCount: number;
  interventionsCount: number;
}

export function Navigation({
  currentTab,
  onSelectTab,
  openAlertsCount,
  pendingTransfersCount,
  interventionsCount,
}: NavigationProps) {
  const { t } = useTranslation();

  const navItems: { id: NavTab; label: string; icon: React.ElementType; badge?: number; badgeColor?: string }[] = [
    { id: 'overview', label: t.nav.overview, icon: LayoutDashboard },
    { id: 'districtMap', label: t.nav.districtMap, icon: MapPin },
    { id: 'facilities', label: t.nav.facilities, icon: Building2 },
    { id: 'inventory', label: t.nav.inventory, icon: Pill },
    { id: 'forecasting', label: t.nav.forecasting, icon: TrendingUp },
    { id: 'footfall', label: t.nav.footfall, icon: Users },
    { id: 'beds', label: t.nav.beds, icon: BedDouble },
    { id: 'attendance', label: t.nav.attendance, icon: ClipboardCheck },
    { id: 'diagnostics', label: t.nav.diagnostics, icon: FlaskConical },
    {
      id: 'redistribution',
      label: t.nav.redistribution,
      icon: ArrowLeftRight,
      badge: pendingTransfersCount,
      badgeColor: 'bg-amber-600',
    },
    {
      id: 'interventions',
      label: t.nav.interventions,
      icon: ShieldAlert,
      badge: interventionsCount,
      badgeColor: 'bg-rose-600',
    },
    {
      id: 'alerts',
      label: t.nav.alerts,
      icon: Bell,
      badge: openAlertsCount,
      badgeColor: 'bg-rose-600',
    },
    { id: 'reports', label: t.nav.reports, icon: FileSpreadsheet },
    { id: 'dataImport', label: t.nav.dataImport, icon: Upload },
    { id: 'auditLogs', label: t.nav.auditLogs, icon: History },
  ];

  return (
    <nav className="bg-slate-800 border-b border-slate-700 shadow-sm overflow-x-auto scrollbar-thin">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 py-1.5 min-w-max">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[10px] font-bold text-white px-1.5 py-0.2 rounded-full ${
                    item.badgeColor || 'bg-teal-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
