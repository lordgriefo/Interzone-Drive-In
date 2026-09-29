// electron/main.cjs
// Electron main process with FFmpeg deterministic dual-format (MP4 / WebM) export pipeline
const { app, BrowserWindow, ipcMain, dialog, session } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow = null;
let ffmpegProcess = null;
let currentExportPath = null;
let tempAudioFilePath = null;
let lastFfmpegStderr = '';
let ffmpegExitCode = null;

function getFfmpegPath() {
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    return process.env.FFMPEG_PATH;
  }
  try {
    const ffmpegStatic = require('ffmpeg-static');
    if (ffmpegStatic && fs.existsSync(ffmpegStatic)) {
      return ffmpegStatic;
    }
  } catch (_) {}
  return 'ffmpeg';
}

function cleanupTempAudio() {
  if (tempAudioFilePath) {
    try {
      if (fs.existsSync(tempAudioFilePath)) {
        fs.unlinkSync(tempAudioFilePath);
      }
    } catch (_) {}
    tempAudioFilePath = null;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 720,
    backgroundColor: '#0a0a0c',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
  const prodIndex = path.join(__dirname, '../dist/index.html');

  if (fs.existsSync(prodIndex) && process.env.NODE_ENV !== 'development') {
    mainWindow.loadFile(prodIndex);
  } else {
    mainWindow.loadURL(devUrl).catch(() => {
      if (fs.existsSync(prodIndex)) mainWindow.loadFile(prodIndex);
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (ffmpegProcess) {
      try { ffmpegProcess.kill('SIGKILL'); } catch (_) {}
      ffmpegProcess = null;
    }
    cleanupTempAudio();
  });
}

app.whenReady().then(() => {
  // ── Enable getDisplayMedia in the renderer (required in Electron) ──
  // Without this, navigator.mediaDevices.getDisplayMedia() is blocked by default.
  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    // Route screen capture to the main window's web contents
    callback({ video: mainWindow.webContents });
  });

  // Auto-approve media permissions (microphone, camera, display-capture)
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowed = ['media', 'display-capture', 'audioCapture', 'videoCapture'];
    callback(allowed.some((p) => permission.startsWith(p)));
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  cleanupTempAudio();
  if (process.platform !== 'darwin') app.quit();
});

// ── IPC Handlers: Deterministic FFmpeg Mode B Pipeline ──────────────────────

// Check FFmpeg availability and path
ipcMain.handle('export:status', async () => {
  const ffmpegCmd = getFfmpegPath();
  const exists = fs.existsSync(ffmpegCmd) || ffmpegCmd === 'ffmpeg';
  return {
    available: exists,
    path: ffmpegCmd,
    isBundled: Boolean(ffmpegCmd && ffmpegCmd.includes('node_modules')),
  };
});

