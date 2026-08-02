import React, { useState, useEffect, useMemo } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { FullSystemTelemetry } from '../types/orion';
import { LineChart, Zap, Cpu, HardDrive, Battery, CheckCircle2 } from 'lucide-react';
import ReactECharts from 'echarts-for-react';

interface PerformanceViewProps {
  telemetry: FullSystemTelemetry | null;
}

interface TelemetryHistoryPoint {
  time: string;
  cpu: number;
  ram: number;
  battery: number;
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({ telemetry }) => {
  const [activePowerMode, setActivePowerMode] = useState<string>('balanced');
  const [powerMsg, setPowerMsg] = useState<string | null>(null);
  const [isChangingPower, setIsChangingPower] = useState<boolean>(false);
  const [history, setHistory] = useState<TelemetryHistoryPoint[]>([]);

  // Fetch initial power mode asynchronously
  useEffect(() => {
    invoke<string>('get_power_mode')
      .then((mode) => {
        if (mode) setActivePowerMode(mode);
      })
      .catch((err) => console.error('Failed to get active power mode:', err));
  }, []);

  // Accumulate live telemetry history points (max 10 points)
  useEffect(() => {
    if (!telemetry) return;

    const now = new Date();
    const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newPoint: TelemetryHistoryPoint = {
      time: timeLabel,
      cpu: Number(telemetry.cpu.total_usage.toFixed(1)),
      ram: Number(telemetry.ram.usage_percentage.toFixed(1)),
      battery: telemetry.battery.charge_percentage,
    };

    setHistory((prev) => {
      const updated = [...prev, newPoint];
      if (updated.length > 12) {
        return updated.slice(updated.length - 12);
      }
      return updated;
    });
  }, [telemetry]);

  const handlePowerChange = (mode: string) => {
    if (isChangingPower) return;
    setActivePowerMode(mode);
    setIsChangingPower(true);

    invoke<string>('change_power_mode', { mode })
      .then((msg: string) => {
        setPowerMsg(msg);
        setIsChangingPower(false);
        setTimeout(() => setPowerMsg(null), 3500);
      })
      .catch((err: unknown) => {
        setPowerMsg(`Power mode status: ${err}`);
        setIsChangingPower(false);
        setTimeout(() => setPowerMsg(null), 3500);
      });
  };

  // Memoize chart option to avoid unnecessary re-creation & DOM/canvas lockups
  const performanceOption = useMemo(() => {
    const times = history.length > 0 ? history.map((h) => h.time) : ['--:--'];
    const cpuData = history.length > 0 ? history.map((h) => h.cpu) : [0];
    const ramData = history.length > 0 ? history.map((h) => h.ram) : [0];
    const batteryData = history.length > 0 ? history.map((h) => h.battery) : [0];

    return {
      backgroundColor: 'transparent',
      animationDuration: 300,
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textStyle: { color: '#ffffff', fontSize: 12 },
      },
      legend: { textStyle: { color: '#9ca3af', fontSize: 11 }, top: 0 },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: times,
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: { color: '#9ca3af', fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        max: 100,
        min: 0,
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: { color: '#9ca3af', fontSize: 10, formatter: '{value}%' },
        splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
      },
      series: [
        {
          name: 'CPU Load %',
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: cpuData,
          itemStyle: { color: '#3b82f6' },
          lineStyle: { width: 2 },
        },
        {
          name: 'RAM Load %',
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: ramData,
          itemStyle: { color: '#06b6d4' },
          lineStyle: { width: 2 },
        },
        {
          name: 'Battery Level %',
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: batteryData,
          itemStyle: { color: '#10b981' },
          lineStyle: { width: 2 },
        },
      ],
    };
  }, [history]);

  if (!telemetry) return <div className="text-gray-400 text-sm">Loading historical data...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <LineChart className="w-5 h-5 text-blue-400" />
            Performance Center & Telemetry Trends
          </h2>
          <p className="text-xs text-gray-400">Real-Time Historical Timeline & Windows Power Scheme Controller</p>
        </div>

        {/* Power Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 p-1 rounded-xl">
          <button
            onClick={() => handlePowerChange('high')}
            disabled={isChangingPower}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activePowerMode === 'high'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            High Perf
          </button>
          <button
            onClick={() => handlePowerChange('balanced')}
            disabled={isChangingPower}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activePowerMode === 'balanced'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Balanced
          </button>
          <button
            onClick={() => handlePowerChange('saver')}
            disabled={isChangingPower}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activePowerMode === 'saver'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Battery Saver
          </button>
        </div>
      </div>

      {powerMsg && (
        <div className="text-xs text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 p-2.5 rounded-xl font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{powerMsg}</span>
        </div>
      )}

      {/* Realtime Live Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Live CPU Load</p>
            <p className="text-lg font-bold text-white font-mono">{telemetry.cpu.total_usage.toFixed(1)}%</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Live Memory Load</p>
            <p className="text-lg font-bold text-white font-mono">{telemetry.ram.usage_percentage.toFixed(1)}%</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Battery className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Battery Charge</p>
            <p className="text-lg font-bold text-white font-mono">{telemetry.battery.charge_percentage}%</p>
          </div>
        </div>
      </div>

      {/* GPU Telemetry Panel */}
      {telemetry.gpu && (
        <div className="glass-panel p-5 rounded-2xl border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-gray-400">GPU Processor</p>
            <p className="text-sm font-bold text-white">{telemetry.gpu.name}</p>
            <p className="text-[11px] text-cyan-400">{telemetry.gpu.status}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-400">GPU Load & Thermal</p>
            <p className="text-lg font-bold text-amber-400">{telemetry.gpu.load_percentage.toFixed(1)}%</p>
            <p className="text-[11px] text-gray-400">Core Temp: {telemetry.gpu.temperature_c}°C</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-400">Dedicated VRAM Usage</p>
            <p className="text-lg font-bold text-blue-400">
              {telemetry.gpu.vram_used_mb} MB / {telemetry.gpu.vram_total_mb} MB
            </p>
            <p className="text-[11px] text-gray-400">
              {((telemetry.gpu.vram_used_mb / telemetry.gpu.vram_total_mb) * 100).toFixed(1)}% Allocated
            </p>
          </div>
        </div>
      )}

      {/* Optimized ECharts Canvas Container */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" /> Real-Time Telemetry Stream
          </h3>
          <span className="text-[10px] text-gray-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
            Updates every 1.0s ({history.length} samples recorded)
          </span>
        </div>
        <ReactECharts
          option={performanceOption}
          style={{ height: '320px', width: '100%' }}
          notMerge={false}
          lazyUpdate={true}
        />
      </div>
    </div>
  );
};
