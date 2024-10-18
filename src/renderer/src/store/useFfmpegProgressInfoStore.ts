import { create } from 'zustand'

import { sendMessage, WebSocketMessageType } from '@/lib/websocket'

interface IRecordingProgressInfoStore {
  ffmpegProgressInfo: IFfmpegProgressInfo
  updateFfmpegProgressInfo: (newInfo: IFfmpegProgressInfo) => void
}

export const useFfmpegProgressInfoStore = create<IRecordingProgressInfoStore>((set) => ({
  ffmpegProgressInfo: {},
  updateFfmpegProgressInfo: (newInfo) => {
    sendMessage({
      type: WebSocketMessageType.UPDATE_FFMPEG_PROGRESS_INFO,
      data: newInfo
    })

    set({ ffmpegProgressInfo: newInfo })
  }
}))
