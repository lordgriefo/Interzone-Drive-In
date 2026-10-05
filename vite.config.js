import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function mediaScannerPlugin() {
  const scan = () => {
    const root = process.cwd();
    const manifestPath = path.resolve(root, 'src/constants/discoveredAssets.json');
    const items = [];
    const seen = new Set();

    const scanDirectory = (dirPath, publicUrlPrefix) => {
      if (!fs.existsSync(dirPath)) return;
      try {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          if (entry.isDirectory()) {
            scanDirectory(fullPath, `${publicUrlPrefix}/${entry.name}`);
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            const isImg = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'].includes(ext);
            const isVid = ['.webm', '.mp4', '.mov'].includes(ext);
            if (isImg || isVid) {
              const lower = entry.name.toLowerCase();
              if (seen.has(lower)) continue;
              seen.add(lower);

              const baseName = path.basename(entry.name, ext);
              const cleanId = `${isVid ? 'webm' : 'extra'}-${baseName.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}`;
              items.push({
                id: cleanId,
                name: baseName.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
                url: `${publicUrlPrefix}/${entry.name}`,
                mediaType: isVid ? 'video' : 'image',
              });
            }
          }
        }
      } catch (err) {
        console.warn('[mediaScannerPlugin] Scan error:', dirPath, err.message);
      }
    };

    // 1. Scan public/assets-bg/iz-extras & public/assets-bg/iz-webms
    scanDirectory(path.resolve(root, 'public/assets-bg/iz-extras'), './assets-bg/iz-extras');
    scanDirectory(path.resolve(root, 'public/assets-bg/iz-webms'), './assets-bg/iz-webms');
    scanDirectory(path.resolve(root, 'public/assets-bg/iz-webm'), './assets-bg/iz-webm');

    // 2. Scan public/iz-extras & public/iz-webms
    scanDirectory(path.resolve(root, 'public/iz-extras'), './iz-extras');
    scanDirectory(path.resolve(root, 'public/iz-webms'), './iz-webms');

    // 3. Scan root assets-bg/iz-extras & assets-bg/iz-webms
    scanDirectory(path.resolve(root, 'assets-bg/iz-extras'), './assets-bg/iz-extras');
    scanDirectory(path.resolve(root, 'assets-bg/iz-webms'), './assets-bg/iz-webms');
    scanDirectory(path.resolve(root, 'iz-webms'), './iz-webms');

    // 4. Also scan any subfolder in public/ that mentions 'webm' or 'extra'
    const publicDir = path.resolve(root, 'public');
    if (fs.existsSync(publicDir)) {
      try {
        const topDirs = fs.readdirSync(publicDir, { withFileTypes: true });
        for (const d of topDirs) {
          if (d.isDirectory() && (d.name.includes('webm') || d.name.includes('extra'))) {
            scanDirectory(path.join(publicDir, d.name), `./${d.name}`);
          }
        }
      } catch (_) {}
    }

    // Ensure any files in root assets-bg are mirrored into public/assets-bg so Vite/Vercel can serve them
    const syncDir = (src, dest) => {
      if (!fs.existsSync(src)) return;
      if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
      try {
        const entries = fs.readdirSync(src, { withFileTypes: true });
        for (const entry of entries) {
          const srcItem = path.join(src, entry.name);
          const destItem = path.join(dest, entry.name);
          if (entry.isDirectory()) {
            syncDir(srcItem, destItem);
          } else if (entry.isFile()) {
            if (!fs.existsSync(destItem)) {
              fs.copyFileSync(srcItem, destItem);
            }
          }
        }
      } catch (_) {}
    };

    syncDir(path.resolve(root, 'assets-bg'), path.resolve(root, 'public/assets-bg'));

    try {
      fs.writeFileSync(manifestPath, JSON.stringify(items, null, 2), 'utf-8');
      console.log(`[mediaScannerPlugin] Discovered ${items.length} media items from iz-extras & iz-webms`);
    } catch (err) {
      console.warn('[mediaScannerPlugin] Could not write discoveredAssets.json:', err.message);
    }
  };

  // Run scan immediately when config loads
  scan();

  return {
    name: 'media-scanner-plugin',
    buildStart() {
      scan();
    },
    configureServer(server) {
      scan();
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [mediaScannerPlugin(), react()],

  build: {
    // Raise chunk warning threshold — video/audio assets can be large
    chunkSizeWarningLimit: 1000,
  },
});
