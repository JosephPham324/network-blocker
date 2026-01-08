#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde::{Deserialize, Serialize};
use std::fs::{OpenOptions, File};
use std::io::{Write, BufReader, BufRead};
use is_elevated::is_elevated;
use std::process::Command;
use std::os::windows::process::CommandExt;
use tauri::Manager;

#[derive(Serialize, Deserialize, Debug, Clone)]
struct BlockRule {
    domain: String,
    is_active: bool,
}

#[tauri::command]
async fn check_admin_privileges() -> bool {
    is_elevated()
}

/**
 * Lấy đường dẫn file hosts chính xác để tránh lỗi Redirector trên Windows 64-bit
 */
fn get_hosts_path() -> String {
    if cfg!(target_os = "windows") {
        let win_dir = std::env::var("WinDir").unwrap_or_else(|_| "C:\\Windows".to_string());
        // Sử dụng sysnative nếu app 32bit chạy trên Win 64bit, nếu không dùng System32
        let sys_native = format!("{}\\sysnative\\drivers\\etc\\hosts", win_dir);
        if std::path::Path::new(&sys_native).exists() {
            sys_native
        } else {
            format!("{}\\System32\\drivers\\etc\\hosts", win_dir)
        }
    } else {
        "/etc/hosts".to_string()
    }
}

#[tauri::command]
async fn apply_blocking_rules(rules: Vec<BlockRule>) -> Result<String, String> {
    if !is_elevated() {
        return Err("ADMIN_REQUIRED".into());
    }

    let path = get_hosts_path();
    let mut content = String::new();
    
    // 1. Đọc và lọc nội dung cũ
    if let Ok(file) = File::open(&path) {
        let reader = BufReader::new(file);
        let mut in_block = false;
        for line in reader.lines() {
            if let Ok(l) = line {
                if l.contains("# MINDFULBLOCK_START") { in_block = true; continue; }
                if l.contains("# MINDFULBLOCK_END") { in_block = false; continue; }
                if !in_block {
                    content.push_str(&l);
                    content.push('\n');
                }
            }
        }
    }

    // 2. Tạo nội dung chặn mới (Hỗ trợ cả IPv4 và IPv6)
    content = content.trim_end().to_string();
    content.push_str("\n\n# MINDFULBLOCK_START\n");
    for rule in rules {
        if rule.is_active {
            let d = rule.domain.to_lowercase().trim().replace("www.", "");
            // IPv4
            content.push_str(&format!("127.0.0.1 {}\n", d));
            content.push_str(&format!("127.0.0.1 www.{}\n", d));
            // IPv6 (Quan trọng cho các app hiện đại như Signal)
            content.push_str(&format!("::1 {}\n", d));
            content.push_str(&format!("::1 www.{}\n", d));
        }
    }
    content.push_str("# MINDFULBLOCK_END\n");

    // 3. Ghi file và đồng bộ đĩa
    let mut file = OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(true)
        .open(&path)
        .map_err(|e| format!("Lỗi mở file: {}. Kiểm tra Antivirus.", e))?;
        
    file.write_all(content.as_bytes()).map_err(|e| e.to_string())?;
    file.sync_all().map_err(|e| e.to_string())?;

    // 4. Xóa cache DNS để áp dụng ngay lập tức (Chỉ Windows)
    if cfg!(target_os = "windows") {
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        let _ = Command::new("ipconfig")
            .arg("/flushdns")
            .creation_flags(CREATE_NO_WINDOW)
            .status();
    }

    Ok(format!("SUCCESS: DNS Flushed and Hosts updated at {}", path))
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            if let Some(window) = app.get_window("main") {
                window.show().unwrap();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            check_admin_privileges,
            apply_blocking_rules
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}