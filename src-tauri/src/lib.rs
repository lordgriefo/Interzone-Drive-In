// src-tauri/src/lib.rs
// High-performance deterministic FFmpeg export pipeline for Strangelet KinetiCut
use std::fs::File;
use std::io::{Read, Write};
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use serde::Deserialize;
use serde_json::json;
use tauri::State;

#[derive(Default)]
pub struct ExportState {
    session: Mutex<Option<ExportSession>>,
}

struct ExportSession {
    child: Child,
    output_path: PathBuf,
    temp_audio_path: Option<PathBuf>,
    stderr_log: Arc<Mutex<String>>,
    width: u32,
    height: u32,
}

#[derive(Debug, Deserialize)]
pub struct ExportOptions {
    #[serde(default = "default_fps")]
    pub fps: u32,
    #[serde(default = "default_format")]
    pub format: String,
    pub audio_data: Option<Vec<u8>>,
    pub default_file_name: Option<String>,
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub input_format: Option<String>, // "raw_bgra" | "png"
}

fn default_fps() -> u32 { 60 }
fn default_format() -> String { "mp4".to_string() }

#[derive(Debug, Deserialize)]
pub struct CaptureRect {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
}

#[cfg(windows)]
#[link(name = "user32")]
#[link(name = "gdi32")]
extern "system" {
    fn GetClientRect(hwnd: *mut std::ffi::c_void, lp_rect: *mut Rect) -> i32;
    fn GetDC(hwnd: *mut std::ffi::c_void) -> *mut std::ffi::c_void;
    fn ReleaseDC(hwnd: *mut std::ffi::c_void, hdc: *mut std::ffi::c_void) -> i32;
    fn CreateCompatibleDC(hdc: *mut std::ffi::c_void) -> *mut std::ffi::c_void;
    fn DeleteDC(hdc: *mut std::ffi::c_void) -> i32;
    fn CreateCompatibleBitmap(hdc: *mut std::ffi::c_void, cx: i32, cy: i32) -> *mut std::ffi::c_void;
    fn DeleteObject(ho: *mut std::ffi::c_void) -> i32;
    fn SelectObject(hdc: *mut std::ffi::c_void, h: *mut std::ffi::c_void) -> *mut std::ffi::c_void;
    fn BitBlt(hdc_dst: *mut std::ffi::c_void, x: i32, y: i32, cx: i32, cy: i32, hdc_src: *mut std::ffi::c_void, x1: i32, y1: i32, rop: u32) -> i32;
    fn PrintWindow(hwnd: *mut std::ffi::c_void, hdc_blt: *mut std::ffi::c_void, n_flags: u32) -> i32;
    fn GetDIBits(
        hdc: *mut std::ffi::c_void,
        hbm: *mut std::ffi::c_void,
        start: u32,
        lines: u32,
        lpv_bits: *mut std::ffi::c_void,
        lpbmi: *mut BitmapInfo,
        usage: u32,
    ) -> i32;
}

#[cfg(windows)]
const SRCCOPY: u32 = 0x00CC0020;
#[cfg(windows)]
const PW_RENDERFULLCONTENT: u32 = 2;
#[cfg(windows)]
const DIB_RGB_COLORS: u32 = 0;
#[cfg(windows)]
const BI_RGB: u32 = 0;

#[cfg(windows)]
#[repr(C)]
struct Rect {
    left: i32,
    top: i32,
    right: i32,
    bottom: i32,
}

#[cfg(windows)]
#[repr(C)]
struct BitmapInfoHeader {
    bi_size: u32,
    bi_width: i32,
    bi_height: i32,
    bi_planes: u16,
    bi_bit_count: u16,
    bi_compression: u32,
    bi_size_image: u32,
    bi_x_pels_per_meter: i32,
    bi_y_pels_per_meter: i32,
    bi_clr_used: u32,
    bi_clr_important: u32,
}

#[cfg(windows)]
#[repr(C)]
struct BitmapInfo {
    bmi_header: BitmapInfoHeader,
    bmi_colors: [u32; 1],
}

