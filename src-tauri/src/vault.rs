use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use argon2::{Argon2, Params};
use rand::{distributions::Alphanumeric, Rng};
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
    let base_dir = dirs::data_dir().unwrap_or_else(std::env::temp_dir);
    let app_dir = base_dir.join("OrionPlatform");
    let _ = fs::create_dir_all(&app_dir);
    app_dir.join("orion_vault.json")
}

const SALT: &[u8] = b"orion_argon2id_salt_2026";

/// Derives a 256-bit (32-byte) cryptographic key from master password using Argon2id
fn derive_aes_key(password: &str) -> Result<[u8; 32], String> {
    let params = Params::new(19456, 2, 1, Some(32)).map_err(|e| e.to_string())?;
    let argon2 = Argon2::new(argon2::Algorithm::Argon2id, argon2::Version::V0x13, params);

    let mut key = [0u8; 32];
    argon2
        .hash_password_into(password.as_bytes(), SALT, &mut key)
        .map_err(|e| format!("Key derivation failed: {}", e))?;
    Ok(key)
}

fn hex_encode(bytes: &[u8]) -> String {
    bytes.iter().map(|b| format!("{:02x}", b)).collect()
}

fn hex_decode(hex_str: &str) -> Result<Vec<u8>, String> {
    if !hex_str.len().is_multiple_of(2) {
        return Err("Invalid hex string length".to_string());
    }
    (0..hex_str.len())
        .step_by(2)
        .map(|i| u8::from_str_radix(&hex_str[i..i + 2], 16).map_err(|e| e.to_string()))
        .collect()
}

/// AES-256-GCM Authenticated Encryption
fn aes_encrypt(plaintext: &str, key_bytes: &[u8; 32]) -> Result<String, String> {
    let cipher = Aes256Gcm::new_from_slice(key_bytes).map_err(|e| e.to_string())?;
    let mut nonce_bytes = [0u8; 12];
    rand::thread_rng().fill(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher
        .encrypt(nonce, plaintext.as_bytes())
        .map_err(|e| format!("Encryption failed: {}", e))?;

    // Store formatted as nonce_hex:ciphertext_hex
    Ok(format!("{}:{}", hex_encode(&nonce_bytes), hex_encode(&ciphertext)))
}

/// AES-256-GCM Authenticated Decryption
fn aes_decrypt(encrypted_payload: &str, key_bytes: &[u8; 32]) -> Result<String, String> {
    let parts: Vec<&str> = encrypted_payload.split(':').collect();
    if parts.len() != 2 {
        return Err("Invalid encrypted format".to_string());
    }

    let nonce_bytes = hex_decode(parts[0])?;
    let ciphertext = hex_decode(parts[1])?;

    if nonce_bytes.len() != 12 {
        return Err("Invalid nonce length".to_string());
    }

    let cipher = Aes256Gcm::new_from_slice(key_bytes).map_err(|e| e.to_string())?;
    let nonce = Nonce::from_slice(&nonce_bytes);

    let plaintext_bytes = cipher
        .decrypt(nonce, ciphertext.as_ref())
        .map_err(|_| "Decryption failed (invalid key or corrupted data)".to_string())?;

    String::from_utf8(plaintext_bytes).map_err(|e| e.to_string())
}

pub fn unlock_orion_vault(master_password: &str) -> Result<Vec<VaultEntry>, String> {
    if master_password.trim().is_empty() {
        return Err("Master password cannot be empty".to_string());
    }

    let key = derive_aes_key(master_password)?;
    let path = get_vault_path();

    if !path.exists() {
        return Ok(Vec::new());
    }

    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let entries: Vec<VaultEntry> = serde_json::from_str(&content).map_err(|e| e.to_string())?;
    decrypt_vault_entries(&entries, &key)
}

fn decrypt_vault_entries(entries: &[VaultEntry], key: &[u8; 32]) -> Result<Vec<VaultEntry>, String> {
    let mut decrypted = Vec::new();
    for entry in entries {
        let plain_pass = aes_decrypt(&entry.password_encrypted, key).unwrap_or_else(|_| "••••••••".to_string());
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
    if master_password.trim().is_empty() {
        return Err("Master password cannot be empty".to_string());
    }

    let key = derive_aes_key(master_password)?;
    entry.password_encrypted = aes_encrypt(&entry.password_encrypted, &key)?;
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
    if master_password.trim().is_empty() {
        return Err("Master password cannot be empty".to_string());
    }

    let key = derive_aes_key(master_password)?;
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

/// Cryptographically Secure Password Generator (CSPRNG)
pub fn generate_random_password(length: usize, include_symbols: bool) -> String {
    let len = length.clamp(8, 64);
    let symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    let mut rng = rand::thread_rng();

    if include_symbols {
        let alphanumeric: String = (0..len)
            .map(|_| rng.sample(Alphanumeric) as char)
            .collect();
        let mut chars: Vec<char> = alphanumeric.chars().collect();

        // Ensure at least 2 random symbols are inserted securely
        for _ in 0..2 {
            let idx = rng.gen_range(0..chars.len());
            let sym_idx = rng.gen_range(0..symbols.len());
            chars[idx] = symbols.chars().nth(sym_idx).unwrap_or('!');
        }
        chars.into_iter().collect()
    } else {
        (0..len)
            .map(|_| rng.sample(Alphanumeric) as char)
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_aes_encrypt_decrypt() {
        let master = "SuperSecretPass123!";
        let key = derive_aes_key(master).expect("Key derivation failed");
        let secret = "MyBankPassword99$";

        let encrypted = aes_encrypt(secret, &key).expect("Encryption failed");
        assert_ne!(secret, encrypted);

        let decrypted = aes_decrypt(&encrypted, &key).expect("Decryption failed");
        assert_eq!(secret, decrypted);
    }

    #[test]
    fn test_invalid_key_decryption_fails() {
        let key1 = derive_aes_key("Password123").unwrap();
        let key2 = derive_aes_key("WrongPassword").unwrap();

        let encrypted = aes_encrypt("SecretData", &key1).unwrap();
        let result = aes_decrypt(&encrypted, &key2);
        assert!(result.is_err());
    }

    #[test]
    fn test_csprng_password_generation() {
        let pass1 = generate_random_password(16, true);
        let pass2 = generate_random_password(16, true);

        assert_eq!(pass1.len(), 16);
        assert_eq!(pass2.len(), 16);
        assert_ne!(pass1, pass2);
    }
}
