import { create } from 'zustand'
import localForage from 'localforage'

interface IWebControlSettingStore {
  webControlSetting: IWebControlSetting
  setWebControlSetting: (setting: IWebControlSetting) => void
  initData: () => void
}

export const useWebControlSettingStore = create<IWebControlSettingStore>((set) => ({
  webControlSetting: {
    webControlPath: '',
    enableWebControl: false,
    email: ''
  },
  initData: async () => {
    const webControlSetting = await localForage.getItem<IWebControlSetting>('webControlSetting')
    if (webControlSetting) {
      set(() => ({ webControlSetting }))
    }
  },
  setWebControlSetting: (setting: IWebControlSetting) =>
    set(() => {
      localForage.setItem('webControlSetting', setting)
      return { webControlSetting: setting }
    })
}))
