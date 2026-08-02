mod telemetry;
mod db;
mod analytics;
mod processes;
mod network_intel;
mod cleaner;
mod tools;
mod vault;
mod vpn;

use telemetry::{collect_telemetry, FullSystemTelemetry, TelemetryState};
use db::{DatabaseState, TimelineEvent};
use analytics::{generate_insights, generate_predictions, InsightItem, PredictionForecast};
use processes::{get_processes_list, kill_process_by_pid, set_process_priority, trim_ram_working_set, ProcessItem};
use network_intel::{get_network_speeds, get_wifi_audit, ping_targets, scan_local_ports, NetworkSpeed, OpenPortItem, PingResult, WifiAudit};
use cleaner::{get_storage_allocation_breakdown, purge_user_temp, scan_junk_files, JunkScanSummary, StorageAllocationBreakdown};
use tools::{
    calculate_file_hash, generate_system_report, get_current_power_mode, get_defender_status,
    get_startup_apps, launch_windows_tool, query_local_ai, scan_virustotal_hash, set_power_mode,
    set_startup_app_state, trigger_defender_scan, AiResponse, DefenderScanStatus, FileHashResult,
    StartupAppItem, SystemReport, VirusTotalResult,
};
use vault::{
    delete_vault_entry, generate_random_password, save_new_vault_entry, unlock_orion_vault,
    VaultEntry,
};
use vpn::{
    get_available_countries, get_orion_vpn_status, launch_warp_download, run_ip_dns_leak_audit,
    set_vpn_options, toggle_vpn_connection, VpnServerLocation, VpnStatus,
};
use tauri::State;

struct AppState {
    telemetry: TelemetryState,
    db: DatabaseState,
}

#[tauri::command]
fn get_telemetry(state: State<'_, AppState>) -> FullSystemTelemetry {
    let telemetry = collect_telemetry(&state.telemetry);
    let _ = state.db.log_telemetry(
        telemetry.cpu.total_usage,
        telemetry.ram.usage_percentage,
        telemetry.battery.charge_percentage,
        telemetry.battery.is_charging,
        telemetry.storage.usage_percentage,
        telemetry.health_score,
    );
    telemetry
}

#[tauri::command]
fn get_timeline(state: State<'_, AppState>) -> Result<Vec<TimelineEvent>, String> {
    state.db.get_timeline_events().map_err(|e| e.to_string())
}

#[tauri::command]
fn get_insights() -> Vec<InsightItem> {
    generate_insights()
}

#[tauri::command]
fn get_predictions() -> PredictionForecast {
    generate_predictions()
}

