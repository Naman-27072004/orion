import React from 'react';
import { Settings2, Wifi, Bluetooth, Moon, BatteryCharging, Monitor, Shield, ExternalLink } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

export const WindowsControlView: React.FC = () => {
  const settingsList = [
    { title: 'Wi-Fi & Network', desc: 'Qualcomm FastConnect 7800 Wi-Fi 7 Settings', icon: Wifi, uri: 'ms-settings:network' },
    { title: 'Bluetooth & Devices', desc: 'Manage Bluetooth 5.4 accessories', icon: Bluetooth, uri: 'ms-settings:bluetooth' },
    { title: 'Display & Brightness', desc: '14" 1920x1200 FHD+ display options', icon: Monitor, uri: 'ms-settings:display' },
    { title: 'Battery Saver & Power Mode', desc: 'Snapdragon X performance & battery profiles', icon: BatteryCharging, uri: 'ms-settings:batterysaver' },
    { title: 'Night Light', desc: 'Reduce blue light emissions', icon: Moon, uri: 'ms-settings:nightlight' },
    { title: 'Windows Security', desc: 'Defender, BitLocker & TPM Status', icon: Shield, uri: 'ms-settings:windowsdefender' },
  ];

  const handleLaunch = (uri: string) => {
    invoke('launch_settings_uri', { uri }).catch(console.error);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-blue-400" />
          Windows Control Center
        </h2>
        <p className="text-xs text-gray-400">Direct Microsoft-supported launchers for Windows 11 system controls</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsList.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => handleLaunch(item.uri)}
              className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-blue-500/40 hover:bg-white/10 transition-all text-left flex items-start justify-between group"
            >
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 w-fit group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
