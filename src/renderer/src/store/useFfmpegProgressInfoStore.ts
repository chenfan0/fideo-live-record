import { create } from 'zustand'

import { sendMessage } from '@/lib/websocket'
import { WEBSOCKET_MESSAGE_TYPE } from '../../../const'
interface IRecordingProgressInfoStore {
  ffmpegProgressInfo: IFfmpegProgressInfo
  updateFfmpegProgressInfo: (newInfo: IFfmpegProgressInfo) => void
}

export const useFfmpegProgressInfoStore = create<IRecordingProgressInfoStore>((set, get) => ({
  ffmpegProgressInfo: {},
  updateFfmpegProgressInfo: (newInfo) => {
    const raw = get().ffmpegProgressInfo

    if (Object.keys(raw).length === 0 && Object.keys(newInfo).length === 0) {
      return
    }

    sendMessage({
      type: WEBSOCKET_MESSAGE_TYPE.UPDATE_FFMPEG_PROGRESS_INFO,
      data: newInfo
    })

    set({ ffmpegProgressInfo: newInfo })
  }
}))
