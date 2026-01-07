/** Location: /apps/pc/src-tauri/src/main.rs **/
// Khôi phục logic chặn mạng sau khi bị lệnh 'tauri init --force' ghi đè
#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::fs::{OpenOptions, File};
use std::io::{Write, BufReader, BufRead};
use is_elevated::is_elevated;

#[derive(Serialize, Deserialize, Debug)]
struct Rule {
    domain: String,
    is_active: bool,
}

#[tauri::command]
async fn sync_system_hosts(rules: Vec<Rule>) -> Result<String, String> {
    if !is_elevated() {
        return Err("ADMIN_REQUIRED: Cần quyền Administrator để thực thi chặn mạng.".into());
    }

    let path = if cfg!(target_os = "windows") {
        "C:\\Windows\\System32\\drivers\\etc\\hosts"
    } else {
        "/etc/hosts"
    };

    let mut content = String::new();
    let file = File::open(path).map_err(|e| e.to_string())?;
    let reader = BufReader::new(file);

    let mut in_block = false;
    for line in reader.lines() {
        let l = line.map_err(|e| e.to_string())?;
        if l.contains("# MINDFULBLOCK_START") { in_block = true; continue; }
        if l.contains("# MINDFULBLOCK_END") { in_block = false; continue; }
        if !in_block { content.push_str(&format!("{}\n", l)); }
    }

    content.push_str("\n# MINDFULBLOCK_START\n");
    for rule in rules {
        if rule.is_active {
            content.push_str(&format!("127.0.0.1 {}\n", rule.domain));
            content.push_str(&format!("127.0.0.1 www.{}\n", rule.domain));
        }
    }
    content.push_str("# MINDFULBLOCK_END\n");

    let mut file = OpenOptions::new()
        .write(true)
        .truncate(true)
        .open(path)
        .map_err(|e| format!("Lỗi ghi tệp: {}", e))?;
        
    file.write_all(content.as_bytes()).map_err(|e| e.to_string())?;

    Ok("SUCCESS".into())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![sync_system_hosts])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}