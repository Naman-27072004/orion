import React from 'react';
import { StorageTelemetry, PredictionForecast } from '../types/orion';
import { HardDrive, Sparkles } from 'lucide-react';

interface StorageIntelViewProps {
  storage: StorageTelemetry | null;
  prediction: PredictionForecast | null;
}

export const StorageIntelView: React.FC<StorageIntelViewProps> = ({ storage, prediction }) => {
  if (!storage || !prediction) return <div className="text-gray-400 text-sm">Loading storage analytics...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-purple-400" />
          Storage Intelligence & NVMe SMART
        </h2>
        <p className="text-xs text-gray-400">KIOXIA BG6 512GB NVMe SSD Health & Storage Capacity Growth Forecast</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <span className="text-xs text-gray-400">Total Capacity</span>
          <p className="text-2xl font-extrabold text-white">512 GB</p>
          <p className="text-xs text-purple-300">{(storage.available_bytes / 1073741824).toFixed(1)} GB Free ({storage.usage_percentage.toFixed(1)}% Used)</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <span className="text-xs text-gray-400">SMART Drive Health</span>
          <p className="text-2xl font-extrabold text-emerald-400">100% Healthy</p>
          <p className="text-xs text-gray-300">PCIe 4.0 x4 NVMe Interface</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <span className="text-xs text-gray-400">Days Until 90% Full</span>
          <p className="text-2xl font-extrabold text-cyan-400">~{prediction.storage_days_until_90pct} Days</p>
          <p className="text-xs text-gray-400">Based on your daily file write pattern</p>
        </div>
      </div>

      {/* Recommended Cleanups */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          Actionable Cleanups & Optimization
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-200">Downloads Folder Scanner</span>
              <span className="text-xs font-bold text-amber-400">21 GB Cleanable</span>
            </div>
            <p className="text-gray-400">Old zip archives and installation files in Downloads could free up 4.2% of your drive.</p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-200">Cargo & NPM Cache</span>
              <span className="text-xs font-bold text-cyan-400">8.4 GB Cleanable</span>
            </div>
            <p className="text-gray-400">Cleaning dev build caches won't break projects and recovers immediate NVMe capacity.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
