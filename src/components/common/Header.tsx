import { useState } from 'react';
import { useTranslation } from '../../locales/i18n';
import { User, UserRole } from '../../types';
import { SEED_USERS } from '../../data/seedData';
import { StateManager } from '../../services/store';
import {
  Activity,
  Globe,
  UserCheck,
  RotateCcw,
  Wifi,
  WifiOff,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  onSelectRole: (role: UserRole) => void;
  isOnline: boolean;
  activeAlertCount: number;
  onNavigateToAlerts: () => void;
}

export function Header({
  currentUser,
  onSelectRole,
  isOnline,
  activeAlertCount,
  onNavigateToAlerts,
}: HeaderProps) {
  const { lang, setLang, t } = useTranslation();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    onSelectRole(role);
    setRoleMenuOpen(false);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all operational data back to clean seed state?')) {
      StateManager.resetToSeed();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top Demo Notice & Operational Strip */}
      <div className="bg-emerald-950/80 border-b border-emerald-800/40 px-4 py-1 text-xs flex flex-wrap items-center justify-between gap-2 text-emerald-200">
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-wider uppercase text-[10px] bg-emerald-700/60 px-1.5 py-0.5 rounded text-white">
            DEMO
          </span>
          <span>{t.demoNotice}</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">{t.actions.online}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300">{t.actions.offline}</span>
              </>
            )}
          </div>
          <button
            onClick={handleResetData}
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Reset to fresh demo dataset"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center shadow-inner">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">{t.appName}</span>
              <span className="text-[10px] font-medium bg-teal-900/80 text-teal-300 border border-teal-700/50 px-2 py-0.5 rounded">
                Gov. of UP
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">{t.tagline}</p>
          </div>
        </div>

        {/* Right Controls: Alerts, Language, Role Selector, User */}
        <div className="flex items-center gap-3">
          {/* Critical Alerts Bell / Badge */}
          <button
            onClick={onNavigateToAlerts}
            className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="View Critical Alerts"
          >
            <AlertTriangle className={`w-4 h-4 ${activeAlertCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`} />
            <span className="text-xs font-semibold">{activeAlertCount}</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                lang === 'en' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                lang === 'hi' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              हिन्दी
            </button>
          </div>

          {/* Role Switcher Menu */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 transition-colors cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-teal-400" />
              <div className="text-left hidden md:block">
                <div className="font-medium text-white">{currentUser.name}</div>
                <div className="text-[10px] text-teal-400">{t.roles[currentUser.role]}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2 z-50">
                <div className="px-3 py-1.5 border-b border-slate-700 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {t.actions.switchRole}
                </div>
                {SEED_USERS.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleRoleChange(user.role)}
                    className={`w-full text-left px-3 py-2 text-xs flex flex-col transition-colors cursor-pointer ${
                      currentUser.role === user.role
                        ? 'bg-teal-600/20 text-teal-300 font-semibold border-l-2 border-teal-400'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-white">{user.name}</span>
                    <span className="text-[11px] text-slate-400">{t.roles[user.role]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
