import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { FileHashResult } from '../types/orion';
import { 
  Wrench, 
  Keyboard, 
  FileCode, 
  Eye, 
  ExternalLink 
} from 'lucide-react';

export const ProductivityToolsView: React.FC = () => {
  // Keyboard Tester State
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  // Eye Strain Timer State
  const [breakTimerSeconds, setBreakTimerSeconds] = useState(1200); // 20 mins

  // File Hash & VirusTotal State
  const [filePathInput, setFilePathInput] = useState('');
  const [hashResult, setHashResult] = useState<FileHashResult | null>(null);
  const [vtResult, setVtResult] = useState<{ status: string; url: string } | null>(null);

  // Deep Link Launcher State
  const [launcherMsg, setLauncherMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setPressedKeys((prev) => new Set(prev).add(e.key.toUpperCase()));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (breakTimerSeconds > 0) {
      interval = setInterval(() => setBreakTimerSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    }
    return () => clearInterval(interval);
  }, [breakTimerSeconds]);

  const handleHashCalculate = () => {
    if (!filePathInput) return;
    setVtResult(null);
    invoke<FileHashResult>('hash_file', { filePath: filePathInput })
      .then(setHashResult)
      .catch((err) => alert(`Error hashing file: ${err}`));
  };

  const handleVtScan = () => {
    if (!filePathInput) return;
    invoke<any>('scan_virustotal', { filePath: filePathInput })
      .then((res) => {
        setVtResult({ status: res.status, url: res.virustotal_url });
        invoke('launch_settings_uri', { uri: res.virustotal_url }).catch(console.error);
      })
      .catch((err) => alert(`VirusTotal scan error: ${err}`));
  };

  const handleLaunchTool = (tool: string) => {
    invoke<string>('launch_tool', { tool })
      .then((res) => {
        setLauncherMsg(res);
        setTimeout(() => setLauncherMsg(null), 3000);
      })
      .catch((err) => alert(`Failed to launch tool: ${err}`));
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const sampleKeys = [
    'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
    'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
    'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'SPACE', 'ENTER'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wrench className="w-6 h-6 text-purple-400" /> Productivity & Hardware Utilities
          </h2>
          <p className="text-sm text-gray-400">
            Keyboard key tester, offline image converter, file hash verifier, and Windows deep-links.
          </p>
        </div>
      </div>

      {/* Grid of Utilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Interactive Keyboard Key Tester */}
        <div className="glass-panel p-5 border border-white/10 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-purple-400" /> Interactive Keyboard Tester
            </h3>
            <button
              onClick={() => setPressedKeys(new Set())}
              className="text-xs text-gray-400 hover:text-white underline"
            >
              Reset Keys
            </button>
          </div>
          <p className="text-xs text-gray-400">Press any key on your keyboard to test key response:</p>
          <div className="flex flex-wrap gap-1.5">
            {sampleKeys.map((key) => {
              const isPressed = pressedKeys.has(key);
              return (
                <div
                  key={key}
                  className={`px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                    isPressed
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 scale-105 border border-purple-400'
                      : 'bg-white/5 text-gray-400 border border-white/10'
                  }`}
                >
                  {key}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Eye Strain 20-20-20 Rule Timer */}
        <div className="glass-panel p-5 border border-white/10 rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" /> Eye Strain Break Reminder (20-20-20 Rule)
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Rest your eyes every 20 minutes by looking at an object 20 feet away for 20 seconds.
            </p>
          </div>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <div>
              <p className="text-xs text-gray-400">Next Break In</p>
              <p className="text-3xl font-mono font-bold text-emerald-400 mt-1">
                {formatTimer(breakTimerSeconds)}
              </p>
            </div>
            <button
              onClick={() => setBreakTimerSeconds(1200)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white border border-white/10"
            >
              Reset Timer
            </button>
          </div>
        </div>

        {/* 3. File Checksum Hash Calculator */}
        <div className="glass-panel p-5 border border-white/10 rounded-2xl space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <FileCode className="w-4 h-4 text-sky-400" /> File Checksum Hash Calculator
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter file absolute path (e.g. C:\path\file.iso)"
                value={filePathInput}
                onChange={(e) => setFilePathInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none"
              />
              <button
                onClick={handleHashCalculate}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold"
              >
                Hash
              </button>
              <button
                onClick={handleVtScan}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-1 shrink-0"
              >
                VirusTotal Lookup
              </button>
            </div>
            {hashResult && (
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1 font-mono text-[11px]">
                <p className="text-white font-bold">{hashResult.file_name}</p>
                <p className="text-gray-400">MD5: {hashResult.md5_hash}</p>
                <p className="text-gray-400">SHA256: {hashResult.sha256_hash}</p>
              </div>
            )}
            {vtResult && (
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-1 text-[11px]">
                <p className="text-purple-300 font-bold">VirusTotal Threat Intelligence Status:</p>
                <p className="text-emerald-400">{vtResult.status}</p>
                <a
                  href={vtResult.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 underline font-mono text-[10px] break-all block mt-1"
                >
                  {vtResult.url}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* 4. Windows Deep-Link Tools Launcher */}
        <div className="glass-panel p-5 border border-white/10 rounded-2xl space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-amber-400" /> Instant Windows Deep-Link Launcher
          </h3>
          {launcherMsg && (
            <p className="text-xs text-emerald-400 font-semibold">{launcherMsg}</p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'dxdiag', label: 'DirectX DxDiag' },
              { id: 'devmgmt', label: 'Device Manager' },
              { id: 'services', label: 'Services' },
              { id: 'cleanmgr', label: 'Disk Cleanup' },
              { id: 'taskmgr', label: 'Task Manager' },
              { id: 'resmon', label: 'Resource Monitor' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => handleLaunchTool(t.id)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-gray-300 hover:text-white text-left transition-all"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
