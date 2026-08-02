import React from 'react';
import { Settings, Laptop, Wifi, Globe, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';
import { DellDeviceInfo } from '../types/orion';

interface SettingsViewProps {
  dell: DellDeviceInfo | null;
  showDellCompanion: boolean;
  setShowDellCompanion: (val: boolean) => void;
  showExcitelPortal: boolean;
  setShowExcitelPortal: (val: boolean) => void;
  showRouterBanner: boolean;
  setShowRouterBanner: (val: boolean) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  dell,
  showDellCompanion,
  setShowDellCompanion,
  showExcitelPortal,
  setShowExcitelPortal,
  showRouterBanner,
  setShowRouterBanner,
}) => {
  const isDellHardware = dell?.manufacturer ? dell.manufacturer.toLowerCase().includes('dell') : false;

  const handleToggleDell = (checked: boolean) => {
    if (!isDellHardware) return;
    setShowDellCompanion(checked);
    localStorage.setItem('orion_setting_dell_companion', String(checked));
  };

  const handleToggleExcitel = (checked: boolean) => {
    setShowExcitelPortal(checked);
    localStorage.setItem('orion_setting_excitel', String(checked));
  };

  const handleToggleRouter = (checked: boolean) => {
    setShowRouterBanner(checked);
    localStorage.setItem('orion_setting_router_banner', String(checked));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          Application Settings & Feature Preferences
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Customize module visibility, OEM integrations, and local network tools.
        </p>
      </div>

      {/* Feature Toggles Container */}
      <div className="grid grid-cols-1 gap-4 max-w-4xl">
        {/* 1. Dell Companion Module Toggle */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-sm text-white">Dell Companion Module</h3>
              {isDellHardware ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Dell Device Detected ({dell?.model})
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-semibold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Dell Hardware Only
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">
              Displays Dell Service Tag telemetry, WMI status, and native launchers (My Dell & SupportAssist).
            </p>
            {!isDellHardware && (
              <p className="text-[11px] text-amber-400/90 flex items-center gap-1 mt-1">
                <ShieldAlert className="w-3 h-3" />
                This feature is permanently disabled because non-Dell hardware ({dell?.manufacturer || 'Generic PC'}) was detected.
              </p>
            )}
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={isDellHardware && showDellCompanion}
              disabled={!isDellHardware}
              onChange={(e) => handleToggleDell(e.target.checked)}
              className="sr-only peer"
            />
            <div className={`w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
              !isDellHardware 
                ? 'opacity-40 cursor-not-allowed bg-white/5' 
                : 'peer-checked:bg-blue-600 hover:bg-white/20'
            }`}></div>
          </label>
        </div>

        {/* 2. Excitel Broadband Integration Toggle */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-orange-400" />
              <h3 className="font-bold text-sm text-white">Excitel Broadband Subscriber Portal</h3>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-gray-300 text-[10px] font-semibold">
                Off by Default
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Shows Excitel Fiber quick login, bill payment, speedtest shortcuts, and local account vault in Network Intel.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={showExcitelPortal}
              onChange={(e) => handleToggleExcitel(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600 hover:bg-white/20"></div>
          </label>
        </div>

        {/* 3. Titanium Router Admin Gateway Banner Toggle */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Titanium Router Admin Quick Access Banner</h3>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-gray-300 text-[10px] font-semibold">
                Off by Default
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Shows quick access banner to default gateway (192.168.1.1) in Network Intel module.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={showRouterBanner}
              onChange={(e) => handleToggleRouter(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 hover:bg-white/20"></div>
          </label>
        </div>
      </div>
    </div>
  );
};
