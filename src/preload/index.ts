import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { SELECT_DIR } from '../const'

// Custom APIs for renderer
const api = {
  selectDir: () => ipcRenderer.invoke(SELECT_DIR),
  getLiveUrls: (info: { roomUrl: string; proxy?: string; cookie?: string }) =>
    ipcRenderer.invoke('GET_LIVE_URLS', info)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    // contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
