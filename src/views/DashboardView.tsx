import React from 'react';
import { FullSystemTelemetry, InsightItem, TimelineEvent } from '../types/orion';
import { Cpu, BatteryCharging, HardDrive, Sparkles, AlertCircle } from 'lucide-react';

interface DashboardViewProps {
  telemetry: FullSystemTelemetry | null;
  insights: InsightItem[];
  timeline: TimelineEvent[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ telemetry, insights, timeline }) => {
  if (!telemetry) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm animate-pulse">
        Initializing telemetry engine...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner: Health Score & Executive Summary */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 tracking-wide uppercase">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            System Intelligence Active
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Dell Inspiron 14 5441</h2>
          <p className="text-xs text-gray-400">
            Snapdragon® X Plus (8-Core ARM64) • Windows 11 Home Single Language (Build 26200)
          </p>
        </div>

        {/* Calculated Health Score Circular Badge */}
        <div className="flex items-center gap-5 bg-white/5 px-6 py-4 rounded-2xl border border-white/10 shadow-inner">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-500 transition-all duration-1000 ease-out"
                strokeDasharray={`${telemetry.health_score}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xl font-extrabold text-white">{telemetry.health_score}</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-300">Overall Health Score</p>
            <p className="text-[11px] text-emerald-400 font-medium">Optimal Performance</p>
            <p className="text-[10px] text-gray-400 mt-0.5">0 Hardware Errors Detected</p>
          </div>
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU Tile */}
        <div className="glass-panel p-4 rounded-xl border border-white/10 hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="flex items-center gap-1.5 font-medium"><Cpu className="w-4 h-4 text-blue-400" /> CPU Load</span>
            <span className="text-white font-bold">{telemetry.cpu.total_usage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-2">
            <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(telemetry.cpu.total_usage, 5)}%` }} />
          </div>
          <p className="text-[11px] text-gray-400 truncate">Snapdragon X Plus (8 Cores)</p>
        </div>

        {/* RAM Tile */}
        <div className="glass-panel p-4 rounded-xl border border-white/10 hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="flex items-center gap-1.5 font-medium"><Cpu className="w-4 h-4 text-cyan-400" /> RAM Usage</span>
            <span className="text-white font-bold">{telemetry.ram.usage_percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-2">
            <div className="bg-cyan-500 h-full rounded-full transition-all duration-500" style={{ width: `${telemetry.ram.usage_percentage}%` }} />
          </div>
          <p className="text-[11px] text-gray-400">16 GB LPDDR5X @ 8448 MHz</p>
        </div>

        {/* Storage Tile */}
        <div className="glass-panel p-4 rounded-xl border border-white/10 hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="flex items-center gap-1.5 font-medium"><HardDrive className="w-4 h-4 text-purple-400" /> NVMe SSD</span>
            <span className="text-white font-bold">{telemetry.storage.usage_percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-2">
            <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${telemetry.storage.usage_percentage}%` }} />
          </div>
          <p className="text-[11px] text-gray-400 truncate">KIOXIA 512GB (100% SMART)</p>
        </div>

        {/* Battery Tile */}
        <div className="glass-panel p-4 rounded-xl border border-white/10 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="flex items-center gap-1.5 font-medium"><BatteryCharging className="w-4 h-4 text-emerald-400" /> Battery</span>
            <span className="text-white font-bold">{telemetry.battery.charge_percentage}%</span>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-2">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${telemetry.battery.charge_percentage}%` }} />
          </div>
          <p className="text-[11px] text-gray-400">{telemetry.battery.power_line_status} • {telemetry.battery.battery_wear_percentage}% Wear</p>
        </div>
      </div>

      {/* Intelligence Insights & Actionable Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Insights List (2 Cols) */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Intelligence Engine Insights
            </h3>
            <span className="text-xs text-gray-400">{insights.length} active insights</span>
          </div>

          <div className="space-y-3">
            {insights.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-300">{item.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    {item.impact_level}
                  </span>
                </div>
                <p className="text-xs text-gray-300">{item.description}</p>
                <p className="text-[11px] text-cyan-400 font-medium">💡 Recommendation: {item.recommendation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Events Stream (1 Col) */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-cyan-400" />
              Recent System Events
            </h3>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {timeline.map((evt) => (
              <div key={evt.id} className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs space-y-1">
                <div className="flex items-center justify-between text-gray-400">
                  <span className="font-semibold text-gray-200">{evt.title}</span>
                  <span className="text-[10px] font-mono">{new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-[11px] text-gray-300">{evt.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
