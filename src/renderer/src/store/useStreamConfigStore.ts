import { create } from 'zustand'

import localForage from 'localforage'

interface IStreamConfigStore {
  streamConfigList: IStreamConfig[]
  initialData: () => void
  addStreamConfig: (streamConfig: IStreamConfig) => void
  updateStreamConfig: (streamConfig: IStreamConfig, index: number) => void
  removeStreamConfig: (index: number) => void
}

export const useStreamConfigStore = create<IStreamConfigStore>((set) => ({
  streamConfigList: [],
  activeStreamConfig: null,
  activeStreamConfigIndex: -1,
  streamConfigSheetOpen: false,
  initialData: async () => {
    const streamConfigList = await localForage.getItem<IStreamConfig[]>('streamConfigList')
    if (streamConfigList) {
      set(() => ({ streamConfigList }))
    }
  },
  addStreamConfig: (streamConfig: IStreamConfig) =>
    set((state) => {
      const streamConfigList = [streamConfig, ...state.streamConfigList]
      localForage.setItem('streamConfigList', streamConfigList)
      return { streamConfigList }
    }),
  updateStreamConfig: (streamConfig: IStreamConfig, index: number) =>
    set((state) => {
      const streamConfigList = state.streamConfigList.map((item, i) =>
        i === index ? streamConfig : item
      )
      localForage.setItem('streamConfigList', streamConfigList)
      return { streamConfigList }
    }),
  removeStreamConfig: (index: number) =>
    set((state) => {
      const streamConfigList = state.streamConfigList.filter((_, i) => i !== index)
      localForage.setItem('streamConfigList', streamConfigList)
      return { streamConfigList }
    })
}))