#[tauri::command]
fn launch_settings_uri(uri: String) -> Result<(), String> {
    open::that(uri).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_processes() -> Vec<ProcessItem> {
    get_processes_list()
}

#[tauri::command]
fn kill_process(pid: u32) -> Result<String, String> {
    kill_process_by_pid(pid)
}

#[tauri::command]
fn trim_ram() -> Result<String, String> {
    trim_ram_working_set()
}

#[tauri::command]
fn set_priority(pid: u32, priority: String) -> Result<String, String> {
    set_process_priority(pid, &priority)
}

#[tauri::command]
fn get_network_info() -> NetworkSpeed {
    get_network_speeds()
}

#[tauri::command]
fn get_ping_info() -> Vec<PingResult> {
    ping_targets()
}

#[tauri::command]
fn get_open_ports() -> Vec<OpenPortItem> {
    scan_local_ports()
}

#[tauri::command]
fn get_wifi_details() -> WifiAudit {
    get_wifi_audit()
}

#[tauri::command]
async fn get_junk_summary() -> Result<JunkScanSummary, String> {
    tokio::task::spawn_blocking(|| {
        scan_junk_files()
    })
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
fn clean_temp_junk() -> Result<String, String> {
    purge_user_temp()
}

#[tauri::command]
async fn get_storage_breakdown() -> Result<StorageAllocationBreakdown, String> {
    tokio::task::spawn_blocking(|| {
        get_storage_allocation_breakdown()
    })
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
fn hash_file(file_path: String) -> Result<FileHashResult, String> {
    calculate_file_hash(&file_path)
}

#[tauri::command]
fn scan_virustotal(file_path: String) -> Result<VirusTotalResult, String> {
    scan_virustotal_hash(&file_path)
}

#[tauri::command]
fn get_startups() -> Vec<StartupAppItem> {
    get_startup_apps()
}

#[tauri::command]
fn toggle_startup(name: String, enabled: bool) -> Result<String, String> {
    set_startup_app_state(&name, enabled)
}

#[tauri::command]
fn get_system_report_data() -> SystemReport {
    generate_system_report()
}

#[tauri::command]
fn launch_tool(tool: String) -> Result<String, String> {
    launch_windows_tool(&tool)
}

#[tauri::command]
fn get_defender_scan_status() -> DefenderScanStatus {
    get_defender_status()
}

#[tauri::command]
fn get_power_mode() -> String {
    get_current_power_mode()
}

#[tauri::command]
fn run_defender_scan(scan_type: String) -> Result<String, String> {
    trigger_defender_scan(&scan_type)
}

#[tauri::command]
fn change_power_mode(mode: String) -> Result<String, String> {
    set_power_mode(&mode)
}

#[tauri::command]
fn ask_ai_assistant(prompt: String) -> AiResponse {
    query_local_ai(&prompt)
}

// Vault IPC Commands
#[tauri::command]
fn unlock_vault(master_pass: String) -> Result<Vec<VaultEntry>, String> {
    unlock_orion_vault(&master_pass)
}

#[tauri::command]
fn save_vault_item(master_pass: String, item: VaultEntry) -> Result<Vec<VaultEntry>, String> {
    save_new_vault_entry(&master_pass, item)
}

#[tauri::command]
fn delete_vault_item(master_pass: String, id: String) -> Result<Vec<VaultEntry>, String> {
    delete_vault_entry(&master_pass, &id)
}

#[tauri::command]
fn generate_password(length: usize, include_symbols: bool) -> String {
    generate_random_password(length, include_symbols)
}

// VPN IPC Commands
#[tauri::command]
fn get_vpn_status() -> VpnStatus {
    get_orion_vpn_status()
}

#[tauri::command]
fn get_vpn_countries() -> Vec<VpnServerLocation> {
    get_available_countries()
}

#[tauri::command]
fn toggle_vpn(enable: bool, country: Option<String>) -> Result<VpnStatus, String> {
    toggle_vpn_connection(enable, country)
}

#[tauri::command]
fn set_vpn_config(auto_reconnect: Option<bool>, kill_switch: Option<bool>) -> Result<VpnStatus, String> {
    set_vpn_options(auto_reconnect, kill_switch)
}

#[tauri::command]
fn launch_warp_installer() -> Result<String, String> {
    launch_warp_download()
}

#[tauri::command]
fn run_vpn_leak_test() -> Result<String, String> {
    run_ip_dns_leak_audit()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let telemetry_state = TelemetryState::new();
    let db_state = DatabaseState::init().expect("Failed to initialize SQLite database");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            telemetry: telemetry_state,
            db: db_state,
        })
        .invoke_handler(tauri::generate_handler![
            get_telemetry,
            get_timeline,
            get_insights,
            get_predictions,
            launch_settings_uri,
            get_processes,
            kill_process,
            trim_ram,
            set_priority,
            get_network_info,
            get_ping_info,
            get_open_ports,
            get_wifi_details,
            get_junk_summary,
            clean_temp_junk,
            get_storage_breakdown,
            hash_file,
            scan_virustotal,
            get_startups,
            toggle_startup,
            get_system_report_data,
            launch_tool,
            run_defender_scan,
            get_defender_scan_status,
            change_power_mode,
            get_power_mode,
            ask_ai_assistant,
            unlock_vault,
            save_vault_item,
            delete_vault_item,
            generate_password,
            get_vpn_status,
            get_vpn_countries,
            toggle_vpn,
            set_vpn_config,
            launch_warp_installer,
            run_vpn_leak_test
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
