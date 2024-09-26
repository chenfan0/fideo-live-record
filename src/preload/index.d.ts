import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      isDarwin: boolean
      selectDir: () => Promise<{ canceled: boolean; filePaths: string[] }>
      openLogsDir: () => void
      getLiveUrls: (info: {
        roomUrl: string
        proxy?: string
        cookie?: string
      }) => Promise<{ code: number; liveUrls: string[] }>
      navByDefaultBrowser: (url: string) => void
      startStreamRecord: (streamConfig: string) => Promise<{ code: number }>
      stopStreamRecord: (title: string) => Promise<{ code: number }>
      showNotification: (title: string, body: string) => void
      minimizeWindow: () => void
      maxRestoreWindow: () => void
      closeWindow: () => void
      forceCloseWindow: () => void
      retryDownloadDep: () => void

      onStreamRecordEnd: (callback: (title: string, code: number, errMsg?: string) => void) => void
      onFFmpegProgressInfo: (callback: (info: IFfmpegProgressInfo) => void) => void
      onDownloadDepProgressInfo: (callback: (info: IDownloadDepProgressInfo) => void) => void
      onUserCloseWindow: (callback: () => void) => void
      onAppUpdate: (callback: () => void) => void
    }
  }
}
