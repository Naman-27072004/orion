import React from 'react';
import { FullSystemTelemetry } from '../types/orion';
import { Cpu, Activity, HardDrive } from 'lucide-react';

interface LiveMonitorViewProps {
  telemetry: FullSystemTelemetry | null;
}

export const LiveMonitorView: React.FC<LiveMonitorViewProps> = ({ telemetry }) => {
  if (!telemetry) return <div className="text-gray-400 text-sm">Loading live metrics...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Live System Telemetry
          </h2>
          <p className="text-xs text-gray-400">Real-time hardware monitoring for Snapdragon® X Plus & Adreno GPU</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Live 1000ms Refresh
        </div>
      </div>

      {/* Snapdragon X Plus Core Grid (8 Cores) */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-blue-400" />
          Qualcomm® Oryon™ CPU (8 Cores Total)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {telemetry.cpu.cores.map((core) => (
            <div key={core.core_id} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
              <div className="flex justify-between text-xs text-gray-400">
                <span className="font-medium text-gray-300">Core {core.core_id}</span>
                <span className="text-blue-400 font-bold">{core.usage.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${Math.max(core.usage, 5)}%` }} />
              </div>
              <p className="text-[10px] text-gray-500">{core.frequency} MHz</p>
            </div>
          ))}
        </div>
      </div>

      {/* RAM & Storage Detail Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* RAM Telemetry */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            LPDDR5X System Memory
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Capacity</span>
              <span className="text-white font-medium">16.0 GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Memory Frequency</span>
              <span className="text-cyan-400 font-bold">8448 MHz</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Used Memory</span>
              <span className="text-white font-medium">{(telemetry.ram.used_bytes / 1073741824).toFixed(2)} GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Free Memory</span>
              <span className="text-emerald-400 font-medium">{(telemetry.ram.free_bytes / 1073741824).toFixed(2)} GB</span>
            </div>
          </div>
        </div>

        {/* NVMe Storage Telemetry */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-purple-400" />
            KIOXIA BG6 NVMe SSD
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Drive Model</span>
              <span className="text-white font-medium">{telemetry.storage.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">SMART Status</span>
              <span className="text-emerald-400 font-bold">{telemetry.storage.health_status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Available Space</span>
              <span className="text-white font-medium">{(telemetry.storage.available_bytes / 1073741824).toFixed(1)} GB Free</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Interface</span>
              <span className="text-purple-300 font-medium">PCIe 4.0 x4 NVMe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
