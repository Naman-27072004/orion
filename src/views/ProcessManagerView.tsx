import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ProcessItem } from '../types/orion';
import { 
  Zap, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Trash2, 
  RefreshCw, 
  Cpu 
} from 'lucide-react';

export const ProcessManagerView: React.FC = () => {
  const [processes, setProcesses] = useState<ProcessItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProcess, setSelectedProcess] = useState<ProcessItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProcesses = () => {
    setIsLoading(true);
    invoke<ProcessItem[]>('get_processes')
      .then((data) => {
        setProcesses(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchProcesses();
    const interval = setInterval(fetchProcesses, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleKillClick = (proc: ProcessItem) => {
    if (proc.is_protected) {
      setNotification({
        msg: `Cannot kill protected system process '${proc.name}'. System protection is active.`,
        type: 'error',
      });
      setTimeout(() => setNotification(null), 4000);
      return;
    }
    setSelectedProcess(proc);
    setIsModalOpen(true);
  };

  const confirmKill = () => {
    if (!selectedProcess) return;
    invoke<string>('kill_process', { pid: selectedProcess.pid })
      .then((res) => {
        setNotification({ msg: res, type: 'success' });
        setIsModalOpen(false);
        setSelectedProcess(null);
        fetchProcesses();
        setTimeout(() => setNotification(null), 4000);
      })
      .catch((err) => {
        setNotification({ msg: String(err), type: 'error' });
        setIsModalOpen(false);
        setSelectedProcess(null);
        setTimeout(() => setNotification(null), 4000);
      });
  };

  const filtered = processes.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.pid.toString().includes(searchTerm)
  );

  const formatBytes = (bytes: number) => {
    if (bytes >= 1_073_741_824) return (bytes / 1_073_741_824).toFixed(2) + ' GB';
    if (bytes >= 1_048_576) return (bytes / 1_048_576).toFixed(1) + ' MB';
    return (bytes / 1024).toFixed(0) + ' KB';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-400" /> Active Process & Energy Manager
          </h2>
          <p className="text-sm text-gray-400">
            Monitor background resource hogs, energy drain impact, and safely manage applications.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => {
              invoke<string>('trim_ram')
                .then((msg) => {
                  setNotification({ msg, type: 'success' });
                  fetchProcesses();
                  setTimeout(() => setNotification(null), 4000);
                })
                .catch((err) => {
                  setNotification({ msg: String(err), type: 'error' });
                  setTimeout(() => setNotification(null), 4000);
                });
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-xs font-semibold text-emerald-300 hover:text-white border border-emerald-500/30 transition-all shadow-lg shadow-emerald-600/20"
          >
            <Zap className="w-3.5 h-3.5" /> Trim RAM Working Set
          </button>

          <button
            onClick={fetchProcesses}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white border border-white/10 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center gap-3 ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Search & Statistics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="sm:col-span-2 glass-panel p-3 border border-white/10 rounded-2xl flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400 ml-2" />
          <input
            type="text"
            placeholder="Search processes by name or PID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none text-sm text-white placeholder-gray-500 focus:outline-none"
          />
        </div>
        <div className="glass-panel p-4 border border-white/10 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Total Processes</p>
            <p className="text-xl font-bold text-white mt-1">{processes.length}</p>
          </div>
          <Cpu className="w-8 h-8 text-blue-400/80" />
        </div>
        <div className="glass-panel p-4 border border-white/10 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">High Energy Impact</p>
            <p className="text-xl font-bold text-amber-400 mt-1">
              {processes.filter((p) => p.energy_impact === 'High').length}
            </p>
          </div>
          <Zap className="w-8 h-8 text-amber-400/80" />
        </div>
      </div>

      {/* Process Table */}
      <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-white/5 border-b border-white/10 text-gray-400 uppercase tracking-wider sticky top-0 backdrop-blur-md">
              <tr>
                <th className="px-4 py-3">Process Name</th>
                <th className="px-4 py-3">PID</th>
                <th className="px-4 py-3">CPU %</th>
                <th className="px-4 py-3">Memory Usage</th>
                <th className="px-4 py-3">Energy Impact</th>
                <th className="px-4 py-3">Protection</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((proc) => (
                <tr key={proc.pid} className="hover:bg-white/5 transition-all">
                  <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                    {proc.name}
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono">{proc.pid}</td>
                  <td className="px-4 py-3 font-semibold text-blue-400">
                    {proc.cpu_usage.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-gray-300 font-mono">
                    {formatBytes(proc.memory_bytes)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        proc.energy_impact === 'High'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : proc.energy_impact === 'Medium'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {proc.energy_impact}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {proc.is_protected ? (
                      <span className="flex items-center gap-1 text-[11px] text-blue-400 font-medium">
                        <ShieldAlert className="w-3.5 h-3.5" /> System Locked
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-500">User App</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleKillClick(proc)}
                      disabled={proc.is_protected}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                        proc.is_protected
                          ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                          : 'bg-rose-600/20 hover:bg-rose-600 text-rose-300 border border-rose-500/30 hover:text-white'
                      }`}
                    >
                      Kill Process
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Kill Process Confirmation Modal */}
      {isModalOpen && selectedProcess && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass-panel border border-white/20 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-rose-500/20 text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Terminate Process?</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Are you sure you want to end <span className="text-white font-bold">{selectedProcess.name}</span> (PID: {selectedProcess.pid})? Unsaved data in this application may be lost.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-gray-300 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmKill}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white transition-all shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> End Process
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
