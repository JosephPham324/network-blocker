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
use std::sync::Mutex; 

// 1. New Imports for v2 Plugins
use tauri::Emitter; 
// use tauri_plugin_autostart::MacosLauncher; // Removed
// use tauri_plugin_oauth::start; 
// use tauri::WebviewWindow; 

#[derive(Serialize, Deserialize, Debug, Clone)]
struct BlockRule {
    domain: String,
    is_active: bool,
    #[serde(default = "default_mode")]
    mode: String, // "hard", "friction", "friction_wait", "friction_typing"
}

fn default_mode() -> String {
    "hard".to_string()
}

#[derive(Serialize, Clone, Debug)]
struct CachedRule {
    domain: String,
    mode: String,
}

#[derive(Serialize, Clone, Debug)]
struct ServerResponse {
    rules: Vec<CachedRule>,
    language: String,
}

use tiny_http::{Server, Response, Header};
use std::sync::Arc;

// Global State
struct AppState {
    clean_on_exit: Mutex<bool>,
    cached_rules: Arc<Mutex<Vec<CachedRule>>>, // Shared with HTTP server
    language: Arc<Mutex<String>>,
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

// --- NEW AUTOSTART COMMANDS ---

#[tauri::command]
fn check_autostart_admin() -> bool {
    if cfg!(target_os = "windows") {
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        let output = Command::new("schtasks")
            .args(&["/Query", "/TN", "MindfulBlockerAutostart"])
            .creation_flags(CREATE_NO_WINDOW)
            .output();
            
        match output {
            Ok(o) => o.status.success(),
            Err(_) => false,
        }
    } else {
        false
    }
}

#[tauri::command]
fn set_autostart_admin(enable: bool) -> Result<String, String> {
    if !cfg!(target_os = "windows") {
        return Err("Only supported on Windows".to_string());
    }

    const CREATE_NO_WINDOW: u32 = 0x08000000;
    
    if enable {
        let current_exe = std::env::current_exe().map_err(|e| e.to_string())?;
        let required_path = current_exe.to_string_lossy().to_string();
        
        let output = Command::new("schtasks")
            .args(&[
                "/Create", 
                "/F", 
                "/SC", "ONLOGON", 
                "/RL", "HIGHEST", 
                "/TN", "MindfulBlockerAutostart", 
                "/TR", &format!("'{}'", required_path) // Quote path
            ])
            .creation_flags(CREATE_NO_WINDOW)
            .output()
            .map_err(|e| e.to_string())?;
            
        if output.status.success() {
             Ok("Enabled Admin Autostart".to_string())
        } else {
             let err_msg = String::from_utf8_lossy(&output.stderr);
             Err(format!("Failed to create task: {}", err_msg))
        }
    } else {
         let output = Command::new("schtasks")
            .args(&["/Delete", "/F", "/TN", "MindfulBlockerAutostart"])
            .creation_flags(CREATE_NO_WINDOW)
            .output()
            .map_err(|e| e.to_string())?;
            
        if output.status.success() {
             Ok("Disabled Admin Autostart".to_string())
        } else {
             let err_msg = String::from_utf8_lossy(&output.stderr);
             if err_msg.contains("The specified task name was not found") {
                 Ok("Disabled (Task was already missing)".to_string())
             } else {
                 Err(format!("Failed to delete task: {}", err_msg))
             }
        }
    }
}

// ------------------------------

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
fn apply_blocking_rules(state: tauri::State<'_, AppState>, rules: Vec<BlockRule>, language: String) -> Result<String, String> {
    // 1. Update In-Memory Cache for Extension (Friction Mode) & Language
    if let Ok(mut cache) = state.cached_rules.lock() {
        cache.clear();
        for rule in &rules {
            if rule.is_active && rule.mode.contains("friction") {
                 // Store domain + mode for extension
                 cache.push(CachedRule {
                     domain: rule.domain.to_lowercase().trim().replace("www.", ""),
                     mode: rule.mode.clone(),
                 });
            }
        }
    }

    if let Ok(mut lang) = state.language.lock() {
        *lang = language;
    }

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

    // Create new content (Hard Mode Only)
    content = content.trim_end().to_string();
    content.push_str("\n\n# MINDFULBLOCK_START\n");
    for rule in rules {
        if rule.is_active && rule.mode == "hard" {
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
    // Initialize Shared State
    let cached_rules = Arc::new(Mutex::new(Vec::new()));
    let language = Arc::new(Mutex::new("vi".to_string()));
    
    // Create clones for setup thread
    let rules_for_setup = cached_rules.clone();
    let lang_for_setup = language.clone();

    tauri::Builder::default()
        // .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec![]))) // Removed
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_oauth::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(move |app| {
            if let Some(window) = app.get_webview_window("main") {
                window.show().unwrap();
            }

            // --- SPAWN HTTP SERVER WITH APP HANDLE ACCESS ---
            let handle = app.handle().clone();
            // Use the clone we captured in 'setup' move closure
            let server_rules = rules_for_setup.clone();
            let server_lang = lang_for_setup.clone();
            
            std::thread::spawn(move || {
                let server = Server::http("127.0.0.1:17430").unwrap();
                println!("[Rust] Local Friction Server running on :17430");
                
                for mut request in server.incoming_requests() {
                    let url = request.url().to_string();
                    let method = request.method().as_str().to_string();
                    
                    // CORS Headers
                    let headers = vec![
                        Header::from_bytes(&b"Access-Control-Allow-Origin"[..], &b"*"[..]).unwrap(),
                        Header::from_bytes(&b"Content-Type"[..], &b"application/json"[..]).unwrap(),
                    ];

                    if method == "OPTIONS" {
                         let response = Response::from_string("").with_header(headers[0].clone()).with_header(headers[1].clone());
                         let _ = request.respond(response);
                         continue;
                    }

                    if url == "/rules" {
                        let rules_guard = server_rules.lock().unwrap();
                        let lang_guard = server_lang.lock().unwrap();
                        
                        let response_data = ServerResponse {
                            rules: rules_guard.clone(),
                            language: lang_guard.clone(),
                        };
                        
                        let json = serde_json::to_string(&response_data).unwrap_or("{}".to_string());
                        let response = Response::from_string(json).with_header(headers[0].clone()).with_header(headers[1].clone());
                        let _ = request.respond(response);
                    } else if url == "/report" && method == "POST" {
                        // Read body
                        let mut content = String::new();
                        let _ = request.as_reader().read_to_string(&mut content);
                        
                        // Parse safely (optional) or just emit raw string
                        println!("[Rust] Received Report: {}", content);
                        
                        // Emit to Frontend
                        let _ = handle.emit("analytics_event", content);

                        let response = Response::from_string("{\"status\":\"ok\"}".to_string())
                            .with_header(headers[0].clone())
                            .with_header(headers[1].clone());
                        let _ = request.respond(response);
                    } else {
                        let response = Response::from_string("{}".to_string()).with_status_code(404);
                        let _ = request.respond(response);
                    }
                }
            });

            Ok(())
        })
        // Combined into ONE handler call:
        .invoke_handler(tauri::generate_handler![
            start_server,
            check_admin_privileges,
            apply_blocking_rules,
            set_clean_on_exit,
            check_autostart_admin, // New
            set_autostart_admin    // New
        ])
        .manage(AppState { 
            clean_on_exit: Mutex::new(false),
            cached_rules: cached_rules,
            language: language 
        }) 
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
                        // Also clear cache? Not strictly necessary as process dies
                        // Pass empty language
                        let _ = apply_blocking_rules(state.clone(), vec![], "vi".to_string()); // Clear all rules
                    }
                }
                _ => {}
            }
        });
}