fn find_ffmpeg() -> Option<PathBuf> {
    // 1. Check FFMPEG_PATH environment variable
    if let Ok(p) = std::env::var("FFMPEG_PATH") {
        let pb = PathBuf::from(p);
        if pb.is_file() { return Some(pb); }
    }

    // 2. Search ancestor directories from the current running executable
    if let Ok(exe) = std::env::current_exe() {
        if let Some(dir) = exe.parent() {
            let direct = dir.join("ffmpeg.exe");
            if direct.is_file() { return Some(direct); }

            let in_res = dir.join("resources").join("ffmpeg.exe");
            if in_res.is_file() { return Some(in_res); }

            for ancestor in dir.ancestors().take(8) {
                let c1 = ancestor.join("ffmpeg.exe");
                if c1.is_file() { return Some(c1); }

                let c2 = ancestor.join("node_modules").join("ffmpeg-static").join("ffmpeg.exe");
                if c2.is_file() { return Some(c2); }

                let c3 = ancestor.join("src-tauri").join("ffmpeg.exe");
                if c3.is_file() { return Some(c3); }

                let c4 = ancestor.join("resources").join("ffmpeg.exe");
                if c4.is_file() { return Some(c4); }
            }
        }
    }

    // 3. Search ancestor directories from current working directory
    if let Ok(cwd) = std::env::current_dir() {
        let direct = cwd.join("ffmpeg.exe");
        if direct.is_file() { return Some(direct); }

        for ancestor in cwd.ancestors().take(8) {
            let c1 = ancestor.join("ffmpeg.exe");
            if c1.is_file() { return Some(c1); }

            let c2 = ancestor.join("node_modules").join("ffmpeg-static").join("ffmpeg.exe");
            if c2.is_file() { return Some(c2); }

            let c3 = ancestor.join("src-tauri").join("ffmpeg.exe");
            if c3.is_file() { return Some(c3); }
        }
    }

    // 4. Check known project locations directly
    let hardcoded = [
        r"D:\strangelet-lounge-\strangelet-kineto-cut\node_modules\ffmpeg-static\ffmpeg.exe",
        r"D:\strangelet-lounge-\strangelet-kineto-cut\src-tauri\ffmpeg.exe",
        r"D:\strangelet-lounge-\strangelet-kineto-cut\src-tauri\resources\ffmpeg.exe",
        r"D:\strangelet-lounge-\kinet-o-chop\node_modules\ffmpeg-static\ffmpeg.exe",
        r"C:\ProgramData\chocolatey\bin\ffmpeg.exe",
        r"C:\ffmpeg\bin\ffmpeg.exe",
    ];
    for hc in &hardcoded {
        let pb = PathBuf::from(hc);
        if pb.is_file() { return Some(pb); }
    }

    // 5. Fast in-memory PATH check (no slow blocking subprocess)
    if let Ok(path_var) = std::env::var("PATH") {
        for entry in std::env::split_paths(&path_var) {
            let candidate = entry.join("ffmpeg.exe");
            if candidate.is_file() {
                return Some(candidate);
            }
        }
    }

    None
}

#[tauri::command]
fn get_desktop_status() -> serde_json::Value {
    json!({
        "engine": "tauri",
        "version": "2.0",
        "platform": std::env::consts::OS,
    })
}

#[tauri::command]
fn export_status() -> serde_json::Value {
    let maybe_path = find_ffmpeg();
    let available = maybe_path.is_some();
    let path_str = maybe_path.as_ref().map(|p| p.to_string_lossy().to_string()).unwrap_or_else(|| "ffmpeg".to_string());
    let is_bundled = path_str.contains("node_modules") || path_str.contains("ffmpeg-static") || path_str.contains("resources");
    json!({
        "available": available,
        "path": path_str,
        "isBundled": is_bundled,
        "engine": "tauri_native_rust"
    })
}

