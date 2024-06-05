import { create } from 'zustand'

import localForage from 'localforage'

interface IStreamConfigStore {
  streamConfigList: IStreamConfig[]
}

export const useStreamConfigStore = create<IStreamConfigStore>((set) => ({
  streamConfigList: [],
  initialData: async () => {
    const streamConfigList = await localForage.getItem<IStreamConfig[]>('streamConfigList')
    if (streamConfigList) {
      set(() => ({ streamConfigList }))
    }
  }
}))
