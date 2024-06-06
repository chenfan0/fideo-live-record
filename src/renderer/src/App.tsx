import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import TitleBar from '@/components/TitleBar/TitleBar'
import NavBar from '@/components/NavBar/NavBar'
import StreamConfigList from '@/components/StreamConfigList/StreamConfigList'
import { useStreamConfigStore } from './store/useStreamConfigStore'
import { useDefaultSettingsStore } from './store/useDefaultSettingsStore'

function App(): JSX.Element {
  const { i18n } = useTranslation()
  const { initData: initStreamConfigData } = useStreamConfigStore((state) => ({
    initData: state.initialData
  }))
  const { initData: initDefaultSettingsData, defaultSettingsConfig } = useDefaultSettingsStore(
    (state) => ({
      initData: state.initData,
      defaultSettingsConfig: state.defaultSettingsConfig
    })
  )
  useEffect(() => {
    initStreamConfigData()
    initDefaultSettingsData()
  }, [])

  useEffect(() => {
    i18n.changeLanguage(defaultSettingsConfig.lang)
  }, [defaultSettingsConfig.lang])

  return (
    <>
      <TitleBar />
      <NavBar />

      <StreamConfigList />
    </>
  )
}

export default App
