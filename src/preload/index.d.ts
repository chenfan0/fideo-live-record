import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      selectDir: () => Promise<{ canceled: boolean; filePaths: string[] }>
      getLiveUrls: (info: {
        roomUrl: string
        proxy?: string
        cookie?: string
      }) => Promise<{ code: number; liveUrls: string[] }>
      navByDefaultBrowser: (url: string) => void
      startStreamRecord: (streamConfig: string) => Promise<{ code: number }>
      stopStreamRecord: (title: string) => Promise<{ code: number }>
      showNotification: (title: string, body: string) => void

      onStreamRecordEnd: (callback: (title: string, code: number) => void) => void
    }
  }
}
