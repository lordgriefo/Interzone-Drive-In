// src/utils/playlistZip.js
// ZIP-based session export/import for The Kinet-O-Chop
// Packs playlist JSON + asset images/videos + audio into a single .zip archive.
// On import, blobs are restored and linked back to playlist entries.
//
// Archive layout:
//   playlist.json         manifest (array of entries)
//   assets/<file>         images / videos
//   audio/<file>          song audio

import JSZip from 'jszip';

const safe = (s, max = 80) =>
  String(s || 'file').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, max);

/** Resolve a File | Blob | url-string into a Blob (or null). */
async function toBlob(source) {
  if (!source) return null;
  if (source instanceof Blob) return source; // File extends Blob
  if (typeof source === 'string') {
    const res = await fetch(source);
    return await res.blob();
  }
  return null;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}

/**
 * Core builder.
 * @param {Array} entries  [{ id, title, duration, preset, assets:[{id,name,type,mediaType,url}], audioSource, audioName }]
 */
async function buildZip(entries, filenamePrefix) {
  const zip = new JSZip();
  const assetFolder = zip.folder('assets');
  const audioFolder = zip.folder('audio');

  const assetFilenames = {}; // asset id -> zip filename
  const packedAssets = new Set();

  // Pack every asset referenced by any entry (dedupe by id)
  for (const entry of entries) {
    for (const a of entry.assets || []) {
      if (!a?.id || !a.url || packedAssets.has(a.id)) continue;
      packedAssets.add(a.id);
      try {
        const blob = await toBlob(a.url);
        if (!blob) continue;
        const filename = `${String(a.id).slice(-6)}_${safe(a.name || a.id)}`;
        assetFilenames[a.id] = filename;
        assetFolder.file(filename, blob);
      } catch (err) {
        console.warn(`[PlaylistZip] Could not pack asset ${a.id}:`, err);
      }
    }
  }

  const manifest = [];
  for (const entry of entries) {
    let audioFilename = null;
    try {
      const blob = await toBlob(entry.audioSource);
      if (blob) {
        const base = safe(entry.audioName || entry.title || 'track');
        const hasExt = /\.[a-z0-9]{2,4}$/i.test(base);
        const ext = hasExt ? '' : (blob.type.includes('wav') ? '.wav'
          : blob.type.includes('ogg') ? '.ogg'
          : blob.type.includes('flac') ? '.flac' : '.mp3');
        audioFilename = `${String(entry.id).slice(-6)}_${base}${ext}`;
        audioFolder.file(audioFilename, blob);
      }
    } catch (err) {
      console.warn('[PlaylistZip] Could not pack audio for', entry.title, err);
    }

    manifest.push({
      id: entry.id,
      title: entry.title,
      duration: entry.duration || 0,
      preset: entry.preset || {},
      audioFilename,
      assetHints: (entry.assets || []).map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        mediaType: a.mediaType,
        zipFilename: assetFilenames[a.id] || null,
      })),
    });
  }

  zip.file('playlist.json', JSON.stringify(manifest, null, 2));

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
  downloadBlob(blob, `${filenamePrefix}-${Date.now()}.zip`);

  return {
    audioPacked: manifest.filter((m) => m.audioFilename).length,
    assetsPacked: packedAssets.size,
  };
}

/**
 * Export the whole playlist (+ audio + images) as a .zip.
 * Images come from each entry's saved assets; audio from entry.file / entry.url.
 */
export async function exportPlaylistZip(playlist, assets = []) {
  const byId = new Map(assets.map((a) => [a.id, a]));
  const entries = playlist.map((e) => ({
    id: e.id,
    title: e.title,
    duration: e.duration,
    preset: e.preset,
    // prefer live asset (has a valid blob url) over the snapshot stored on the entry
    assets: (e.assets || []).map((a) => byId.get(a.id) || a),
    audioSource: e.file || e.url,
    audioName: e.file?.name || e.title,
  }));
  return buildZip(entries, 'strangelet-kinetocut-playlist');
}

/**
 * Export just the song that's currently loaded: its audio, FX preset and the
 * images currently in the Asset Bin.
 */
export async function exportCurrentSongZip({ title, audioSource, duration, preset, assets = [] }) {
  const entry = {
    id: `song_${Date.now()}`,
    title: title || 'Untitled',
    duration: duration || 0,
    preset: preset || {},
    assets,
    audioSource,
    audioName: audioSource?.name || title,
  };
  return buildZip([entry], `strangelet-kinetocut-${safe(title, 40)}`);
}

/**
 * Import a .zip made by either export function.
 * @returns {{ playlist: Array, assets: Array }}
 */
export async function importPlaylistZip(zipFile) {
  const zip = await JSZip.loadAsync(zipFile);

  const manifestFile = zip.file('playlist.json');
  if (!manifestFile) throw new Error('Invalid Strangelet Kineto-Cut zip: missing playlist.json');
  const manifest = JSON.parse(await manifestFile.async('text'));
  if (!Array.isArray(manifest)) throw new Error('Invalid playlist.json: expected an array');

  const assetUrls = {};
  const audioBlobs = {};

  const jobs = [];
  zip.folder('assets').forEach((relativePath, file) => {
    if (file.dir) return;
    jobs.push(file.async('blob').then((b) => { assetUrls[relativePath] = URL.createObjectURL(b); }));
  });
  zip.folder('audio').forEach((relativePath, file) => {
    if (file.dir) return;
    jobs.push(file.async('blob').then((b) => { audioBlobs[relativePath] = b; }));
  });
  await Promise.all(jobs);

  const restoredAssets = [];
  const seenAssetIds = new Set();

  const playlist = manifest.map((item) => {
    const itemAssets = (item.assetHints || []).map((hint) => {
      const url = hint.zipFilename ? assetUrls[hint.zipFilename] : null;
      if (!url) return { id: hint.id, name: hint.name || 'Missing Asset', url: null, type: hint.type || 'image' };
      const asset = {
        id: hint.id || `imported_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: hint.name || hint.zipFilename || 'Imported Asset',
        url,
        type: hint.type || 'image',
        mediaType: hint.mediaType || 'image',
      };
      if (!seenAssetIds.has(asset.id)) {
        seenAssetIds.add(asset.id);
        restoredAssets.push(asset);
      }
      return asset;
    });

    // Restore audio as a real File so playback + re-export both work
    let file = null;
    let url = null;
    const audioBlob = item.audioFilename ? audioBlobs[item.audioFilename] : null;
    if (audioBlob) {
      const cleanName = item.audioFilename.replace(/^[^_]*_/, '');
      file = new File([audioBlob], cleanName, { type: audioBlob.type || 'audio/mpeg' });
      url = URL.createObjectURL(file);
    }

    return {
      id: item.id || `pl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: item.title || 'Untitled',
      duration: item.duration || 0,
      preset: item.preset || {},
      assets: itemAssets,
      assetHints: item.assetHints || [],
      url,
      file,
    };
  });

  return { playlist, assets: restoredAssets };
}
