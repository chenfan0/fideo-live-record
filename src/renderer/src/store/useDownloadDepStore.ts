import { create } from 'zustand'

interface IDownloadDepStore {
  downloadDepProgressInfo: IDownloadDepProgressInfo
  updateUpdateDownloadProgressInfo: (newInfo: IDownloadDepProgressInfo) => void
}

export const useDownloadDepInfoStore = create<IDownloadDepStore>((set) => ({
  downloadDepProgressInfo: {
    downloading: false,
    progress: 0
  },
  updateUpdateDownloadProgressInfo: (newInfo) => set({ downloadDepProgressInfo: newInfo })
}))
