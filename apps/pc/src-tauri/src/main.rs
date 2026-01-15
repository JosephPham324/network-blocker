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
use std::sync::Mutex; // <--- Import Mutex


// 1. New Imports for v2 Plugins
use tauri::Emitter; // <--- This is what's missing
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_oauth::start; 
use tauri::WebviewWindow; 

#[derive(Serialize, Deserialize, Debug, Clone)]
struct BlockRule {
    domain: String,
    is_active: bool,
}

// Global State
struct AppState {
    clean_on_exit: Mutex<bool>,
}

#[tauri::command]
fn set_clean_on_exit(state: tauri::State<'_, AppState>, enabled: bool) {
    if let Ok(mut s) = state.clean_on_exit.lock() {
        *s = enabled;
        println!("[Rust] Clean on Exit set to: {}", enabled);
    }
}

#[tauri::command]
fn check_admin_privileges() -> bool {
    is_elevated()
}

fn get_hosts_path() -> String {
    if cfg!(target_os = "windows") {
        let win_dir = std::env::var("WinDir").unwrap_or_else(|_| "C:\\Windows".to_string());
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
fn apply_blocking_rules(rules: Vec<BlockRule>) -> Result<String, String> {
    if !is_elevated() {
        return Err("ADMIN_REQUIRED".into());
    }

    let path = get_hosts_path();
    let mut content = String::new();
    
    // Read old content
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

    // Create new content
    content = content.trim_end().to_string();
    content.push_str("\n\n# MINDFULBLOCK_START\n");
    for rule in rules {
        if rule.is_active {
            let d = rule.domain.to_lowercase().trim().replace("www.", "");
            content.push_str(&format!("127.0.0.1 {}\n", d));
            content.push_str(&format!("127.0.0.1 www.{}\n", d));
            content.push_str(&format!("::1 {}\n", d));
            content.push_str(&format!("::1 www.{}\n", d));
        }
    }
    content.push_str("# MINDFULBLOCK_END\n");

    // Write file
    let mut file = OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(true)
        .open(&path)
        .map_err(|e| format!("Lỗi mở file: {}. Kiểm tra Antivirus.", e))?;
        
    file.write_all(content.as_bytes()).map_err(|e| e.to_string())?;
    file.sync_all().map_err(|e| e.to_string())?;

    // Flush DNS
    if cfg!(target_os = "windows") {
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        let _ = Command::new("ipconfig")
            .arg("/flushdns")
            .creation_flags(CREATE_NO_WINDOW)
            .status();
    }

    Ok(format!("SUCCESS: DNS Flushed and Hosts updated at {}", path))
}

#[tauri::command]
async fn start_server(window: tauri::WebviewWindow) -> Result<u16, String> {
    // Clone the window handle so it can be moved into the closure safely
    let w = window.clone();
    
    tauri_plugin_oauth::start(move |url| {
        // Now using .emit() works because we imported tauri::Emitter
        let _ = w.emit("redirect_uri", url.to_string());
    })
    .map_err(|err| err.to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec![])))
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_oauth::init())
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                window.show().unwrap();
            }
            Ok(())
        })
        // Combined into ONE handler call:
        .invoke_handler(tauri::generate_handler![
            start_server,
            check_admin_privileges,
            apply_blocking_rules,
            set_clean_on_exit // Register new command
        ])
        .manage(AppState { clean_on_exit: Mutex::new(false) }) // Initialize State
        .build(tauri::generate_context!()) // Use .build() instead of .run()
        .expect("error while building tauri application")
        .run(|app_handle, event| {
             match event {
                tauri::RunEvent::ExitRequested { .. } => {
                    let state = app_handle.state::<AppState>();
                    let should_clean = {
                        match state.clean_on_exit.lock() {
                            Ok(guard) => *guard,
                            Err(_) => false,
                        }
                    };

                    if should_clean {
                        println!("[Rust] Cleaning hosts file on exit...");
                        let _ = apply_blocking_rules(vec![]); // Clear all rules
                    }
                }
                _ => {}
            }
        });
}