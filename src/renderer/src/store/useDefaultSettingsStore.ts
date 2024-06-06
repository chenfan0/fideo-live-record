import { create } from 'zustand'
import localForage from 'localforage'

type Lang = 'en' | 'cn'

interface IDefaultDefaultSettingsConfig {
  directory: string
  lang: Lang
}

interface IDefaultSettingsStore {
  defaultSettingsConfig: IDefaultDefaultSettingsConfig
  setDefaultSettingsConfig: (config: IDefaultDefaultSettingsConfig) => void
  initData: () => void
}

export const useDefaultSettingsStore = create<IDefaultSettingsStore>((set) => ({
  defaultSettingsConfig: { directory: '', lang: 'en' },
  initData: async () => {
    const defaultSettingsConfig =
      await localForage.getItem<IDefaultDefaultSettingsConfig>('defaultSettingsConfig')
    if (defaultSettingsConfig) {
      set(() => ({ defaultSettingsConfig }))
    }
  },
  setDefaultSettingsConfig: (config: IDefaultDefaultSettingsConfig) =>
    set(() => {
      localForage.setItem('defaultSettingsConfig', config)
      return { defaultSettingsConfig: config }
    })
}))