#[tauri::command]
fn export_init(
    options: ExportOptions,
    state: State<'_, ExportState>,
) -> Result<serde_json::Value, String> {
    // 1. Verify FFmpeg exists BEFORE opening the save dialog
    let ffmpeg_cmd = find_ffmpeg().ok_or_else(|| {
        "FFmpeg binary not found on system. Place ffmpeg.exe next to the app or in node_modules/ffmpeg-static.".to_string()
    })?;

    let mut lock = state.session.lock().map_err(|e| e.to_string())?;

    // Cleanup any existing session
    if let Some(mut existing) = lock.take() {
        let _ = existing.child.kill();
        if let Some(temp_audio) = existing.temp_audio_path {
            let _ = std::fs::remove_file(temp_audio);
        }
    }

    let is_webm = options.format.to_lowercase() == "webm";
    let default_name = options.default_file_name.unwrap_or_else(|| {
        if is_webm { "strangelet-kinetocut-export.webm".to_string() } else { "strangelet-kinetocut-export.mp4".to_string() }
    });

    // Native Windows File Dialog
    let file_result = rfd::FileDialog::new()
        .set_title(if is_webm { "Save Zero-Jank HD WebM Export" } else { "Save Zero-Jank HD MP4 Export" })
        .set_file_name(&default_name)
        .add_filter(
            if is_webm { "WebM Video (*.webm)" } else { "MP4 Video (*.mp4)" },
            &[if is_webm { "webm" } else { "mp4" }]
        )
        .save_file();

    let save_path = match file_result {
        Some(p) => p,
        None => return Ok(json!({ "canceled": true })),
    };

    // Save temporary WAV audio if provided
    let mut temp_audio_path = None;
    if let Some(audio_bytes) = options.audio_data {
        if audio_bytes.len() > 44 {
            let temp_dir = std::env::temp_dir();
            let audio_file_name = format!("kineto_tauri_export_audio_{}.wav", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_millis());
            let path = temp_dir.join(audio_file_name);
            if let Ok(mut f) = File::create(&path) {
                if f.write_all(&audio_bytes).is_ok() {
                    temp_audio_path = Some(path);
                }
            }
        }
    }

    let width = (options.width.unwrap_or(1920) & !1).max(2);
    let height = (options.height.unwrap_or(1080) & !1).max(2);
    let fps_str = options.fps.to_string();

    let is_raw_bgra = options.input_format.as_deref().unwrap_or("raw_bgra") == "raw_bgra";

    let mut args = vec!["-y".to_string()];

    if is_raw_bgra {
        args.extend(vec![
            "-f".to_string(), "rawvideo".to_string(),
            "-pix_fmt".to_string(), "bgra".to_string(),
            "-s".to_string(), format!("{}x{}", width, height),
            "-framerate".to_string(), fps_str.clone(),
            "-i".to_string(), "-".to_string(), // Pipe from stdin
        ]);
    } else {
        args.extend(vec![
            "-f".to_string(), "image2pipe".to_string(),
            "-framerate".to_string(), fps_str.clone(),
            "-vcodec".to_string(), "png".to_string(),
            "-i".to_string(), "-".to_string(), // Pipe from stdin
        ]);
    }

    if let Some(ref audio_path) = temp_audio_path {
        args.push("-i".to_string());
        args.push(audio_path.to_string_lossy().to_string());
    }

    // Force exact presentation timestamps and pad dimensions to even numbers
    args.push("-vf".to_string());
    args.push(format!("setpts=N/({}*TB),pad=ceil(iw/2)*2:ceil(ih/2)*2", options.fps));

    if temp_audio_path.is_some() {
        args.push("-map".to_string());
        args.push("0:v:0".to_string());
        args.push("-map".to_string());
        args.push("1:a:0".to_string());
    } else {
        args.push("-map".to_string());
        args.push("0:v:0".to_string());
    }

    args.push("-r".to_string());
    args.push(fps_str);

    if is_webm {
        args.extend(vec![
            "-c:v".to_string(), "libvpx-vp9".to_string(),
            "-pix_fmt".to_string(), "yuv420p".to_string(),
            "-b:v".to_string(), "0".to_string(),
            "-crf".to_string(), "24".to_string(),
            "-deadline".to_string(), "realtime".to_string(),
            "-cpu-used".to_string(), "4".to_string(),
            "-row-mt".to_string(), "1".to_string(),
        ]);
        if temp_audio_path.is_some() {
            args.extend(vec![
                "-c:a".to_string(), "libopus".to_string(),
                "-b:a".to_string(), "192k".to_string(),
            ]);
        }
    } else {
        args.extend(vec![
            "-c:v".to_string(), "libx264".to_string(),
            "-pix_fmt".to_string(), "yuv420p".to_string(),
            "-preset".to_string(), "fast".to_string(),
            "-crf".to_string(), "17".to_string(), // Near-lossless visual quality
        ]);
        if temp_audio_path.is_some() {
            args.extend(vec![
                "-c:a".to_string(), "aac".to_string(),
                "-b:a".to_string(), "320k".to_string(),
            ]);
        }
    }

    if temp_audio_path.is_some() {
        args.push("-shortest".to_string());
    }

    args.push(save_path.to_string_lossy().to_string());

    let mut cmd = Command::new(&ffmpeg_cmd);
    cmd.args(&args)
       .stdin(Stdio::piped())
       .stderr(Stdio::piped())
       .stdout(Stdio::null());

    let mut child = cmd.spawn().map_err(|e| format!("Failed to spawn FFmpeg at {:?}: {}", ffmpeg_cmd, e))?;

    let stderr_log = Arc::new(Mutex::new(String::new()));
    if let Some(mut stderr) = child.stderr.take() {
        let log_clone = Arc::clone(&stderr_log);
        std::thread::spawn(move || {
            let mut buf = [0u8; 1024];
            while let Ok(n) = stderr.read(&mut buf) {
                if n == 0 { break; }
                if let Ok(mut text) = log_clone.lock() {
                    text.push_str(&String::from_utf8_lossy(&buf[..n]));
                    if text.len() > 25000 {
                        let excess = text.len() - 25000;
                        text.drain(..excess);
                    }
                }
            }
        });
    }

    *lock = Some(ExportSession {
        child,
        output_path: save_path.clone(),
        temp_audio_path,
        stderr_log,
        width,
        height,
    });

    Ok(json!({
        "success": true,
        "outputPath": save_path.to_string_lossy(),
        "format": if is_webm { "webm" } else { "mp4" }
    }))
}

