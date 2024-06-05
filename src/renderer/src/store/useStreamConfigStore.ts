import { create } from 'zustand'

import localForage from 'localforage'

interface IStreamConfigStore {
  streamConfigList: IStreamConfig[]
  initialData: () => void
  addStreamConfig: (streamConfig: IStreamConfig) => void
  updateStreamConfig: (streamConfig: IStreamConfig, index: number) => void
}

export const useStreamConfigStore = create<IStreamConfigStore>((set) => ({
  streamConfigList: [],
  initialData: async () => {
    const streamConfigList = await localForage.getItem<IStreamConfig[]>('streamConfigList')
    if (streamConfigList) {
      set(() => ({ streamConfigList }))
    }
  },
  addStreamConfig: (streamConfig: IStreamConfig) =>
    set((state) => {
      const streamConfigList = [streamConfig, ...state.streamConfigList]
      console.log(streamConfigList)
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
