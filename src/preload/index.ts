import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  CLOSE_WINDOW,
  FFMPEG_PROGRESS_INFO,
  MAXIMIZE_RESTORE_WINDOW,
  MINIMIZE_WINDOW,
  NAV_BY_DEFAULT_BROWSER,
  SELECT_DIR,
  SHOW_NOTIFICATION,
  START_STREAM_RECORD,
  STOP_STREAM_RECORD,
  STREAM_RECORD_END
} from '../const'

// Custom APIs for renderer
const api = {
  isDarwin: process.platform === 'darwin',
  selectDir: () => ipcRenderer.invoke(SELECT_DIR),
  getLiveUrls: (info: { roomUrl: string; proxy?: string; cookie?: string }) =>
    ipcRenderer.invoke('GET_LIVE_URLS', info),
  navByDefaultBrowser: (url: string) => ipcRenderer.invoke(NAV_BY_DEFAULT_BROWSER, url),
  startStreamRecord: (streamConfig: string) =>
    ipcRenderer.invoke(START_STREAM_RECORD, streamConfig),
  stopStreamRecord: (title: string) => ipcRenderer.invoke(STOP_STREAM_RECORD, title),

  showNotification: (title: string, body: string) =>
    ipcRenderer.invoke(SHOW_NOTIFICATION, title, body),
  minimizeWindow: () => ipcRenderer.invoke(MINIMIZE_WINDOW),
  maxRestoreWindow: () => ipcRenderer.invoke(MAXIMIZE_RESTORE_WINDOW),
  closeWindow: () => ipcRenderer.invoke(CLOSE_WINDOW),

  onStreamRecordEnd: (callback: (title: string, code: number) => void) => {
    ipcRenderer.on(STREAM_RECORD_END, (_, title, code) => {
      callback(title, code)
    })
  },
  onFFmpegProgressInfo: (callback: (info: Record<string, IFfmpegProgressInfo>) => void) => {
    ipcRenderer.on(FFMPEG_PROGRESS_INFO, (_, info) => {
      callback(info)
    })
  }
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
