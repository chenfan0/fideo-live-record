import { create } from 'zustand'

import localForage from 'localforage'

interface IStreamConfigStore {
  streamConfigList: IStreamConfig[]
  activeStreamConfig: IStreamConfig | null
  activeStreamConfigIndex: number
  streamConfigSheetOpen: boolean
  initialData: () => void
  setActiveStreamConfigIndex: (index: number) => void
  setStreamConfigSheetOpen: (status: boolean) => void
  addStreamConfig: (streamConfig: IStreamConfig) => void
  updateStreamConfig: (streamConfig: IStreamConfig, index: number) => void
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
  setActiveStreamConfigIndex: (index: number) =>
    set((state) => ({
      activeStreamConfigIndex: index,
      activeStreamConfig: state.streamConfigList[index]
    })),
  setStreamConfigSheetOpen: (status: boolean) =>
    set((state) => {
      if (!status) {
        return { ...state, streamConfigSheetOpen: status, activeStreamConfig: null }
      }
      return { streamConfigSheetOpen: status }
    }),
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
    })
}))
