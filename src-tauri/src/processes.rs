use serde::{Deserialize, Serialize};
use sysinfo::{Pid, System};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProcessItem {
    pub pid: u32,
    pub name: String,
    pub cpu_usage: f32,
    pub memory_bytes: u64,
    pub energy_impact: String, // "High", "Medium", "Low"
    pub is_protected: bool,
    pub status: String,
}

const PROTECTED_PROCESSES: &[&str] = &[
    "system", "system idle process", "svchost.exe", "explorer.exe",
    "lsass.exe", "csrss.exe", "services.exe", "smss.exe",
    "wininit.exe", "winlogon.exe", "dwm.exe", "orion.exe",
    "spoolsv.exe", "ctfmon.exe", "taskhostw.exe"
];

pub fn get_processes_list() -> Vec<ProcessItem> {
    let mut sys = System::new_all();
    sys.refresh_all();

    let mut list: Vec<ProcessItem> = sys
        .processes()
        .iter()
        .map(|(pid, proc)| {
            let name = proc.name().to_string_lossy().to_string();
            let cpu_usage = proc.cpu_usage();
            let memory_bytes = proc.memory();
            let is_protected = PROTECTED_PROCESSES
                .iter()
                .any(|&p| p.eq_ignore_ascii_case(&name));

            let energy_impact = if cpu_usage > 15.0 || memory_bytes > 1_000_000_000 {
                "High".to_string()
            } else if cpu_usage > 4.0 || memory_bytes > 300_000_000 {
                "Medium".to_string()
            } else {
                "Low".to_string()
            };

            ProcessItem {
                pid: pid.as_u32(),
                name,
                cpu_usage,
                memory_bytes,
                energy_impact,
                is_protected,
                status: format!("{:?}", proc.status()),
            }
        })
        .collect();

    // Sort by CPU usage descending
    list.sort_by(|a, b| b.cpu_usage.partial_cmp(&a.cpu_usage).unwrap_or(std::cmp::Ordering::Equal));
    list
}

pub fn kill_process_by_pid(pid: u32) -> Result<String, String> {
    let mut sys = System::new_all();
    sys.refresh_all();
    let sys_pid = Pid::from(pid as usize);

    if let Some(proc) = sys.process(sys_pid) {
        let name = proc.name().to_string_lossy().to_string();
        if PROTECTED_PROCESSES.iter().any(|&p| p.eq_ignore_ascii_case(&name)) {
            return Err(format!("Cannot terminate protected system process '{}' (PID: {})", name, pid));
        }

        if proc.kill() {
            Ok(format!("Process '{}' (PID: {}) terminated successfully", name, pid))
        } else {
            // Fallback to taskkill on Windows
            let output = std::process::Command::new("taskkill")
                .args(&["/F", "/PID", &pid.to_string()])
                .output();
            
            match output {
                Ok(out) if out.status.success() => Ok(format!("Process '{}' (PID: {}) forced killed via taskkill", name, pid)),
                _ => Err(format!("Failed to kill process '{}' (PID: {})", name, pid)),
            }
        }
    } else {
        Err(format!("Process with PID {} not found", pid))
    }
}

pub fn trim_ram_working_set() -> Result<String, String> {
    let output = std::process::Command::new("powershell")
        .args(&[
            "-NoProfile",
            "-Command",
            "[System.GC]::Collect(); [System.GC]::WaitForPendingFinalizers(); Get-Process | ForEach-Object { try { $_.EmptyWorkingSet() } catch {} }"
        ])
        .output();

    match output {
        Ok(_) => Ok("RAM working set trimmed successfully. Released standby/cached memory.".to_string()),
        Err(e) => Err(format!("Failed to trim RAM working set: {}", e)),
    }
}

pub fn set_process_priority(pid: u32, priority: &str) -> Result<String, String> {
    let win_priority = match priority.to_lowercase().as_str() {
        "high" => "High",
        "abovenormal" | "above normal" => "AboveNormal",
        "normal" => "Normal",
        "belownormal" | "below normal" => "BelowNormal",
        "idle" | "low" => "Idle",
        _ => "Normal",
    };

    let script = format!("(Get-Process -Id {}).PriorityClass = '{}'", pid, win_priority);
    let output = std::process::Command::new("powershell")
        .args(&["-NoProfile", "-Command", &script])
        .output();

    match output {
        Ok(out) if out.status.success() => Ok(format!("PID {} priority updated to {}", pid, win_priority)),
        _ => Err(format!("Unable to update priority for PID {}", pid)),
    }
}
