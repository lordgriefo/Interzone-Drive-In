fn main() {
    // Ensure ffmpeg.exe is copied next to the crate and into target directories during build
    let candidates = [
        "../node_modules/ffmpeg-static/ffmpeg.exe",
        "../../node_modules/ffmpeg-static/ffmpeg.exe",
        r"D:\strangelet-lounge-\strangelet-kineto-cut\node_modules\ffmpeg-static\ffmpeg.exe",
    ];

    for c in &candidates {
        let p = std::path::Path::new(c);
        if p.exists() {
            let _ = std::fs::copy(p, "ffmpeg.exe");
            if let Ok(out) = std::env::var("OUT_DIR") {
                let out_path = std::path::PathBuf::from(out);
                if let Some(target_dir) = out_path.ancestors().nth(3) {
                    let _ = std::fs::copy(p, target_dir.join("ffmpeg.exe"));
                }
            }
            break;
        }
    }

    tauri_build::build();
}
