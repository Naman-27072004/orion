import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { FullSystemTelemetry, InsightItem, PredictionForecast, TimelineEvent } from './types/orion';
import { Sidebar } from './components/Sidebar';
import { CommandPaletteModal } from './components/CommandPaletteModal';

import { DashboardView } from './views/DashboardView';
import { LiveMonitorView } from './views/LiveMonitorView';
import { BatteryGuardianView } from './views/BatteryGuardianView';
import { StorageIntelView } from './views/StorageIntelView';
import { PerformanceView } from './views/PerformanceView';
import { WindowsControlView } from './views/WindowsControlView';
import { DellCompanionView } from './views/DellCompanionView';
import { SecurityView } from './views/SecurityView';
import { TimelineView } from './views/TimelineView';
import { DeveloperModeView } from './views/DeveloperModeView';

import { ProcessManagerView } from './views/ProcessManagerView';
import { NetworkIntelView } from './views/NetworkIntelView';
import { StorageCleanerView } from './views/StorageCleanerView';
import { DiagnosticsView } from './views/DiagnosticsView';
import { ProductivityToolsView } from './views/ProductivityToolsView';
import { AiAssistantView } from './views/AiAssistantView';
import { PasswordVaultView } from './views/PasswordVaultView';
import { VpnTunnelView } from './views/VpnTunnelView';
import { SettingsView } from './views/SettingsView';

export function App() {
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const [telemetry, setTelemetry] = useState<FullSystemTelemetry | null>(null);
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [predictions, setPredictions] = useState<PredictionForecast | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  // Hardware Detection & Feature Toggles
  const isDellHardware = telemetry?.dell?.manufacturer ? telemetry.dell.manufacturer.toLowerCase().includes('dell') : false;

  const [showDellCompanion, setShowDellCompanion] = useState(() => {
    const saved = localStorage.getItem('orion_setting_dell_companion');
    return saved === null ? true : saved === 'true';
  });

  const [showExcitelPortal, setShowExcitelPortal] = useState(() => {
    return localStorage.getItem('orion_setting_excitel') === 'true';
  });

  const [showRouterBanner, setShowRouterBanner] = useState(() => {
    return localStorage.getItem('orion_setting_router_banner') === 'true';
  });

  useEffect(() => {
    // Keyboard shortcut Ctrl+K or Cmd+K to open Command Palette
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Initial fetches
    invoke<InsightItem[]>('get_insights').then(setInsights).catch(console.error);
    invoke<PredictionForecast>('get_predictions').then(setPredictions).catch(console.error);
    invoke<TimelineEvent[]>('get_timeline').then(setTimeline).catch(console.error);

    // Live telemetry interval (1000ms)
    const fetchTelemetry = () => {
      invoke<FullSystemTelemetry>('get_telemetry')
        .then((data) => setTelemetry(data))
        .catch(console.error);
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 1000);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(interval);
    };
  }, []);

  const renderModuleView = () => {
    switch (currentModule) {
      case 'dashboard':
        return <DashboardView telemetry={telemetry} insights={insights} timeline={timeline} />;
      case 'password-vault':
        return <PasswordVaultView />;
      case 'vpn-tunnel':
        return <VpnTunnelView />;
      case 'ai-assistant':
        return <AiAssistantView />;
      case 'process-mgr':
        return <ProcessManagerView />;
      case 'network-intel':
        return <NetworkIntelView showExcitelPortal={showExcitelPortal} showRouterBanner={showRouterBanner} />;
      case 'storage-cleaner':
        return <StorageCleanerView storage={telemetry?.storage || null} />;
      case 'diagnostics':
        return <DiagnosticsView telemetry={telemetry} />;
      case 'productivity-tools':
        return <ProductivityToolsView />;
      case 'live-monitor':
        return <LiveMonitorView telemetry={telemetry} />;
      case 'battery':
        return <BatteryGuardianView battery={telemetry?.battery || null} prediction={predictions} />;
      case 'storage':
        return <StorageIntelView storage={telemetry?.storage || null} prediction={predictions} />;
      case 'performance':
        return <PerformanceView telemetry={telemetry} />;
      case 'windows-control':
        return <WindowsControlView />;
      case 'dell-companion':
        return isDellHardware ? <DellCompanionView dell={telemetry?.dell || null} /> : <DashboardView telemetry={telemetry} insights={insights} timeline={timeline} />;
      case 'security':
        return <SecurityView security={telemetry?.security || null} />;
      case 'timeline':
        return <TimelineView timeline={timeline} />;
      case 'settings':
        return (
          <SettingsView
            dell={telemetry?.dell || null}
            showDellCompanion={showDellCompanion}
            setShowDellCompanion={setShowDellCompanion}
            showExcitelPortal={showExcitelPortal}
            setShowExcitelPortal={setShowExcitelPortal}
            showRouterBanner={showRouterBanner}
            setShowRouterBanner={setShowRouterBanner}
          />
        );
      case 'dev-mode':
        return <DeveloperModeView />;
      default:
        return <DashboardView telemetry={telemetry} insights={insights} timeline={timeline} />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0d14] text-white antialiased">
      {/* Navigation Sidebar */}
      <Sidebar
        currentModule={currentModule}
        setCurrentModule={setCurrentModule}
        openCommandPalette={() => setIsCommandPaletteOpen(true)}
        archLabel={
          telemetry?.dell?.processor_architecture
            ? telemetry.dell.processor_architecture.replace('Windows (', '').replace(')', '').trim()
            : undefined
        }
        isDellHardware={isDellHardware}
        showDellCompanion={showDellCompanion}
      />

      {/* Main View Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {renderModuleView()}
        </div>
      </main>

      {/* Command Palette Modal */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectModule={setCurrentModule}
      />
    </div>
  );
}

export default App;