ipcMain.handle('export:init', async (event, options = {}) => {
  const {
    fps = 60,
    format = 'mp4',
    audioSourcePath = null,
    audioData = null,
    defaultFileName = format === 'webm' ? 'interzone-export.webm' : 'interzone-export.mp4',
  } = options;

  cleanupTempAudio();
  lastFfmpegStderr = '';
  ffmpegExitCode = null;

  const isWebM = format.toLowerCase() === 'webm' || defaultFileName.toLowerCase().endsWith('.webm');

  // Configure save dialog based on chosen format
  const saveResult = await dialog.showSaveDialog(mainWindow, {
    title: isWebM ? 'Save Zero-Jank HD WebM Export' : 'Save Zero-Jank HD MP4 Export',
    defaultPath: defaultFileName,
    filters: isWebM
      ? [
          { name: 'WebM Video (*.webm)', extensions: ['webm'] },
          { name: 'All Files (*.*)', extensions: ['*'] },
        ]
      : [
          { name: 'MP4 Video (*.mp4)', extensions: ['mp4'] },
          { name: 'All Files (*.*)', extensions: ['*'] },
        ],
  });

  if (saveResult.canceled || !saveResult.filePath) {
    return { canceled: true };
  }

  currentExportPath = saveResult.filePath;

  // If raw PCM WAV audio was passed from renderer, write to OS temp directory
  let audioInputFile = null;
  if (audioData) {
    try {
      const tempDir = app.getPath('temp');
      tempAudioFilePath = path.join(tempDir, `kineto_export_audio_${Date.now()}.wav`);
      fs.writeFileSync(tempAudioFilePath, Buffer.from(audioData));
      const stat = fs.statSync(tempAudioFilePath);
      if (stat.size > 44) {
        audioInputFile = tempAudioFilePath;
      }
    } catch (err) {
      console.warn('[Electron Main] Failed to write temp audio file:', err);
    }
  } else if (audioSourcePath && fs.existsSync(audioSourcePath)) {
    audioInputFile = audioSourcePath;
  }

  // Locate ffmpeg
  const ffmpegCmd = getFfmpegPath();

  // Input PNG image sequence piped from stdin
  const ffmpegArgs = [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'png',
    '-r', String(fps),
    '-i', '-', // Stream from stdin
  ];

  // Configure Audio Stream
  if (audioInputFile && fs.existsSync(audioInputFile)) {
    if (isWebM) {
      // WebM uses Opus audio
      ffmpegArgs.push('-i', audioInputFile, '-c:a', 'libopus', '-b:a', '192k');
    } else {
      // MP4 uses high-bitrate AAC audio
      ffmpegArgs.push('-i', audioInputFile, '-c:a', 'aac', '-b:a', '320k');
    }
  }

  // Ensure output dimensions are always even (divisible by 2) to prevent libx264/yuv420p errors
  ffmpegArgs.push('-vf', 'pad=ceil(iw/2)*2:ceil(ih/2)*2');

  // Configure Video Stream Codec
  if (isWebM) {
    // Native VP9 encoding for WebM
    ffmpegArgs.push(
      '-c:v', 'libvpx-vp9',
      '-pix_fmt', 'yuv420p',
      '-b:v', '0',
      '-crf', '24',
      '-deadline', 'realtime',
      '-cpu-used', '4',
      '-row-mt', '1'
    );
  } else {
    // Native H.264 encoding for MP4
    ffmpegArgs.push(
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-preset', 'fast',
      '-crf', '17' // Near-lossless visual quality
    );
  }

  if (audioInputFile && fs.existsSync(audioInputFile)) {
    ffmpegArgs.push('-shortest');
  }

  ffmpegArgs.push(currentExportPath);

  console.log('[Electron Main] Spawning FFmpeg:', ffmpegCmd, ffmpegArgs.join(' '));

  return new Promise((resolve, reject) => {
    try {
      ffmpegProcess = spawn(ffmpegCmd, ffmpegArgs);

      ffmpegProcess.stdin.on('error', (err) => {
        console.error('[FFmpeg stdin error]', err.message);
      });

      ffmpegProcess.stderr.on('data', (chunk) => {
        const text = chunk.toString();
        lastFfmpegStderr += text;
        if (lastFfmpegStderr.length > 25000) {
          lastFfmpegStderr = lastFfmpegStderr.slice(-25000);
        }
        console.error('[FFmpeg]', text.trim());
      });

      ffmpegProcess.on('exit', (code) => {
        ffmpegExitCode = code;
        console.log('[FFmpeg process exited with code]', code);
      });

      ffmpegProcess.on('error', (err) => {
        console.error('[FFmpeg Process Error]', err);
        ffmpegProcess = null;
        cleanupTempAudio();
        reject(new Error(`Failed to spawn FFmpeg at "${ffmpegCmd}". ${err.message}`));
      });

      resolve({ success: true, outputPath: currentExportPath, format: isWebM ? 'webm' : 'mp4' });
    } catch (err) {
      cleanupTempAudio();
      reject(err);
    }
  });
});

