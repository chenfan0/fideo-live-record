import { create } from 'zustand'
import localForage from 'localforage'

interface INavSelectedStatusStore {
  navSelectedStatus: string
  setNavSelectedStatus: (status: string) => void
  initData: () => void
}

export const useNavSelectedStatusStore = create<INavSelectedStatusStore>((set) => ({
  navSelectedStatus: '-1',
  initData: async () => {
    const navSelectedStatus = (await localForage.getItem<string>('navSelectedStatus')) || '-1'

    set(() => ({ navSelectedStatus }))
  },
  setNavSelectedStatus: async (navSelectedStatus: string) => {
    await localForage.setItem('navSelectedStatus', navSelectedStatus)
    set(() => {
      return { navSelectedStatus }
    })
  }
}))
