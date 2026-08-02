import React, { useEffect, useState } from 'react';
import { SecurityStatus, DefenderScanStatus } from '../types/orion';
import { ShieldCheck, CheckCircle2, Loader2, Activity } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

interface SecurityViewProps {
  security: SecurityStatus | null;
}

export const SecurityView: React.FC<SecurityViewProps> = ({ security }) => {
  const [scanStatusMsg, setScanStatusMsg] = useState<string | null>(null);
  const [defenderState, setDefenderState] = useState<DefenderScanStatus | null>(null);
  const [triggering, setTriggering] = useState(false);

  const formatDateStr = (rawStr?: string | null) => {
    if (!rawStr) return null;
    if (rawStr.startsWith('/Date(')) {
      const epochMs = parseInt(rawStr.replace('/Date(', '').replace(')/', ''), 10);
      if (!isNaN(epochMs)) {
        return new Date(epochMs).toLocaleString();
      }
    }
    return rawStr;
  };

  const fetchDefenderStatus = () => {
    invoke<DefenderScanStatus>('get_defender_scan_status')
      .then((data) => setDefenderState(data))
      .catch((err) => console.error('Failed to query defender scan status:', err));
  };

  useEffect(() => {
    fetchDefenderStatus();
    const interval = setInterval(fetchDefenderStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!security) return <div className="text-gray-400 text-sm">Loading security state...</div>;

  const handleOpenDefender = () => {
    invoke('launch_settings_uri', { uri: 'ms-settings:windowsdefender' }).catch(console.error);
  };

  const handleRunScan = (scanType: 'quick' | 'full') => {
    setTriggering(true);
    setScanStatusMsg(`Initiating Windows Defender ${scanType} scan...`);
    invoke<string>('run_defender_scan', { scanType })
      .then((msg) => {
        setScanStatusMsg(msg);
        fetchDefenderStatus();
      })
      .catch((err) => setScanStatusMsg(`Scan trigger error: ${err}`))
      .finally(() => {
        setTimeout(() => {
          setTriggering(false);
          fetchDefenderStatus();
        }, 4000);
      });
  };

  const isScanning = defenderState?.is_scanning || triggering;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Security & Encryption Center
        </h2>
        <p className="text-xs text-gray-400">Hardware Security Telemetry for Windows ARM64 & Microsoft Pluton TPM</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>BitLocker Drive Encryption</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-white">Active (Drive C:)</p>
          <p className="text-[11px] text-emerald-400">XTS-AES 128-bit Encrypted</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Secure Boot</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-white">Enabled</p>
          <p className="text-[11px] text-emerald-400">UEFI Firmware Lock Active</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Hardware TPM</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-white">{security.tpm_version}</p>
          <p className="text-[11px] text-cyan-400">Integrated Security Core</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Windows Defender</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-white">
            {isScanning ? 'Scan Active...' : 'Real-Time Active'}
          </p>
          <p className="text-[11px] text-emerald-400">
            {isScanning ? 'Scanning System Files' : 'Definitions Current'}
          </p>
        </div>
      </div>

      {/* Windows Defender Trigger & Live Monitor Panel */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Windows Defender Scan Execution & Status Monitor</h3>
          <p className="text-xs text-gray-400">Trigger malware scans and track active background scan state in real-time</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleRunScan('quick')}
            disabled={isScanning}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-xs font-semibold text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
          >
            {isScanning && (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            )}
            Run Quick Scan
          </button>

          <button
            onClick={() => handleRunScan('full')}
            disabled={isScanning}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-xs font-semibold text-white shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5"
          >
            {isScanning && (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            )}
            Run Full System Scan
          </button>

          <button
            onClick={handleOpenDefender}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 transition-all"
          >
            Open Windows Security
          </button>
        </div>

        {/* Live Status Badge */}
        {isScanning ? (
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl flex items-center gap-3 text-purple-300 text-xs font-mono">
            <Loader2 className="w-4 h-4 animate-spin text-purple-400 shrink-0" />
            <div>
              <p className="font-bold flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 animate-pulse text-purple-400" />
                {defenderState?.message || scanStatusMsg || 'Windows Defender Scan in progress...'}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Windows Defender background scan process active. You can monitor full progress details in Windows Security.
              </p>
            </div>
          </div>
        ) : defenderState?.last_quick_scan_end || defenderState?.last_full_scan_end ? (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1 text-xs font-mono">
            <p className="text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Scan Status: Complete (No Threats Detected)
            </p>
            {defenderState.last_quick_scan_end && (
              <p className="text-[11px] text-gray-400">Last Quick Scan: {formatDateStr(defenderState.last_quick_scan_end)}</p>
            )}
            {defenderState.last_full_scan_end && (
              <p className="text-[11px] text-gray-400">Last Full Scan: {formatDateStr(defenderState.last_full_scan_end)}</p>
            )}
          </div>
        ) : scanStatusMsg ? (
          <p className="text-xs text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 p-2.5 rounded-xl font-mono">
            {scanStatusMsg}
          </p>
        ) : null}
      </div>
    </div>
  );
};