ipcMain.handle('export:write-frame', async (event, buffer) => {
  if (!buffer || buffer === true) {
    return { written: true };
  }

  if (!ffmpegProcess || !ffmpegProcess.stdin || !ffmpegProcess.stdin.writable) {
    const detail = lastFfmpegStderr ? `\n\nFFmpeg Log:\n${lastFfmpegStderr.slice(-800)}` : '';
    throw new Error(`FFmpeg process is not accepting frames (process exited with code ${ffmpegExitCode ?? 'null'}).${detail}`);
  }

  return new Promise((resolve, reject) => {
    const nodeBuf = Buffer.from(buffer);
    let settled = false;

    const onDrain = () => {
      if (!settled) {
        settled = true;
        resolve({ written: true });
      }
    };

    const canWrite = ffmpegProcess.stdin.write(nodeBuf, (err) => {
      if (err) {
        if (!settled) {
          settled = true;
          reject(err);
        }
      } else if (canWrite && !settled) {
        settled = true;
        resolve({ written: true });
      }
    });

    if (!canWrite) {
      ffmpegProcess.stdin.once('drain', onDrain);
    }
  });
});

ipcMain.handle('export:capture-viewport-frame', async (event, rect) => {
  if (!ffmpegProcess || !ffmpegProcess.stdin || !ffmpegProcess.stdin.writable) {
    const detail = lastFfmpegStderr ? `\n\nFFmpeg Log:\n${lastFfmpegStderr.slice(-800)}` : '';
    throw new Error(`FFmpeg process is not accepting frames (process exited with code ${ffmpegExitCode ?? 'null'}).${detail}`);
  }

  if (!mainWindow) {
    throw new Error('Main window is not available');
  }

  // Native Chromium hardware frame buffer capture
  const image = await mainWindow.webContents.capturePage(rect);
  const pngBuffer = image.toPNG();

  return new Promise((resolve, reject) => {
    if (!ffmpegProcess || !ffmpegProcess.stdin || !ffmpegProcess.stdin.writable) {
      const detail = lastFfmpegStderr ? `\n\nFFmpeg Log:\n${lastFfmpegStderr.slice(-800)}` : '';
      return reject(new Error(`FFmpeg process is not accepting frames.${detail}`));
    }

    let settled = false;

    const onDrain = () => {
      if (!settled) {
        settled = true;
        resolve({ written: true });
      }
    };

    const canWrite = ffmpegProcess.stdin.write(pngBuffer, (err) => {
      if (err) {
        if (!settled) {
          settled = true;
          reject(err);
        }
      } else if (canWrite && !settled) {
        settled = true;
        resolve({ written: true });
      }
    });

    if (!canWrite) {
      ffmpegProcess.stdin.once('drain', onDrain);
    }
  });
});

ipcMain.handle('export:finish', async () => {
  if (!ffmpegProcess) {
    cleanupTempAudio();
    return { success: false, error: 'No active export process' };
  }

  return new Promise((resolve, reject) => {
    ffmpegProcess.on('close', (code) => {
      ffmpegProcess = null;
      cleanupTempAudio();
      if (code === 0) {
        resolve({ success: true, outputPath: currentExportPath });
      } else {
        const detail = lastFfmpegStderr ? `\n\nFFmpeg Log:\n${lastFfmpegStderr.slice(-800)}` : '';
        reject(new Error(`FFmpeg exited with error code ${code}.${detail}`));
      }
    });

    try {
      ffmpegProcess.stdin.end();
    } catch (_) {}
  });
});

ipcMain.handle('export:cancel', async () => {
  if (ffmpegProcess) {
    try {
      ffmpegProcess.kill('SIGKILL');
    } catch (_) {}
    ffmpegProcess = null;
  }
  cleanupTempAudio();
  return { canceled: true };
});
