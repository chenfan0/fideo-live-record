import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMount } from 'react-use'

import { Toaster } from '@/shadcn/ui/toaster'
import TitleBar from '@/components/TitleBar/TitleBar'
import NavBar from '@/components/NavBar/NavBar'
import StreamConfigList from '@/components/StreamConfigList/StreamConfigList'
import Dialog from '@/components/Dialog'

import { useStreamConfigStore } from './store/useStreamConfigStore'
import { useDefaultSettingsStore } from './store/useDefaultSettingsStore'

function App(): JSX.Element {
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const { i18n, t } = useTranslation()
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

    window.api.onAppUpdate(() => {
      setShowUpdateDialog(true)
    })
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

      <Dialog
        dialogOpen={showUpdateDialog}
        onOpenChange={setShowUpdateDialog}
        title={t('app_update.title')}
        btnText={t('app_update.get_update_detail')}
        handleBtnClick={() =>
          window.api.navByDefaultBrowser(
            'https://github.com/chenfan0/fideo-live-record/releases/latest'
          )
        }
      />
    </>
  )
}

export default App
