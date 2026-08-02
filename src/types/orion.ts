export interface CpuCoreInfo {
  core_id: number;
  name: string;
  usage: number;
  frequency: number;
}

export interface CpuTelemetry {
  name: string;
  brand: string;
  cores_count: number;
  threads_count: number;
  total_usage: number;
  cores: CpuCoreInfo[];
}

export interface RamTelemetry {
  total_bytes: number;
  used_bytes: number;
  free_bytes: number;
  usage_percentage: number;
  speed_mhz: number;
  ram_type: string;
}

export interface StorageTelemetry {
  model: string;
  total_bytes: number;
  available_bytes: number;
  used_bytes: number;
  usage_percentage: number;
  drive_letter: string;
  file_system: string;
  is_ssd: boolean;
  health_status: string;
}

export interface BatteryTelemetry {
  charge_percentage: number;
  is_charging: boolean;
  power_line_status: string;
  design_capacity_wh: number;
  full_charge_capacity_wh: number;
  battery_wear_percentage: number;
  estimated_runtime_minutes: number;
  discharge_rate_watts: number;
}

export interface DellDeviceInfo {
  manufacturer: string;
  model: string;
  service_tag: string;
  bios_version: string;
  processor_architecture: string;
}

export interface SecurityStatus {
  bitlocker_enabled: boolean;
  secure_boot_enabled: boolean;
  tpm_version: string;
  defender_active: boolean;
}

export interface GpuTelemetry {
  name: string;
  vendor: string;
  vram_total_mb: number;
  vram_used_mb: number;
  load_percentage: number;
  temperature_c: number;
  status: string;
}

export interface FullSystemTelemetry {
  timestamp: string;
  health_score: number;
  cpu: CpuTelemetry;
  ram: RamTelemetry;
  storage: StorageTelemetry;
  battery: BatteryTelemetry;
  dell: DellDeviceInfo;
  security: SecurityStatus;
  gpu?: GpuTelemetry;
}

export interface TimelineEvent {
  id: number;
  timestamp: string;
  event_type: string;
  title: string;
  description: string;
  severity: "INFO" | "GOOD" | "WARNING" | "CRITICAL";
}

export interface InsightItem {
  category: string;
  title: string;
  description: string;
  recommendation: string;
  impact_level: "HIGH" | "MEDIUM" | "LOW" | "OPTIMAL";
}

export interface PredictionForecast {
  battery_health_1yr_pct: number;
  battery_health_3yr_pct: number;
  storage_days_until_90pct: number;
  storage_days_until_full: number;
  estimated_daily_discharge_wh: number;
}

// New Types for 48 Features
export interface ProcessItem {
  pid: number;
  name: string;
  cpu_usage: number;
  memory_bytes: number;
  energy_impact: "High" | "Medium" | "Low";
  is_protected: boolean;
  status: string;
}

export interface NetworkSpeed {
  rx_bytes_per_sec: number;
  tx_bytes_per_sec: number;
  active_interface: string;
}

export interface PingResult {
  host: string;
  label: string;
  latency_ms: number | null;
  status: string;
}

export interface OpenPortItem {
  port: number;
  service: string;
  protocol: string;
  is_listening: boolean;
}

export interface WifiAudit {
  ssid: string;
  signal_percent: number;
  security_type: string;
  channel: number;
  status: string;
}

export interface JunkCategory {
  name: string;
  path_description: string;
  size_bytes: number;
  file_count: number;
  safe_to_clean: boolean;
}

export interface JunkScanSummary {
  total_junk_bytes: number;
  categories: JunkCategory[];
}

export interface FileHashResult {
  file_name: string;
  size_bytes: number;
  md5_hash: string;
  sha256_hash: string;
}

export interface StartupAppItem {
  name: string;
  publisher: string;
  impact: string;
  is_enabled: boolean;
}

export interface SystemReport {
  os_name: string;
  cpu_model: string;
  total_ram_gb: number;
  storage_space_gb: number;
  uptime_formatted: string;
  health_score: number;
}

export interface FolderSizeItem {
  name: string;
  path: string;
  size_bytes: number;
}

export interface StorageAllocationBreakdown {
  windows_system_apps_total_bytes: number;
  user_downloads_media_total_bytes: number;
  temp_junk_total_bytes: number;
  free_bytes: number;
  total_bytes: number;
  system_folders: FolderSizeItem[];
  user_folders: FolderSizeItem[];
}

export interface VirusTotalResult {
  file_name: string;
  sha256: string;
  virustotal_url: string;
  status: string;
  engines_flagged: number;
  total_engines: number;
}

export interface DefenderScanStatus {
  is_scanning: boolean;
  scan_type: string;
  last_quick_scan_end?: string | null;
  last_full_scan_end?: string | null;
  message: string;
}


export interface AiResponse {
  response: string;
  source: string;
}

export interface VaultEntry {
  id: string;
  title: string;
  username: string;
  password_encrypted: string;
  website: string;
  category: string;
  notes: string;
  updated_at: string;
}

export interface VpnServerLocation {
  code: string;
  name: string;
  flag: string;
  virtual_ip: string;
  ping_ms: number;
  region: string;
}

export interface VpnStatus {
  is_connected: boolean;
  virtual_ip: string;
  server_location: string;
  country_code: string;
  protocol: string;
  ping_ms: number;
  bytes_received_mb: number;
  bytes_sent_mb: number;
  dns_leak_status: string;
  public_ip_masked: boolean;
  session_uptime_secs: number;
  auto_reconnect: boolean;
  kill_switch_enabled: boolean;
  warp_installed?: boolean;
}
