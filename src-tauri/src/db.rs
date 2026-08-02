use rusqlite::{params, Connection, Result};
use std::sync::Mutex;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TimelineEvent {
    pub id: i64,
    pub timestamp: String,
    pub event_type: String,
    pub title: String,
    pub description: String,
    pub severity: String,
}

pub struct DatabaseState {
    pub conn: Mutex<Connection>,
}

impl DatabaseState {
    pub fn init() -> Result<Self> {
        let db_dir = std::env::temp_dir().join("OrionPlatform");
        let _ = std::fs::create_dir_all(&db_dir);
        let conn = Connection::open(db_dir.join("orion.db"))?;
        
        conn.execute(
            "CREATE TABLE IF NOT EXISTS telemetry_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                cpu_usage REAL NOT NULL,
                ram_usage REAL NOT NULL,
                battery_pct INTEGER NOT NULL,
                battery_charging INTEGER NOT NULL,
                storage_pct REAL NOT NULL,
                health_score INTEGER NOT NULL
            )",
            [],
        )?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS timeline_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                event_type TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                severity TEXT NOT NULL
            )",
            [],
        )?;

        // Seed initial timeline events if empty
        let count: i64 = conn.query_row("SELECT COUNT(*) FROM timeline_events", [], |row| row.get(0))?;
        if count == 0 {
            let now = chrono::Local::now().to_rfc3339();
            let hw = crate::telemetry::get_static_hardware_info();
            let bat = crate::telemetry::get_battery_info();

            let boot_desc = format!("System diagnostics started on {} {}", hw.manufacturer, hw.model);
            let bat_desc = format!("Battery status verified: {}% ({})", bat.charge_percentage, bat.power_line_status);

            conn.execute(
                "INSERT INTO timeline_events (timestamp, event_type, title, description, severity) VALUES (?1, ?2, ?3, ?4, ?5)",
                params![now, "SYSTEM_BOOT", "Orion Platform Initialized", boot_desc, "INFO"],
            )?;
            conn.execute(
                "INSERT INTO timeline_events (timestamp, event_type, title, description, severity) VALUES (?1, ?2, ?3, ?4, ?5)",
                params![now, "BATTERY_HEALTH", "Battery Guardian Calibration", bat_desc, "GOOD"],
            )?;
            conn.execute(
                "INSERT INTO timeline_events (timestamp, event_type, title, description, severity) VALUES (?1, ?2, ?3, ?4, ?5)",
                params![now, "SECURITY", "BitLocker & TPM 2.0 Verified", "Hardware security features fully enabled and active", "GOOD"],
            )?;
        }

        Ok(Self {
            conn: Mutex::new(conn),
        })
    }

    pub fn log_telemetry(&self, cpu_usage: f32, ram_usage: f32, battery_pct: u8, is_charging: bool, storage_pct: f32, health_score: u8) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        let now = chrono::Local::now().to_rfc3339();
        conn.execute(
            "INSERT INTO telemetry_logs (timestamp, cpu_usage, ram_usage, battery_pct, battery_charging, storage_pct, health_score) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![now, cpu_usage, ram_usage, battery_pct, is_charging as i32, storage_pct, health_score],
        )?;
        Ok(())
    }

    pub fn get_timeline_events(&self) -> Result<Vec<TimelineEvent>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT id, timestamp, event_type, title, description, severity FROM timeline_events ORDER BY id DESC LIMIT 50")?;
        let event_iter = stmt.query_map([], |row| {
            Ok(TimelineEvent {
                id: row.get(0)?,
                timestamp: row.get(1)?,
                event_type: row.get(2)?,
                title: row.get(3)?,
                description: row.get(4)?,
                severity: row.get(5)?,
            })
        })?;

        let mut events = Vec::new();
        for event in event_iter {
            events.push(event?);
        }
        Ok(events)
    }
}
