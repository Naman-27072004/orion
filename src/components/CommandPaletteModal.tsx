import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  ChevronRight, 
  Settings, 
  Battery, 
  Cpu, 
  Shield, 
  HardDrive, 
  Wrench,
  Zap,
  Wifi,
  Sparkles,
  FileCheck
} from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModule: (moduleId: string) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectModule,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { id: 'dashboard', title: 'Open Dashboard', category: 'Navigation', icon: Cpu },
    { id: 'process-mgr', title: 'Process & Battery Drain Manager', category: 'System', icon: Zap },
    { id: 'network-intel', title: 'Network Throughput & Wi-Fi Auditor', category: 'Network', icon: Wifi },
    { id: 'storage-cleaner', title: 'System Junk & Storage Cleaner', category: 'Storage', icon: Sparkles },
    { id: 'diagnostics', title: 'System Health Diagnostics & PDF Export', category: 'Health', icon: FileCheck },
    { id: 'productivity-tools', title: 'Hardware Utilities & Checksum Hasher', category: 'Tools', icon: Wrench },
    { id: 'live-monitor', title: 'Live Systems Telemetry', category: 'Monitoring', icon: Cpu },
    { id: 'battery', title: 'Battery Guardian & Lifespan', category: 'Power', icon: Battery },
    { id: 'storage', title: 'Storage Intelligence & SMART', category: 'Storage', icon: HardDrive },
    { id: 'dell-companion', title: 'Dell Companion (Inspiron 5441)', category: 'OEM', icon: Wrench },
    { id: 'security', title: 'Security Center (BitLocker & TPM)', category: 'Security', icon: Shield },
    { id: 'windows-control', title: 'Windows 11 Settings Control', category: 'Settings', icon: Settings },
    { id: 'setting-battery', title: 'Launch Windows Battery Settings', category: 'System Action', uri: 'ms-settings:batterysaver' },
    { id: 'setting-network', title: 'Launch Windows Network Settings', category: 'System Action', uri: 'ms-settings:network' },
    { id: 'setting-security', title: 'Launch Windows Security Center', category: 'System Action', uri: 'ms-settings:windowsdefender' },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleExecute = (cmd: typeof commands[0]) => {
    if (cmd.uri) {
      invoke('launch_settings_uri', { uri: cmd.uri }).catch(console.error);
    } else {
      onSelectModule(cmd.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
      <div className="w-full max-w-xl glass-panel rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-white/10">
          <Search className="w-5 h-5 text-blue-400 mr-3" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search module (e.g., process, wifi, junk, hash)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-gray-500"
          />
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <p className="text-center py-6 text-xs text-gray-400">No matching commands found.</p>
          ) : (
            filteredCommands.map((cmd) => {
              const Icon = cmd.icon || Search;
              return (
                <button
                  key={cmd.id}
                  onClick={() => handleExecute(cmd)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-blue-600/20 text-xs text-gray-200 hover:text-white transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-blue-400" />
                    <div>
                      <p className="font-medium">{cmd.title}</p>
                      <p className="text-[10px] text-gray-400">{cmd.category}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-white/10 bg-black/30 flex items-center justify-between text-[10px] text-gray-400">
          <span>Use <b>Ctrl+K</b> to trigger search anytime, <b>ESC</b> to exit</span>
          <span>Orion Intelligence Platform</span>
        </div>
      </div>
    </div>
  );
};
