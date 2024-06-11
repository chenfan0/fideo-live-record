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
    }
  }
}
