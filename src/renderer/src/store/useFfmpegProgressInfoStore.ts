import { create } from 'zustand'

interface IRecordingProgressInfoStore {
  ffmpegProgressInfo: IFfmpegProgressInfo
  updateFfmpegProgressInfo: (newInfo: IFfmpegProgressInfo) => void
}

export const useFfmpegProgressInfoStore = create<IRecordingProgressInfoStore>((set) => ({
  ffmpegProgressInfo: {},
  updateFfmpegProgressInfo: (newInfo) => set({ ffmpegProgressInfo: newInfo })
}))
