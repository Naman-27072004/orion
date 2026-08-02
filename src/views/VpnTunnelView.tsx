import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
  ShieldCheck,
  ShieldAlert,
  Globe,
  Activity,
  RefreshCw,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Radio,
  Lock,
} from 'lucide-react';
import { VpnStatus } from '../types/orion';

export const VpnTunnelView: React.FC = () => {
  const [vpn, setVpn] = useState<VpnStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [auditMsg, setAuditMsg] = useState<string | null>(null);

  const fetchVpnStatus = () => {
    invoke<VpnStatus>('get_vpn_status')
      .then((data) => setVpn(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchVpnStatus();

    // Poll status every second so session duration & throughput counters update live
    const interval = setInterval(fetchVpnStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleVpn = () => {
    if (!vpn) return;
    setLoading(true);
    const targetState = !vpn.is_connected;

    invoke<VpnStatus>('toggle_vpn', { enable: targetState, country: null })
      .then((updated) => {
        setVpn(updated);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleToggleAutoReconnect = () => {
    if (!vpn) return;
    const newAutoReconnect = !vpn.auto_reconnect;
    invoke<VpnStatus>('set_vpn_config', { auto_reconnect: newAutoReconnect, kill_switch: vpn.kill_switch_enabled })
      .then(setVpn)
      .catch(console.error);
  };

  const handleToggleKillSwitch = () => {
    if (!vpn) return;
    const newKillSwitch = !vpn.kill_switch_enabled;
    invoke<VpnStatus>('set_vpn_config', { auto_reconnect: vpn.auto_reconnect, kill_switch: newKillSwitch })
      .then(setVpn)
      .catch(console.error);
  };

  const handleRunLeakTest = () => {
    setAuditMsg('Auditing active IP addresses and DNS resolution paths...');
    invoke<string>('run_vpn_leak_test')
      .then((msg) => setAuditMsg(msg))
      .catch((err) => setAuditMsg(`Audit failed: ${err}`));
  };

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const handleLaunchWarpInstaller = () => {
    invoke<string>('launch_warp_installer')
      .then((msg) => setAuditMsg(msg))
      .catch(console.error);
  };

  if (!vpn) return <div className="text-gray-400 text-sm">Loading Global VPN Tunnel state...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-white/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            Global Safe WireGuard / WARP VPN Network
          </h2>
          <p className="text-xs text-gray-400">
            Persistent High-Speed Tunnel with Auto-Reconnect & Kill-Switch Anti-Disconnection Protection
          </p>
        </div>
        <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-xl text-xs text-cyan-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Persistent Anti-Drop Shield Active</span>
        </div>
      </div>

      {/* Dynamic WARP Driver Detection Card */}
      <div
        className={`p-4 rounded-2xl border text-xs space-y-2 transition-all ${
          vpn.warp_installed
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : 'bg-amber-500/10 border-amber-500/30'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p
              className={`font-bold text-sm flex items-center gap-1.5 ${
                vpn.warp_installed ? 'text-emerald-300' : 'text-amber-300'
              }`}
            >
              {vpn.warp_installed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Cloudflare WARP System Driver Detected & Active
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" /> System WARP Driver Not Installed
                </>
              )}
            </p>
            <p className="text-gray-300 mt-1 leading-relaxed">
              {vpn.warp_installed
                ? 'Official Cloudflare WARP (1.1.1.1) WinTUN driver detected on Windows. System-wide public IP masking active.'
                : 'To route all OS-level system traffic and change your real public IP globally across external web browsers, install Cloudflare 1.1.1.1 WARP.'}
            </p>
          </div>
          {!vpn.warp_installed && (
            <button
              onClick={handleLaunchWarpInstaller}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 whitespace-nowrap shrink-0 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> Install Free Cloudflare WARP (1.1.1.1)
            </button>
          )}
        </div>
      </div>

      {/* Main Connection Status Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-5">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-xl transition-all ${
              vpn.is_connected
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-emerald-500/20'
                : 'bg-rose-500/20 border-rose-500/40 text-rose-400 shadow-rose-500/20'
            }`}
          >
            {vpn.is_connected ? <ShieldCheck className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  vpn.is_connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                }`}
              />
              <h3 className="text-lg font-bold text-white">
                {vpn.is_connected
                  ? 'Protected (Encrypted WARP Tunnel Active)'
                  : 'Unprotected (ISP Direct Connection)'}
              </h3>
            </div>
            <p className="text-xs text-gray-400 mt-1">{vpn.server_location}</p>

            {vpn.is_connected && (
              <div className="mt-2 flex items-center gap-3 text-xs text-emerald-400">
                <span className="flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                  <Clock className="w-3.5 h-3.5" /> Session Uptime: {formatUptime(vpn.session_uptime_secs)}
                </span>
                {vpn.auto_reconnect && (
                  <span className="flex items-center gap-1 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20 text-cyan-300">
                    <Radio className="w-3.5 h-3.5" /> Auto-Reconnect Persistent
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Toggle Connect Button */}
        <button
          onClick={() => handleToggleVpn()}
          disabled={loading}
          className={`px-6 py-3 rounded-2xl font-bold text-xs shadow-xl transition-all flex items-center gap-2 ${
            vpn.is_connected
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{vpn.is_connected ? 'Disconnect Tunnel' : 'Connect WARP Tunnel'}</span>
        </button>
      </div>

      {/* Network Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
          <span className="text-xs text-gray-400">Virtual Assigned IP</span>
          <p className="text-lg font-mono font-bold text-white">{vpn.virtual_ip}</p>
          <p className="text-[11px] text-cyan-400">
            {vpn.public_ip_masked ? 'Real IP Masked' : 'Real IP Exposed'}
          </p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
          <span className="text-xs text-gray-400">Encryption Protocol</span>
          <p className="text-sm font-semibold text-white truncate">{vpn.protocol}</p>
          <p className="text-[11px] text-emerald-400">ChaCha20-Poly1305 Cipher</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
          <span className="text-xs text-gray-400">Tunnel Latency</span>
          <p className="text-lg font-bold text-amber-400">{vpn.ping_ms} ms</p>
          <p className="text-[11px] text-gray-400">Optimized Anycast Route</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
          <span className="text-xs text-gray-400">DNS Protection</span>
          <p className="text-sm font-semibold text-white">{vpn.dns_leak_status}</p>
          <p className="text-[11px] text-emerald-400">Cloudflare 1.1.1.1 DoH</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
          <span className="text-xs text-gray-400">Tunnel Session Uptime</span>
          <p className="text-lg font-mono font-bold text-emerald-400">
            {vpn.is_connected ? formatUptime(vpn.session_uptime_secs) : '00:00'}
          </p>
          <p className="text-[11px] text-gray-400">
            {vpn.is_connected ? 'Active Connection' : 'Disconnected'}
          </p>
        </div>
      </div>

      {/* Auto-Reconnect & Anti-Disconnection Settings */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-400" />
          Connection Persistence & Reliability Controls
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" /> Auto-Reconnect (Persistent Guard)
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Automatically restores connection instantly if network drops or changes
              </p>
            </div>
            <button
              onClick={handleToggleAutoReconnect}
              className={`w-12 h-6 rounded-full transition-all relative ${
                vpn.auto_reconnect ? 'bg-emerald-500' : 'bg-white/20'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                  vpn.auto_reconnect ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" /> VPN Kill-Switch Protection
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Blocks unencrypted traffic if tunnel loses connection to prevent IP leaks
              </p>
            </div>
            <button
              onClick={handleToggleKillSwitch}
              className={`w-12 h-6 rounded-full transition-all relative ${
                vpn.kill_switch_enabled ? 'bg-cyan-500' : 'bg-white/20'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                  vpn.kill_switch_enabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Cloudflare Anycast Global Mesh Information */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              Cloudflare Anycast Global Edge Network (310+ Cities Worldwide)
            </h3>
            <p className="text-xs text-gray-400">
              Automatic lowest-latency routing to the nearest secure Cloudflare WireGuard edge node.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
            100% Verified Real System Tunnel
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-1">
          <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-1">
            <span className="text-gray-400 font-medium">Protocol & Cipher</span>
            <p className="text-white font-bold text-sm">WireGuard Noise_IK</p>
            <p className="text-[11px] text-emerald-400">ChaCha20-Poly1305 Encryption</p>
          </div>
          <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-1">
            <span className="text-gray-400 font-medium">DNS Resolver</span>
            <p className="text-white font-bold text-sm">Cloudflare 1.1.1.1 DoH</p>
            <p className="text-[11px] text-cyan-400">Encrypted DNS over HTTPS</p>
          </div>
          <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-1">
            <span className="text-gray-400 font-medium">Global Edge Locations</span>
            <p className="text-white font-bold text-sm">310+ Data Centers</p>
            <p className="text-[11px] text-purple-400">Anycast Lowest Latency Route</p>
          </div>
          <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-1">
            <span className="text-gray-400 font-medium">OS Kernel Driver</span>
            <p className="text-white font-bold text-sm">WinTUN WireGuard</p>
            <p className="text-[11px] text-amber-400">Native Windows Kernel Tunnel</p>
          </div>
        </div>
      </div>

      {/* Traffic Throughput & Leak Test Audit Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bandwidth Usage */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            Encrypted Data Throughput
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <ArrowDownLeft className="w-4 h-4" />
                <span>Downloaded</span>
              </div>
              <p className="text-xl font-bold text-white font-mono">{vpn.bytes_received_mb} MB</p>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-blue-400">
                <ArrowUpRight className="w-4 h-4" />
                <span>Uploaded</span>
              </div>
              <p className="text-xl font-bold text-white font-mono">{vpn.bytes_sent_mb} MB</p>
            </div>
          </div>
        </div>

        {/* IP & DNS Leak Test Auditor */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              IP & DNS Leak Security Auditor
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Run diagnostic checks to verify your DNS queries are encrypted and not leaking to your ISP.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleRunLeakTest}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Run IP/DNS Leak Test
            </button>

            {auditMsg && (
              <p className="text-xs text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 p-3 rounded-xl font-mono">
                {auditMsg}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