#[tauri::command]
fn export_write_frame(
    buffer: Vec<u8>,
    _frame_index: usize,
    state: State<'_, ExportState>,
) -> Result<serde_json::Value, String> {
    if buffer.is_empty() {
        return Ok(json!({ "written": true }));
    }
    let mut lock = state.session.lock().map_err(|e| e.to_string())?;
    let session = lock.as_mut().ok_or_else(|| "No active export session".to_string())?;

    if let Some(stdin) = session.child.stdin.as_mut() {
        stdin.write_all(&buffer).map_err(|e| format!("Failed to write frame to FFmpeg: {}", e))?;
        Ok(json!({ "written": true }))
    } else {
        Err("FFmpeg stdin is not writable".to_string())
    }
}

#[cfg(windows)]
#[tauri::command]
fn export_capture_viewport(
    window: tauri::WebviewWindow,
    rect: CaptureRect,
    state: State<'_, ExportState>,
) -> Result<serde_json::Value, String> {
    let hwnd_obj = window.hwnd().map_err(|e| e.to_string())?;
    let hwnd_ptr: *mut std::ffi::c_void = unsafe { std::mem::transmute(hwnd_obj) };

    let mut lock = state.session.lock().map_err(|e| e.to_string())?;
    let session = lock.as_mut().ok_or_else(|| "No active export session".to_string())?;

    let width = (rect.width as i32 & !1).max(2);
    let height = (rect.height as i32 & !1).max(2);

    unsafe {
        let mut client_rect: Rect = std::mem::zeroed();
        let _ = GetClientRect(hwnd_ptr, &mut client_rect);
        let win_w = (client_rect.right - client_rect.left).max(width);
        let win_h = (client_rect.bottom - client_rect.top).max(height);

        let hdc_window = GetDC(hwnd_ptr);
        if hdc_window.is_null() {
            return Err("Failed to get window device context".to_string());
        }

        // Full window DC & bitmap
        let hdc_full = CreateCompatibleDC(hdc_window);
        let hbm_full = CreateCompatibleBitmap(hdc_window, win_w, win_h);
        let old_full = SelectObject(hdc_full, hbm_full);

        // Snap hardware accelerated DirectComposition surface
        let pw_res = PrintWindow(hwnd_ptr, hdc_full, PW_RENDERFULLCONTENT);
        if pw_res == 0 {
            // Direct Blit fallback
            BitBlt(hdc_full, 0, 0, win_w, win_h, hdc_window, 0, 0, SRCCOPY);
        }

        // Crop DC & bitmap for exact viewport bounds
        let hdc_crop = CreateCompatibleDC(hdc_window);
        let hbm_crop = CreateCompatibleBitmap(hdc_window, width, height);
        let old_crop = SelectObject(hdc_crop, hbm_crop);

        BitBlt(hdc_crop, 0, 0, width, height, hdc_full, rect.x, rect.y, SRCCOPY);

        let mut bmi: BitmapInfo = std::mem::zeroed();
        bmi.bmi_header.bi_size = std::mem::size_of::<BitmapInfoHeader>() as u32;
        bmi.bmi_header.bi_width = width;
        bmi.bmi_header.bi_height = -height; // Top-down
        bmi.bmi_header.bi_planes = 1;
        bmi.bmi_header.bi_bit_count = 32;
        bmi.bmi_header.bi_compression = BI_RGB;

        let num_bytes = (width * height * 4) as usize;
        let mut raw_bytes = vec![0u8; num_bytes];

        GetDIBits(
            hdc_crop,
            hbm_crop,
            0,
            height as u32,
            raw_bytes.as_mut_ptr() as *mut _,
            &mut bmi,
            DIB_RGB_COLORS,
        );

        // Cleanup GDI objects
        SelectObject(hdc_crop, old_crop);
        DeleteObject(hbm_crop);
        DeleteDC(hdc_crop);

        SelectObject(hdc_full, old_full);
        DeleteObject(hbm_full);
        DeleteDC(hdc_full);

        ReleaseDC(hwnd_ptr, hdc_window);

        // Stream raw BGRA frame bytes directly to FFmpeg stdin
        if let Some(stdin) = session.child.stdin.as_mut() {
            stdin.write_all(&raw_bytes).map_err(|e| format!("Failed to write captured pixels to FFmpeg: {}", e))?;
        }
    }

    Ok(json!({ "written": true }))
}

