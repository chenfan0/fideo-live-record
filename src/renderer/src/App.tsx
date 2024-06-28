import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useMount } from 'react-use'

import { Toaster } from '@/shadcn/ui/toaster'
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

  useMount(() => {
    const winControls = document.getElementById('window-controls')
    window.api.isDarwin && winControls && (winControls.style.display = 'none')
  })

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

      <Toaster />
    </>
  )
}

export default App
