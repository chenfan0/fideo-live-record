import { create } from 'zustand'

interface IRecordingProgressInfoStore {
  ffmpegProgressInfo: IFfmpegProgressInfo
  updateFfmpegProgressInfo: (newInfo: IFfmpegProgressInfo) => void
}

export const useFfmpegProgressInfoStore = create<IRecordingProgressInfoStore>((set) => ({
  ffmpegProgressInfo: {},
  updateFfmpegProgressInfo: (newInfo) => {
    window.socket.send(
      JSON.stringify({
        type: 'ffmpegProgressInfo',
        data: newInfo
      })
    )
    set({ ffmpegProgressInfo: newInfo })
  }
}))
