import { create } from 'zustand'

import localForage from 'localforage'
import { sendMessage, WebSocketMessageType } from '@/lib/websocket'

import { nanoid } from 'nanoid'

interface IStreamConfigStore {
  streamConfigList: IStreamConfig[]
  initialData: () => void
  addStreamConfig: (streamConfig: IStreamConfig) => Promise<void>
  updateStreamConfig: (streamConfig: IStreamConfig, title: string) => Promise<void>
  removeStreamConfig: (title: string) => Promise<void>
  replaceStreamConfig: (newStreamConfigList: IStreamConfig[]) => Promise<void>
}

export const useStreamConfigStore = create<IStreamConfigStore>((set, get) => ({
  streamConfigList: [],
  streamConfigSheetOpen: false,
  initialData: async () => {
    let streamConfigList = await localForage.getItem<IStreamConfig[]>('streamConfigList')

    if (!streamConfigList) return

    let shouldUpdate = false
    streamConfigList = streamConfigList.map((streamConfig) => {
      if (!streamConfig.id) {
        shouldUpdate = true
        streamConfig.id = nanoid()
      }
      return streamConfig
    })

    if (shouldUpdate) {
      await localForage.setItem('streamConfigList', streamConfigList)
    }

    sendMessage({
      type: WebSocketMessageType.UPDATE_STREAM_CONFIG_LIST,
      data: streamConfigList
    })
    set(() => ({ streamConfigList: streamConfigList! }))
  },
  addStreamConfig: async (streamConfig: IStreamConfig) => {
    const newStreamConfigList = [streamConfig, ...get().streamConfigList]
    await localForage.setItem('streamConfigList', newStreamConfigList)
    sendMessage({
      type: WebSocketMessageType.UPDATE_STREAM_CONFIG_LIST,
      data: newStreamConfigList
    })
    set(() => {
      return { streamConfigList: newStreamConfigList }
    })
  },
  updateStreamConfig: async (newStreamConfig: IStreamConfig, id: string) => {
    const newStreamConfigList = get().streamConfigList.map((streamConfig) =>
      streamConfig.id === id ? newStreamConfig : streamConfig
    )
    await localForage.setItem('streamConfigList', newStreamConfigList)
    sendMessage({
      type: WebSocketMessageType.UPDATE_STREAM_CONFIG_LIST,
      data: newStreamConfigList
    })
    set(() => {
      return { streamConfigList: newStreamConfigList }
    })
  },
  replaceStreamConfig: async (newStreamConfigList: IStreamConfig[]) => {
    await localForage.setItem('streamConfigList', newStreamConfigList)
    sendMessage({
      type: WebSocketMessageType.UPDATE_STREAM_CONFIG_LIST,
      data: newStreamConfigList
    })
    set(() => {
      return { streamConfigList: newStreamConfigList }
    })
  },
  removeStreamConfig: async (id: string) => {
    const newStreamConfigList = get().streamConfigList.filter(
      (streamConfig) => streamConfig.id !== id
    )
    await localForage.setItem('streamConfigList', newStreamConfigList)
    sendMessage({
      type: WebSocketMessageType.UPDATE_STREAM_CONFIG_LIST,
      data: newStreamConfigList
    })
    set(() => {
      return { streamConfigList: newStreamConfigList }
    })
  }
}))
