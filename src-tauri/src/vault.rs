use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VaultEntry {
    pub id: String,
    pub title: String,
    pub username: String,
    pub password_encrypted: String,
    pub website: String,
    pub category: String, // "Logins", "Cards", "Notes"
    pub notes: String,
    pub updated_at: String,
}

#[allow(dead_code)]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VaultState {
    pub is_unlocked: bool,
    pub entries: Vec<VaultEntry>,
}

fn get_vault_path() -> PathBuf {
    let mut path = std::env::temp_dir();
    path.push("orion_vault.json");
    path
}

fn derive_simple_key(password: &str) -> String {
    let mut hash: u64 = 5381;
    for &byte in password.as_bytes().iter().chain(b"orion_salt_2026") {
        hash = ((hash << 5).wrapping_add(hash)).wrapping_add(byte as u64);
    }
    format!("{:016x}{:016x}", hash, hash.rotate_left(13))
}

fn hex_encode(bytes: &[u8]) -> String {
    bytes.iter().map(|b| format!("{:02x}", b)).collect()
}

fn hex_decode(hex_str: &str) -> Result<Vec<u8>, String> {
    if hex_str.len() % 2 != 0 {
        return Err("Invalid hex length".to_string());
    }
    (0..hex_str.len())
        .step_by(2)
        .map(|i| u8::from_str_radix(&hex_str[i..i + 2], 16).map_err(|e| e.to_string()))
        .collect()
}

fn xor_encrypt_decrypt(data: &str, key: &str) -> String {
    let key_bytes = key.as_bytes();
    let data_bytes = data.as_bytes();
    let mut result = Vec::with_capacity(data_bytes.len());

    for (i, &b) in data_bytes.iter().enumerate() {
        result.push(b ^ key_bytes[i % key_bytes.len()]);
    }
    hex_encode(&result)
}

fn xor_decrypt_hex(hex_str: &str, key: &str) -> Result<String, String> {
    let bytes = hex_decode(hex_str)?;
    let key_bytes = key.as_bytes();
    let mut result = Vec::with_capacity(bytes.len());

    for (i, &b) in bytes.iter().enumerate() {
        result.push(b ^ key_bytes[i % key_bytes.len()]);
    }
    String::from_utf8(result).map_err(|e| e.to_string())
}

pub fn unlock_orion_vault(master_password: &str) -> Result<Vec<VaultEntry>, String> {
    if master_password.trim().is_empty() {
        return Err("Master password cannot be empty".to_string());
    }

    let key = derive_simple_key(master_password);
    let path = get_vault_path();

    if !path.exists() {
        return Ok(Vec::new());
    }

    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let entries: Vec<VaultEntry> = serde_json::from_str(&content).map_err(|e| e.to_string())?;
    decrypt_vault_entries(&entries, &key)
}

fn decrypt_vault_entries(entries: &[VaultEntry], key: &str) -> Result<Vec<VaultEntry>, String> {
    let mut decrypted = Vec::new();
    for entry in entries {
        let plain_pass = xor_decrypt_hex(&entry.password_encrypted, key).unwrap_or_else(|_| "••••••••".to_string());
        let mut e = entry.clone();
        e.password_encrypted = plain_pass;
        decrypted.push(e);
    }
    Ok(decrypted)
}

fn save_vault_to_file(entries: &[VaultEntry]) -> Result<(), String> {
    let path = get_vault_path();
    let content = serde_json::to_string_pretty(entries).map_err(|e| e.to_string())?;
    fs::write(path, content).map_err(|e| e.to_string())
}

pub fn save_new_vault_entry(master_password: &str, mut entry: VaultEntry) -> Result<Vec<VaultEntry>, String> {
    let key = derive_simple_key(master_password);
    entry.password_encrypted = xor_encrypt_decrypt(&entry.password_encrypted, &key);
    entry.updated_at = chrono::Local::now().format("%Y-%m-%d %H:%M").to_string();

    let path = get_vault_path();
    let mut entries: Vec<VaultEntry> = if path.exists() {
        let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        Vec::new()
    };

    entries.retain(|e| e.id != entry.id);
    entries.push(entry);
    save_vault_to_file(&entries)?;

    decrypt_vault_entries(&entries, &key)
}

pub fn delete_vault_entry(master_password: &str, id: &str) -> Result<Vec<VaultEntry>, String> {
    let key = derive_simple_key(master_password);
    let path = get_vault_path();
    if !path.exists() {
        return Ok(Vec::new());
    }

    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let mut entries: Vec<VaultEntry> = serde_json::from_str(&content).unwrap_or_default();
    entries.retain(|e| e.id != id);
    save_vault_to_file(&entries)?;

    decrypt_vault_entries(&entries, &key)
}

pub fn generate_random_password(length: usize, include_symbols: bool) -> String {
    let charset: Vec<char> = if include_symbols {
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?".chars().collect()
    } else {
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".chars().collect()
    };

    let len = length.clamp(8, 64);
    let mut seed = chrono::Local::now().timestamp_nanos_opt().unwrap_or(123456789) as u64;

    (0..len)
        .map(|_| {
            seed = seed.wrapping_mul(6364136223846793005).wrapping_add(1442695040888963407);
            let idx = (seed as usize) % charset.len();
            charset[idx]
        })
        .collect()
}