#[cfg(not(windows))]
#[tauri::command]
fn export_capture_viewport(_window: tauri::WebviewWindow, _rect: CaptureRect) -> Result<serde_json::Value, String> {
    Err("Viewport hardware capture is implemented for Windows".to_string())
}

#[tauri::command]
fn export_finish(state: State<'_, ExportState>) -> Result<serde_json::Value, String> {
    let mut lock = state.session.lock().map_err(|e| e.to_string())?;
    let mut session = lock.take().ok_or_else(|| "No active export session".to_string())?;

    // Close stdin to signal EOF to FFmpeg
    drop(session.child.stdin.take());

    let exit_status = session.child.wait().map_err(|e| format!("Failed waiting for FFmpeg: {}", e))?;

    if let Some(temp_audio) = session.temp_audio_path {
        let _ = std::fs::remove_file(temp_audio);
    }

    if exit_status.success() {
        Ok(json!({
            "success": true,
            "outputPath": session.output_path.to_string_lossy()
        }))
    } else {
        let log = session.stderr_log.lock().map(|s| s.clone()).unwrap_or_default();
        Err(format!("FFmpeg failed with exit code {}: {}", exit_status, log.chars().rev().take(800).collect::<String>()))
    }
}

#[tauri::command]
fn export_cancel(state: State<'_, ExportState>) -> Result<serde_json::Value, String> {
    let mut lock = state.session.lock().map_err(|e| e.to_string())?;
    if let Some(mut session) = lock.take() {
        let _ = session.child.kill();
        if let Some(temp_audio) = session.temp_audio_path {
            let _ = std::fs::remove_file(temp_audio);
        }
    }
    Ok(json!({ "canceled": true }))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(ExportState::default())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_desktop_status,
            export_status,
            export_init,
            export_write_frame,
            export_capture_viewport,
            export_finish,
            export_cancel
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
