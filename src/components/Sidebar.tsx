import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  BatteryCharging, 
  LineChart, 
  Settings2, 
  Laptop, 
  ShieldCheck, 
  Clock, 
  Code2,
  Search,
  Zap,
  Wifi,
  Sparkles,
  FileCheck,
  Wrench,
  Bot,
  Lock,
  Globe,
  PanelLeftClose,
  PanelLeftOpen,
  Settings
} from 'lucide-react';

interface SidebarProps {
  currentModule: string;
  setCurrentModule: (mod: string) => void;
  openCommandPalette: () => void;
  archLabel?: string;
  isDellHardware?: boolean;
  showDellCompanion?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentModule, 
  setCurrentModule,
  openCommandPalette,
  archLabel,
  isDellHardware = false,
  showDellCompanion = false
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'password-vault', label: 'Password Vault (AES-256)', icon: Lock },
    { id: 'vpn-tunnel', label: 'Safe VPN Tunnel', icon: Globe },
    { id: 'ai-assistant', label: 'AI Diagnostic Assistant', icon: Bot },
    { id: 'process-mgr', label: 'Process & Energy', icon: Zap },
    { id: 'network-intel', label: 'Network & Wi-Fi', icon: Wifi },
    { id: 'storage-cleaner', label: 'Storage & Cleaner', icon: Sparkles },
    { id: 'diagnostics', label: 'Diagnostics & Reports', icon: FileCheck },
    { id: 'productivity-tools', label: 'Hardware Tools', icon: Wrench },
    { id: 'live-monitor', label: 'Live Monitor', icon: Activity },
    { id: 'battery', label: 'Battery Guardian', icon: BatteryCharging },
    { id: 'performance', label: 'Performance Center', icon: LineChart },
    { id: 'windows-control', label: 'Windows Control', icon: Settings2 },
    ...(isDellHardware && showDellCompanion ? [{ id: 'dell-companion', label: 'Dell Companion', icon: Laptop }] : []),
    { id: 'security', label: 'Security Center', icon: ShieldCheck },
    { id: 'timeline', label: 'Timeline Audit', icon: Clock },
    { id: 'settings', label: 'Settings & Toggles', icon: Settings },
    { id: 'dev-mode', label: 'Developer Mode', icon: Code2 },
  ];

  const menuItems = allMenuItems;

  return (
    <aside
      className={`glass-panel border-r border-white/10 flex flex-col justify-between h-screen p-3 select-none shrink-0 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="overflow-y-auto">
        {/* Brand Header & Collapse Button */}
        <div className="flex items-center justify-between px-2 py-3 mb-2 border-b border-white/10">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" className="w-8 h-8 rounded-xl shadow-lg shadow-blue-500/30 object-cover" alt="Orion Logo" />
              <div>
                <h1 className="font-bold text-base text-white tracking-wide leading-none">ORION</h1>
                <p className="text-[10px] text-blue-400 font-medium">
                  {archLabel ? `${archLabel} Intelligence` : 'System Intelligence'}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all mx-auto"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Command Launcher */}
        {!isCollapsed && (
          <button 
            onClick={openCommandPalette}
            className="w-full flex items-center justify-between px-3 py-2 mb-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-400 hover:text-white border border-white/10 transition-all"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-blue-400" />
              Search Tools...
            </span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-gray-300 font-mono">Ctrl+K</kbd>
          </button>
        )}

        {/* Navigation Items */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentModule(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Laptop Telemetry Footer */}
      {!isCollapsed && (
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs mt-2 shrink-0">
          <p className="font-semibold text-gray-200 truncate">Dell Inspiron 14 5441</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Snapdragon® X Plus</p>
          <div className="mt-2 flex items-center justify-between text-[10px]">
            <span className="text-emerald-400 font-medium">● 100% Safe OS</span>
            <span className="text-gray-400">16GB RAM</span>
          </div>
        </div>
      )}
    </aside>
  );
};
