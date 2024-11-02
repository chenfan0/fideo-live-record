import { create } from 'zustand'
import localForage from 'localforage'

import emitter from '@renderer/lib/bus'
import { START_WEB_CONTROL } from '../../../const'

interface IWebControlSettingStore {
  webControlSetting: IWebControlSetting
  setWebControlSetting: (setting: IWebControlSetting) => Promise<void>
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
      const { enableWebControl, webControlPath } = webControlSetting
      if (enableWebControl && webControlPath) {
        emitter.emit(START_WEB_CONTROL)
      }
    }
  },
  setWebControlSetting: async (setting: IWebControlSetting) => {
    await localForage.setItem('webControlSetting', setting)
    set(() => {
      return { webControlSetting: setting }
    })
  }
}))
