import React, { useState } from 'react';
import { DellDeviceInfo } from '../types/orion';
import { Laptop, Cpu, Wrench, ExternalLink, CheckCircle2, Search, Info } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

interface DellCompanionViewProps {
  dell: DellDeviceInfo | null;
}

export const DellCompanionView: React.FC<DellCompanionViewProps> = ({ dell }) => {
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!dell) return <div className="text-gray-400 text-sm">Loading Dell telemetry...</div>;

  const handleLaunchSetting = (uri: string) => {
    invoke('launch_settings_uri', { uri })
      .then(() => {
        setStatusMsg("Opened Windows Update Settings");
        setTimeout(() => setStatusMsg(null), 3000);
      })
      .catch(console.error);
  };

  const handleLaunchTool = (tool: string) => {
    invoke<string>('launch_tool', { tool })
      .then((res) => {
        setStatusMsg(res);
        setTimeout(() => setStatusMsg(null), 3000);
      })
      .catch((err) => {
        setStatusMsg(`Launch error: ${err}`);
        setTimeout(() => setStatusMsg(null), 3000);
      });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-white/10 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Laptop className="w-5 h-5 text-blue-400" />
            Dell Companion ({dell.model || 'System Hardware'})
          </h2>
          <p className="text-xs text-gray-400">Supported Hardware WMI Interfaces, Service Tag Telemetry & Official Utility Launchers</p>
        </div>
        {statusMsg && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{statusMsg}</span>
          </div>
        )}
      </div>

      {/* Dell Hardware Identity Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <span className="text-xs text-gray-400">Manufacturer</span>
          <p className="text-base font-bold text-white mt-1">{dell.manufacturer}</p>
        </div>
        <div>
          <span className="text-xs text-gray-400">Laptop Model</span>
          <p className="text-base font-bold text-blue-400 mt-1">{dell.model}</p>
        </div>
        <div>
          <span className="text-xs text-gray-400">Dell Service Tag</span>
          <p className="text-base font-mono font-bold text-emerald-400 mt-1">{dell.service_tag}</p>
        </div>
        <div>
          <span className="text-xs text-gray-400">BIOS Version</span>
          <p className="text-base font-bold text-cyan-400 mt-1">v{dell.bios_version}</p>
        </div>
      </div>

      {/* Official Dell Tools & Launchers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dell Launchers Column */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-blue-400" />
            Official Dell Application Launchers
          </h3>
          <div className="space-y-2 text-xs">
            {/* My Dell Direct App Launcher */}
            <button 
              onClick={() => handleLaunchTool('mydell')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left"
            >
              <div>
                <p className="font-semibold text-white">My Dell Desktop App</p>
                <p className="text-[11px] text-gray-400">Launch official My Dell device manager & battery controller (mydell:)</p>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-400 shrink-0" />
            </button>

            {/* Dell Web Support Portal Direct Link */}
            <button 
              onClick={() => handleLaunchTool('supportassist_web')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left"
            >
              <div>
                <p className="font-semibold text-white">Dell Web Support Portal</p>
                <p className="text-[11px] text-gray-400">Open official dell.com/support drivers & warranty portal</p>
              </div>
              <ExternalLink className="w-4 h-4 text-sky-400 shrink-0" />
            </button>

            {/* Windows Update & Firmware */}
            <button 
              onClick={() => handleLaunchSetting('ms-settings:windowsupdate')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left"
            >
              <div>
                <p className="font-semibold text-gray-200">Dell Update & Firmware</p>
                <p className="text-[11px] text-gray-400">Check official Snapdragon X BIOS & thermal updates</p>
              </div>
              <ExternalLink className="w-4 h-4 text-purple-400 shrink-0" />
            </button>
          </div>
        </div>

        {/* Dell SupportAssist Steps & Thermal Profile */}
        <div className="space-y-6">
          {/* Dell SupportAssist Access Instructions (No External Web Redirection) */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-400" />
              How to Open Dell SupportAssist App
            </h3>
            <p className="text-xs text-gray-400">
              Follow these simple steps on Windows 11 to run official hardware diagnostics:
            </p>
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-black font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                <span className="text-gray-200">Press the <strong className="text-white">Windows Key</strong> on your keyboard.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-black font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                <span className="text-gray-200">Type <strong className="text-emerald-300 font-mono">SupportAssist</strong> in the Windows search bar.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-black font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                <span className="text-gray-200">Click <strong className="text-white">Dell SupportAssist</strong> to launch full hardware diagnostics.</span>
              </div>
            </div>
            <button 
              onClick={() => handleLaunchTool('supportassist')}
              className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 font-medium flex items-center justify-center gap-2 transition-all"
            >
              <Info className="w-3.5 h-3.5 text-emerald-400" /> Direct Protocol Trigger (`dellsupportassist:`)
            </button>
          </div>

          {/* Thermal Profile Info */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Snapdragon Thermal Profile
            </h3>
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1 text-xs">
              <p className="font-bold text-blue-300">Optimized Dynamic Thermal Mode</p>
              <p className="text-gray-300">Inspiron 14 5441 fan RPM runs in silent passive mode during normal web browsing and coding. Active cooling triggers smoothly under sustained multicore loads.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
