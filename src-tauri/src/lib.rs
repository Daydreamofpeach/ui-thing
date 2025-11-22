// Minimal Rust setup with node server command
use serde::{Deserialize, Serialize};
use std::net::TcpStream;
use std::process::{Command, Stdio};
use std::time::Duration;
#[cfg_attr(mobile, tauri::mobile_entry_point)]
use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
};
use tauri_plugin_log;

#[derive(Debug, Serialize, Deserialize)]
pub struct ServerStatus {
    running: bool,
    port: Option<u16>,
    url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SetupDiagnostics {
    node_in_path: bool,
    node_version: Option<String>,
    plugins_dir: Option<String>,
    server_js_exists: bool,
}

#[tauri::command]
async fn diagnose_plugins_setup() -> Result<SetupDiagnostics, String> {
    // Check node availability
    let node_check = Command::new("node")
        .arg("-v")
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output();
    let (node_in_path, node_version) = match node_check {
        Ok(out) => {
            let ver = String::from_utf8_lossy(&out.stdout).trim().to_string();
            (
                out.status.success(),
                if ver.is_empty() { None } else { Some(ver) },
            )
        }
        Err(_) => (false, None),
    };

    // Locate plugins dir and server file
    let current_dir =
        std::env::current_dir().map_err(|e| format!("Failed to get current directory: {}", e))?;
    let exe_path =
        std::env::current_exe().map_err(|e| format!("Failed to get executable path: {}", e))?;
    let possible_paths = vec![
        current_dir.join("plugins"),
        current_dir.parent().unwrap_or(&current_dir).join("plugins"),
        current_dir.join("..").join("plugins"),
        current_dir.join("..").join("..").join("plugins"),
        exe_path
            .parent()
            .unwrap_or(exe_path.as_path())
            .parent()
            .unwrap_or(exe_path.as_path())
            .parent()
            .unwrap_or(exe_path.as_path())
            .join("plugins"),
    ];
    let mut selected: Option<std::path::PathBuf> = None;
    for p in possible_paths {
        if p.exists() {
            selected = Some(p);
            break;
        }
    }
    let (plugins_dir, server_js_exists) = if let Some(dir) = selected {
        let srv = dir.join("server.js");
        (Some(dir.display().to_string()), srv.exists())
    } else {
        (None, false)
    };

    Ok(SetupDiagnostics {
        node_in_path,
        node_version,
        plugins_dir,
        server_js_exists,
    })
}

#[tauri::command]
async fn start_plugins_server() -> Result<ServerStatus, String> {
    // Get current directory and construct path to plugins
    let current_dir =
        std::env::current_dir().map_err(|e| format!("Failed to get current directory: {}", e))?;

    println!("Current directory: {:?}", current_dir);

    // Get the executable path to determine the correct relative path
    let exe_path =
        std::env::current_exe().map_err(|e| format!("Failed to get executable path: {}", e))?;
    println!("Executable path: {:?}", exe_path);

    // Try multiple possible paths for the plugins directory
    let possible_paths = vec![
        current_dir.join("plugins"), // If running from buildit2 root
        current_dir.parent().unwrap().join("plugins"), // If running from client directory
        current_dir.join("..").join("plugins"), // Alternative relative path
        current_dir.join("..").join("..").join("plugins"), // If running from client/src-tauri
        exe_path
            .parent()
            .unwrap()
            .parent()
            .unwrap()
            .parent()
            .unwrap()
            .join("plugins"), // From executable location
    ];

    println!("Trying paths:");
    for (i, path) in possible_paths.iter().enumerate() {
        println!("  {}: {:?} (exists: {})", i, path, path.exists());
    }

    let plugins_dir = possible_paths
        .iter()
        .find(|path| path.exists())
        .ok_or("Plugins directory not found in any expected location")?
        .canonicalize()
        .map_err(|e| format!("Failed to canonicalize plugins path: {}", e))?;

    println!("Selected plugins directory: {:?}", plugins_dir);
    let server_file = plugins_dir.join("server.js");

    if !server_file.exists() {
        return Err(format!("Server file not found: {:?}", server_file));
    }

    // Start the Node.js server
    let _child = Command::new("node")
        .arg(&server_file)
        .current_dir(&plugins_dir)
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|e| format!("Failed to start server: {}", e))?;

    // Poll the port to ensure the server is actually listening
    let target_port: u16 = 9003;
    let mut attempts: u8 = 0;
    let max_attempts: u8 = 20; // ~10 seconds (see sleep below)
    let wait_step = Duration::from_millis(500);

    while attempts < max_attempts {
        if TcpStream::connect(("127.0.0.1", target_port)).is_ok() {
            return Ok(ServerStatus {
                running: true,
                port: Some(target_port),
                url: Some(format!("http://localhost:{}", target_port)),
            });
        }
        tokio::time::sleep(wait_step).await;
        attempts += 1;
    }

    Err(format!(
        "Plugins server failed to start or port {} is not reachable after timeout",
        target_port
    ))
}

pub fn run() {
    // Configure localhost plugin with port 9527
    let localhost_port: u16 = 9527;
    
    tauri::Builder::default()
        .plugin(tauri_plugin_localhost::Builder::new(localhost_port).build())
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_log::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_fs::init())  // FS must come before persisted-scope
        .plugin(tauri_plugin_persisted_scope::init())  // Moved after fs
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            start_plugins_server,
            diagnose_plugins_setup
        ])
        .setup(|app| {
            // Tray icon menu
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let tray_menu = Menu::with_items(app, &[&quit_i])?;

            let _tray = TrayIconBuilder::new()
                .menu(&tray_menu)
                .show_menu_on_left_click(true)
                .icon(app.default_window_icon().unwrap().clone())
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    other => {
                        println!("menu item {} not handled", other);
                    }
                })
                .build(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
