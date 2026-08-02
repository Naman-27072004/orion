use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct JunkCategory {
    pub name: String,
    pub path_description: String,
    pub size_bytes: u64,
    pub file_count: usize,
    pub safe_to_clean: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct JunkScanSummary {
    pub total_junk_bytes: u64,
    pub categories: Vec<JunkCategory>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FolderSizeItem {
    pub name: String,
    pub path: String,
    pub size_bytes: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StorageAllocationBreakdown {
    pub windows_system_apps_total_bytes: u64,
    pub user_downloads_media_total_bytes: u64,
    pub temp_junk_total_bytes: u64,
    pub free_bytes: u64,
    pub total_bytes: u64,
    pub system_folders: Vec<FolderSizeItem>,
    pub user_folders: Vec<FolderSizeItem>,
}

pub fn scan_junk_files() -> JunkScanSummary {
    let mut categories = Vec::new();
    let mut total_bytes = 0u64;

    // 1. User Temp Directory (%LocalAppData%\Temp)
    if let Ok(temp_dir) = std::env::var("TEMP") {
        let (size, count) = calculate_dir_stats(&temp_dir);
        total_bytes += size;
        categories.push(JunkCategory {
            name: "User Temporary Files".to_string(),
            path_description: temp_dir,
            size_bytes: size,
            file_count: count,
            safe_to_clean: true,
        });
    }

    // 2. Windows Caches / Prefetch
    let win_cache_path = r"C:\Windows\Temp";
    let (w_size, w_count) = calculate_dir_stats(win_cache_path);
    total_bytes += w_size;
    categories.push(JunkCategory {
        name: "Windows System Temp".to_string(),
        path_description: win_cache_path.to_string(),
        size_bytes: w_size,
        file_count: w_count,
        safe_to_clean: true,
    });

    // 3. Browser Cache (Chrome / Edge Cache)
    if let Ok(local_app_data) = std::env::var("LOCALAPPDATA") {
        let edge_cache = format!(r"{}\Microsoft\Edge\User Data\Default\Cache", local_app_data);
        let (e_size, e_count) = calculate_dir_stats(&edge_cache);
        total_bytes += e_size;
        categories.push(JunkCategory {
            name: "Web Browser Caches (Edge/Chrome)".to_string(),
            path_description: edge_cache,
            size_bytes: e_size,
            file_count: e_count,
            safe_to_clean: true,
        });
    }

    JunkScanSummary {
        total_junk_bytes: total_bytes,
        categories,
    }
}

pub fn purge_user_temp() -> Result<String, String> {
    let mut deleted_bytes = 0u64;
    let mut deleted_count = 0usize;

    if let Ok(temp_dir) = std::env::var("TEMP") {
        let path = PathBuf::from(&temp_dir);
        if let Ok(entries) = fs::read_dir(path) {
            for entry in entries.flatten() {
                let p = entry.path();
                if let Ok(metadata) = p.metadata() {
                    let len = metadata.len();
                    if p.is_file() {
                        if fs::remove_file(&p).is_ok() {
                            deleted_bytes += len;
                            deleted_count += 1;
                        }
                    } else if p.is_dir() {
                        if fs::remove_dir_all(&p).is_ok() {
                            deleted_bytes += len;
                            deleted_count += 1;
                        }
                    }
                }
            }
        }
    }

    Ok(format!(
        "Purged {} files ({:.2} MB freed)",
        deleted_count,
        deleted_bytes as f64 / 1_048_576.0
    ))
}

pub fn get_storage_allocation_breakdown() -> StorageAllocationBreakdown {
    // 1. Measure real system folders
    let win_size = get_folder_size_fast(r"C:\Windows");
    let pf_size = get_folder_size_fast(r"C:\Program Files");
    let pfx86_size = get_folder_size_fast(r"C:\Program Files (x86)");
    let pd_size = get_folder_size_fast(r"C:\ProgramData");

    let system_folders = vec![
        FolderSizeItem { name: "C:\\Windows".to_string(), path: r"C:\Windows".to_string(), size_bytes: win_size },
        FolderSizeItem { name: "C:\\Program Files".to_string(), path: r"C:\Program Files".to_string(), size_bytes: pf_size },
        FolderSizeItem { name: "C:\\Program Files (x86)".to_string(), path: r"C:\Program Files (x86)".to_string(), size_bytes: pfx86_size },
        FolderSizeItem { name: "C:\\ProgramData".to_string(), path: r"C:\ProgramData".to_string(), size_bytes: pd_size },
    ];
    let sys_total: u64 = system_folders.iter().map(|f| f.size_bytes).sum();

    // 2. Measure real user folders
    let user_profile = std::env::var("USERPROFILE").unwrap_or_else(|_| r"C:\Users".to_string());
    
    let downloads_path = format!(r"{}\Downloads", user_profile);
    let docs_onedrive = format!(r"{}\OneDrive\Documents", user_profile);
    let docs_local = format!(r"{}\Documents", user_profile);
    let docs_path = if Path::new(&docs_onedrive).exists() { docs_onedrive } else { docs_local };

    let pics_onedrive = format!(r"{}\OneDrive\Pictures", user_profile);
    let pics_local = format!(r"{}\Pictures", user_profile);
    let pics_path = if Path::new(&pics_onedrive).exists() { pics_onedrive } else { pics_local };

    let vids_onedrive = format!(r"{}\OneDrive\Videos", user_profile);
    let vids_local = format!(r"{}\Videos", user_profile);
    let vids_path = if Path::new(&vids_onedrive).exists() { vids_onedrive } else { vids_local };

    let dl_size = get_folder_size_fast(&downloads_path);
    let doc_size = get_folder_size_fast(&docs_path);
    let pic_size = get_folder_size_fast(&pics_path);
    let vid_size = get_folder_size_fast(&vids_path);

    let user_folders = vec![
        FolderSizeItem { name: downloads_path.clone(), path: downloads_path, size_bytes: dl_size },
        FolderSizeItem { name: docs_path.clone(), path: docs_path, size_bytes: doc_size },
        FolderSizeItem { name: pics_path.clone(), path: pics_path, size_bytes: pic_size },
        FolderSizeItem { name: vids_path.clone(), path: vids_path, size_bytes: vid_size },
    ];
    let user_total: u64 = user_folders.iter().map(|f| f.size_bytes).sum();

    let junk_scan = scan_junk_files();
    let temp_total = junk_scan.total_junk_bytes;

    // Get real disk space from sysinfo
    let disks = sysinfo::Disks::new_with_refreshed_list();
    let (total_b, free_b) = if let Some(d) = disks.first() {
        (d.total_space(), d.available_space())
    } else {
        (0, 0)
    };

    StorageAllocationBreakdown {
        windows_system_apps_total_bytes: sys_total,
        user_downloads_media_total_bytes: user_total,
        temp_junk_total_bytes: temp_total,
        free_bytes: free_b,
        total_bytes: total_b,
        system_folders,
        user_folders,
    }
}

fn get_folder_size_fast(path_str: &str) -> u64 {
    let path = Path::new(path_str);
    if !path.exists() {
        return 0;
    }
    let is_system = path_str.to_lowercase().contains(r"c:\windows") 
        || path_str.to_lowercase().contains(r"c:\program files")
        || path_str.to_lowercase().contains(r"c:\programdata");
    let max_depth = if is_system { 2 } else { 3 };
    calculate_dir_size_with_depth(path, max_depth)
}

fn calculate_dir_size_with_depth(path: &Path, depth: u8) -> u64 {
    if depth == 0 {
        return 0;
    }
    let mut total = 0u64;
    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries.flatten() {
            let p = entry.path();
            let name_lower = p.to_string_lossy().to_lowercase();

            // Skip heavy OS-locked directories that hang file iterators
            if name_lower.contains("winsxs") 
                || name_lower.contains("system32") 
                || name_lower.contains("installer") 
                || name_lower.contains("servicing") 
            {
                continue;
            }

            if let Ok(meta) = p.metadata() {
                if meta.is_file() {
                    total += meta.len();
                } else if meta.is_dir() {
                    total += calculate_dir_size_with_depth(&p, depth - 1);
                }
            }
        }
    }
    total
}

fn calculate_dir_stats(path: &str) -> (u64, usize) {
    let mut total_size = 0u64;
    let mut total_count = 0usize;

    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries.flatten() {
            if let Ok(meta) = entry.metadata() {
                if meta.is_file() {
                    total_size += meta.len();
                    total_count += 1;
                }
            }
        }
    }

    (total_size, total_count)
}
