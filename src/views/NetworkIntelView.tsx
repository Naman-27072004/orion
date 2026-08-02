import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { NetworkSpeed, PingResult, OpenPortItem, WifiAudit } from '../types/orion';
import { 
  Wifi, 
  Activity, 
  Globe, 
  Radio, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw,
  ExternalLink,
  Zap,
  Lock,
  Key
} from 'lucide-react';

interface NetworkIntelViewProps {
  showExcitelPortal?: boolean;
  showRouterBanner?: boolean;
}

export const NetworkIntelView: React.FC<NetworkIntelViewProps> = ({
  showExcitelPortal = false,
  showRouterBanner = false,
}) => {
  const [speed, setSpeed] = useState<NetworkSpeed | null>(null);
  const [pings, setPings] = useState<PingResult[]>([]);
  const [ports, setPorts] = useState<OpenPortItem[]>([]);
  const [wifi, setWifi] = useState<WifiAudit | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRunTests, setHasRunTests] = useState(false);

  const runNetworkTests = () => {
    setIsLoading(true);
    Promise.all([
      invoke<PingResult[]>('get_ping_info').then(setPings),
      invoke<OpenPortItem[]>('get_open_ports').then(setPorts),
      invoke<WifiAudit>('get_wifi_details').then(setWifi),
    ])
      .then(() => setHasRunTests(true))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  // Excitel Login State
  const [excitelUser, setExcitelUser] = useState(() => localStorage.getItem('orion_excitel_user') || '');
  const [excitelPass, setExcitelPass] = useState(() => localStorage.getItem('orion_excitel_pass') || '');
  const [showExcitelModal, setShowExcitelModal] = useState(false);
  const [copiedField, setCopiedField] = useState<'user' | 'pass' | null>(null);

  const saveExcitelCreds = () => {
    localStorage.setItem('orion_excitel_user', excitelUser);
    localStorage.setItem('orion_excitel_pass', excitelPass);
  };

  const handleLaunchExcitelPortal = (url: string = 'https://my.excitel.com/login') => {
    saveExcitelCreds();
    invoke('launch_settings_uri', { uri: url }).catch(console.error);
  };

  const handleCopy = (text: string, field: 'user' | 'pass') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRunExcitelSpeedTest = () => {
    invoke('launch_settings_uri', { uri: 'https://www.excitel.com/speedtest/' }).catch(console.error);
  };

  const handleOpenRouterAdmin = () => {
    invoke('launch_settings_uri', { uri: 'http://192.168.1.1' }).catch(console.error);
  };

  useEffect(() => {
    invoke<NetworkSpeed>('get_network_info').then(setSpeed).catch(console.error);
    const interval = setInterval(() => {
      invoke<NetworkSpeed>('get_network_info').then(setSpeed).catch(console.error);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const formatKB = (bytes: number) => {
    return (bytes / 1024).toFixed(1) + ' KB/s';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wifi className="w-6 h-6 text-sky-400" /> Network & Bandwidth Intelligence
          </h2>
          <p className="text-sm text-gray-400">
            Real-time throughput, Wi-Fi security audit, DNS ping latency, and active connection diagnostic tools.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {showExcitelPortal && (
            <button
              onClick={() => handleLaunchExcitelPortal('https://my.excitel.com/login')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-xs font-semibold text-white transition-all shadow-lg shadow-orange-600/25"
            >
              <Lock className="w-3.5 h-3.5" /> Excitel Selfcare Login
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
          )}
          {showRouterBanner && (
            <button
              onClick={handleOpenRouterAdmin}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-all shadow-lg shadow-emerald-600/25"
            >
              <Globe className="w-3.5 h-3.5" /> Router Admin (192.168.1.1)
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
          )}
          {showExcitelPortal && (
            <button
              onClick={handleRunExcitelSpeedTest}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-xs font-semibold text-white transition-all shadow-lg shadow-sky-500/25"
            >
              <Zap className="w-3.5 h-3.5 fill-current" /> Excitel Speed Test
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
          )}
          <button
            onClick={runNetworkTests}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-50 text-xs text-white border border-white/10 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Running Tests...' : hasRunTests ? 'Refresh Tests' : 'Run Tests'}
          </button>
        </div>
      </div>

      {/* Excitel Broadband Portal & Quick Login Vault Banner */}
      {showExcitelPortal && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-950/40 via-amber-950/30 to-slate-900/60 border border-orange-500/30 text-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-orange-500 text-black font-black text-[10px] uppercase tracking-wider">
                  EXCITEL FIBER
                </span>
                <p className="font-bold text-white text-sm flex items-center gap-1.5">
                  Excitel Broadband Subscriber Portal & Login Gateway
                </p>
              </div>
              <p className="text-gray-300 mt-1">
                Direct access to Excitel Selfcare Login (<code className="text-orange-300 font-mono">my.excitel.com</code>), account bill payment, high-speed test, and support.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                onClick={() => setShowExcitelModal(!showExcitelModal)}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center gap-1.5 transition-all border border-white/10"
              >
                <Key className="w-3.5 h-3.5 text-amber-400" />
                {showExcitelModal ? 'Hide Credentials Vault' : 'Quick Login Vault'}
              </button>
              <button
                onClick={() => handleLaunchExcitelPortal('https://my.excitel.com/login')}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-orange-500/20"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Launch Excitel Login Page
              </button>
            </div>
          </div>

          {/* Quick Link Buttons for Excitel Services */}
          <div className="pt-2 border-t border-orange-500/20 flex items-center gap-2 flex-wrap text-[11px]">
            <span className="text-gray-400 font-semibold">Excitel Quick Links:</span>
            <button
              onClick={() => handleLaunchExcitelPortal('https://my.excitel.com/login')}
              className="px-2.5 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/20 flex items-center gap-1 font-medium transition-all"
            >
              My Excitel Portal <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleLaunchExcitelPortal('https://my.excitel.com/pay')}
              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 flex items-center gap-1 font-medium transition-all"
            >
              Quick Bill Pay & Renewal <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleLaunchExcitelPortal('https://www.excitel.com/speedtest/')}
              className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/20 flex items-center gap-1 font-medium transition-all"
            >
              Excitel Speed Test <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleLaunchExcitelPortal('https://my.excitel.com/support')}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 flex items-center gap-1 font-medium transition-all"
            >
              Customer Support & Tickets <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Credentials Vault Box (Expandable) */}
          {showExcitelModal && (
            <div className="pt-3 border-t border-orange-500/20 bg-black/40 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                  <Lock className="w-3.5 h-3.5" /> Excitel Saved Account Credentials (Stored Locally)
                </h4>
                <span className="text-[10px] text-gray-400">Auto-saved in browser storage</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1 font-medium">
                    Excitel User ID / Mobile Number
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={excitelUser}
                      onChange={(e) => {
                        setExcitelUser(e.target.value);
                        saveExcitelCreds();
                      }}
                      placeholder="e.g. 9876543210 or EX123456"
                      className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-orange-400"
                    />
                    <button
                      onClick={() => handleCopy(excitelUser, 'user')}
                      className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-mono text-[11px] shrink-0 transition-all border border-white/10"
                    >
                      {copiedField === 'user' ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1 font-medium">
                    Excitel Account Password
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      value={excitelPass}
                      onChange={(e) => {
                        setExcitelPass(e.target.value);
                        saveExcitelCreds();
                      }}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-orange-400"
                    />
                    <button
                      onClick={() => handleCopy(excitelPass, 'pass')}
                      className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-mono text-[11px] shrink-0 transition-all border border-white/10"
                    >
                      {copiedField === 'pass' ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <p className="text-[10px] text-gray-400">
                  Clicking <strong>Launch Excitel Login Page</strong> opens <code className="text-orange-300">my.excitel.com/login</code> so you can instantly log in.
                </p>
                <button
                  onClick={() => handleLaunchExcitelPortal('https://my.excitel.com/login')}
                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs font-bold hover:from-orange-500 hover:to-amber-500 transition-all shadow-md shadow-orange-600/20 flex items-center gap-1"
                >
                  Launch & Login Now <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Router Quick Access Banner */}
      {showRouterBanner && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/40 to-slate-900/40 border border-emerald-500/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-bold text-white flex items-center gap-1.5 text-sm">
              <Lock className="w-4 h-4 text-emerald-400" /> Titanium Router Admin Gateway (192.168.1.1)
            </p>
            <p className="text-gray-300">
              Default Gateway: <strong className="text-emerald-300 font-mono">http://192.168.1.1</strong> &nbsp;|&nbsp;
              Username: <strong className="text-white font-mono">admin</strong> &nbsp;|&nbsp;
              Sticker Password: <strong className="text-emerald-300 font-mono">•••••••• (Refer to Router Label)</strong>
            </p>
          </div>
          <button
            onClick={handleOpenRouterAdmin}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Key className="w-3.5 h-3.5" /> Open Router Admin Page <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Speed & Wi-Fi Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Download Speed */}
        <div className="glass-panel p-4 border border-white/10 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" /> Download Throughput
            </p>
            <p className="text-xl font-bold text-white mt-1">
              {speed ? formatKB(speed.rx_bytes_per_sec) : '0 KB/s'}
            </p>
          </div>
          <Activity className="w-8 h-8 text-emerald-400/80" />
        </div>

        {/* Upload Speed */}
        <div className="glass-panel p-4 border border-white/10 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-sky-400" /> Upload Throughput
            </p>
            <p className="text-xl font-bold text-white mt-1">
              {speed ? formatKB(speed.tx_bytes_per_sec) : '0 KB/s'}
            </p>
          </div>
          <Radio className="w-8 h-8 text-sky-400/80" />
        </div>

        {/* Wi-Fi Signal Strength */}
        <div className="glass-panel p-4 border border-white/10 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Wi-Fi Signal</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">
              {wifi ? `${wifi.signal_percent}%` : hasRunTests ? 'N/A' : '--'}
            </p>
          </div>
          <Wifi className="w-8 h-8 text-emerald-400/80" />
        </div>

        {/* Wi-Fi Security Rating */}
        <div className="glass-panel p-4 border border-white/10 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Encryption Type</p>
            <p className="text-sm font-bold text-white mt-1">
              {wifi ? wifi.security_type : hasRunTests ? 'Unknown' : 'Not Tested'}
            </p>
          </div>
          <ShieldCheck className="w-8 h-8 text-blue-400/80" />
        </div>
      </div>

      {/* Ping Latency & Open Ports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ping Latency Cards */}
        <div className="glass-panel p-5 border border-white/10 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-400" /> DNS Ping & Latency Tester
            </h3>
            {!hasRunTests && (
              <button
                onClick={runNetworkTests}
                disabled={isLoading}
                className="px-3 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-semibold border border-sky-500/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} /> Run Test
              </button>
            )}
          </div>
          {pings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pings.map((ping, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-white">{ping.label}</p>
                    <p className="text-[11px] text-gray-400">{ping.host}</p>
                  </div>
                  <div className="text-right">
                    {ping.latency_ms !== null ? (
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {ping.latency_ms} ms
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-rose-400">Timeout</span>
                    )}
                    <p className="text-[10px] text-gray-400">{ping.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center space-y-3">
              <p className="text-xs text-gray-400">
                {isLoading
                  ? 'Pinging DNS targets in background...'
                  : 'Manual test required. Click "Run Tests" or "Refresh Tests" to measure host latencies.'}
              </p>
              {!isLoading && (
                <button
                  onClick={runNetworkTests}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
                >
                  Run Ping Test Now
                </button>
              )}
            </div>
          )}
        </div>

        {/* Open Localhost Ports */}
        <div className="glass-panel p-5 border border-white/10 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400" /> Localhost Open Ports Scanner
            </h3>
            {!hasRunTests && (
              <button
                onClick={runNetworkTests}
                disabled={isLoading}
                className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} /> Scan Ports
              </button>
            )}
          </div>
          {ports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-gray-400 border-b border-white/10">
                  <tr>
                    <th className="pb-2">Port</th>
                    <th className="pb-2">Service</th>
                    <th className="pb-2">Protocol</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ports.map((portItem, idx) => (
                    <tr key={idx} className="hover:bg-white/5">
                      <td className="py-2 font-mono text-blue-400 font-bold">{portItem.port}</td>
                      <td className="py-2 text-white">{portItem.service}</td>
                      <td className="py-2 text-gray-400">{portItem.protocol}</td>
                      <td className="py-2 text-right">
                        {portItem.is_listening ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                            LISTENING
                          </span>
                        ) : (
                          <span className="text-gray-500 text-[11px]">Closed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center space-y-3">
              <p className="text-xs text-gray-400">
                {isLoading
                  ? 'Scanning localhost ports in background...'
                  : 'Manual scan required. Click "Run Tests" or "Refresh Tests" to audit open local ports.'}
              </p>
              {!isLoading && (
                <button
                  onClick={runNetworkTests}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
                >
                  Scan Ports Now
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
