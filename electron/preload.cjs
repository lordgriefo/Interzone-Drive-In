// electron/preload.cjs
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('isElectron', true);

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  getStatus: () => ipcRenderer.invoke('export:status'),
  initExport: (options) => ipcRenderer.invoke('export:init', options),
  sendFrame: (buffer, frameIndex) => ipcRenderer.invoke('export:write-frame', buffer, frameIndex),
  captureViewportFrame: (rect) => ipcRenderer.invoke('export:capture-viewport-frame', rect),
  finishExport: () => ipcRenderer.invoke('export:finish'),
  cancelExport: () => ipcRenderer.invoke('export:cancel'),
  selectSavePath: (defaultName) => ipcRenderer.invoke('export:select-path', defaultName),
});
