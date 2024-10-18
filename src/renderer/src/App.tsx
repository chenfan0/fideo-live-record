import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMount } from 'react-use'

import { Toaster } from '@/shadcn/ui/toaster'
import TitleBar from '@/components/TitleBar/TitleBar'
import NavBar from '@/components/NavBar/NavBar'
import StreamConfigList from '@/components/StreamConfigList/StreamConfigList'
import Dialog from '@/components/Dialog'
import DownloadingDep from '@/components/DownloadingDep/DownloadingDep'

import { useStreamConfigStore } from './store/useStreamConfigStore'
import { useDefaultSettingsStore } from './store/useDefaultSettingsStore'
import { useNavSelectedStatusStore } from './store/useNavSelectedStatusStore'
import { useWebControlSettingStore } from './store/useWebControlSettingStore'
import { useDownloadDepInfoStore } from './store/useDownloadDepStore'
import Loading from './components/Loading'
import Confetti from './components/Confetti'

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
  const { initData: initWebControlSettingData } = useWebControlSettingStore((state) => ({
    initData: state.initData
  }))
  const { initData: initNavSelectedStatus } = useNavSelectedStatusStore((state) => ({
    initData: state.initData
  }))
  const { downloadDepProgressInfo, updateUpdateDownloadProgressInfo } = useDownloadDepInfoStore(
    (state) => state
  )

  useMount(() => {
    const titleBar = document.getElementById('title-bar')
    const minButton = document.getElementById('min-button')
    const restoreButton = document.getElementById('restore-button')
    const closeButton = document.getElementById('close-button')

    if (window.api.isDarwin && titleBar) {
      titleBar.style.opacity = '0'
      minButton!.style.visibility = 'hidden'
      restoreButton!.style.visibility = 'hidden'
      closeButton!.style.visibility = 'hidden'
    }

    window.api.onAppUpdate(() => {
      setShowUpdateDialog(true)
    })

    window.api.onDownloadDepProgressInfo((progressInfo) => {
      updateUpdateDownloadProgressInfo(progressInfo)
    })
  })

  useEffect(() => {
    initStreamConfigData()
    initDefaultSettingsData()
    initNavSelectedStatus()
    initWebControlSettingData()
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

      {(downloadDepProgressInfo.downloading || downloadDepProgressInfo.showRetry) && (
        <DownloadingDep />
      )}

      <Loading />

      <Confetti />
    </>
  )
}

export default App
