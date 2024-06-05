import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      selectDir: () => Promise<{ canceled: boolean; filePaths: string[] }>
    }
  }
}
