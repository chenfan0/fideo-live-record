import { create } from 'zustand'

import localForage from 'localforage'

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
    const streamConfigList = await localForage.getItem<IStreamConfig[]>('streamConfigList')
    if (streamConfigList) {
      // window.socket?.send(
      //   JSON.stringify({
      //     type: 'streamConfigList',
      //     data: streamConfigList
      //   })
      // )
      set(() => ({ streamConfigList }))
    }
  },
  addStreamConfig: async (streamConfig: IStreamConfig) => {
    const newStreamConfigList = [streamConfig, ...get().streamConfigList]
    await localForage.setItem('streamConfigList', newStreamConfigList)
    window.socket.send(
      JSON.stringify({
        type: 'streamConfigList',
        data: newStreamConfigList
      })
    )
    set(() => {
      return { streamConfigList: newStreamConfigList }
    })
  },
  updateStreamConfig: async (newStreamConfig: IStreamConfig, title: string) => {
    const newStreamConfigList = get().streamConfigList.map((streamConfig) =>
      streamConfig.title === title ? newStreamConfig : streamConfig
    )
    await localForage.setItem('streamConfigList', newStreamConfigList)
    window.socket.send(
      JSON.stringify({
        type: 'streamConfigList',
        data: newStreamConfigList
      })
    )
    set(() => {
      return { streamConfigList: newStreamConfigList }
    })
  },
  replaceStreamConfig: async (newStreamConfigList: IStreamConfig[]) => {
    await localForage.setItem('streamConfigList', newStreamConfigList)
    window.socket.send(
      JSON.stringify({
        type: 'streamConfigList',
        data: newStreamConfigList
      })
    )
    set(() => {
      return { streamConfigList: newStreamConfigList }
    })
  },
  removeStreamConfig: async (title: string) => {
    const newStreamConfigList = get().streamConfigList.filter(
      (streamConfig) => streamConfig.title !== title
    )
    await localForage.setItem('streamConfigList', newStreamConfigList)
    window.socket.send(
      JSON.stringify({
        type: 'streamConfigList',
        data: newStreamConfigList
      })
    )
    set(() => {
      return { streamConfigList: newStreamConfigList }
    })
  }
}))
