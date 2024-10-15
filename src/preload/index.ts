import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  CLOSE_WINDOW,
  DOWNLOAD_DEP_PROGRESS_INFO,
  FFMPEG_PROGRESS_INFO,
  FORCE_CLOSE_WINDOW,
  MAXIMIZE_RESTORE_WINDOW,
  MINIMIZE_WINDOW,
  NAV_BY_DEFAULT_BROWSER,
  OPEN_LOGS_DIR,
  RETRY_DOWNLOAD_DEP,
  SELECT_DIR,
  SHOW_NOTIFICATION,
  SHOW_UPDATE_DIALOG,
  START_FRPC_PROCESS,
  START_STREAM_RECORD,
  STOP_FRPC_PROCESS,
  STOP_STREAM_RECORD,
  STREAM_RECORD_END,
  USER_CLOSE_WINDOW
} from '../const'

// Custom APIs for renderer
const api = {
  isDarwin: process.platform === 'darwin',
  selectDir: () => ipcRenderer.invoke(SELECT_DIR),
  openLogsDir: () => ipcRenderer.invoke(OPEN_LOGS_DIR),
  getLiveUrls: (info: { roomUrl: string; proxy?: string; cookie?: string; title: string }) =>
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
  forceCloseWindow: () => ipcRenderer.invoke(FORCE_CLOSE_WINDOW),
  retryDownloadDep: () => ipcRenderer.invoke(RETRY_DOWNLOAD_DEP),

  startFrpcProcess: (code: string) => ipcRenderer.invoke(START_FRPC_PROCESS, code),
  stopFrpcProcess: () => ipcRenderer.invoke(STOP_FRPC_PROCESS),

  onStreamRecordEnd: (callback: (title: string, code: number, errMsg?: string) => void) => {
    ipcRenderer.on(STREAM_RECORD_END, (_, title, code, errMsg) => {
      callback(title, code, errMsg)
    })
  },
  onFFmpegProgressInfo: (callback: (info: Record<string, IFfmpegProgressInfo>) => void) => {
    ipcRenderer.on(FFMPEG_PROGRESS_INFO, (_, info) => {
      callback(info)
    })
  },

  onDownloadDepProgressInfo: (callback: (info: IDownloadDepProgressInfo) => void) => {
    ipcRenderer.on(DOWNLOAD_DEP_PROGRESS_INFO, (_, info) => {
      callback(info)
    })
  },

  onUserCloseWindow: (callback: () => void) => {
    ipcRenderer.on(USER_CLOSE_WINDOW, () => {
      callback()
    })
  },
  onAppUpdate: (callback: () => void) => {
    ipcRenderer.on(SHOW_UPDATE_DIALOG, () => {
      callback()
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
