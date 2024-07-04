import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import UseThemeIcon from '@/components/UseThemeIcon'
import Dialog from '@/components/Dialog'
import { useStreamConfigStore } from '@/store/useStreamConfigStore'

// import darkPreviewIcon from '@/assets/images/dark/preview.svg'
// import lightPreviewIcon from '@/assets/images/light/preview.svg'
import darkPlayIcon from '@/assets/images/dark/play.svg'
import lightPlayIcon from '@/assets/images/light/play.svg'
import darkPauseIcon from '@/assets/images/dark/pause.svg'
import lightPauseIcon from '@/assets/images/light/pause.svg'
import darkSettingIcon from '@/assets/images/dark/setting.svg'
import lightSettingIcon from '@/assets/images/light/setting.svg'
import darkDeleteIcon from '@/assets/images/dark/close.svg'
import lightDeleteIcon from '@/assets/images/light/close.svg'
import { StreamStatus } from '@renderer/lib/utils'
import StreamConfigSheet from '@renderer/components/StreamConfigSheet'

import { useToast } from '@renderer/hooks/useToast'
import { CRAWLER_ERROR_CODE, SUCCESS_CODE, errorCodeToI18nMessage } from '../../../../../code'

interface OperationBarProps {
  streamConfig: IStreamConfig
}

export default function OperationBar(props: OperationBarProps) {
  const timer = useRef<NodeJS.Timeout>()
  const { streamConfig } = props
  const { t } = useTranslation()
  const { toast } = useToast()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const { removeStreamConfig, updateStreamConfig } = useStreamConfigStore((state) => ({
    streamConfigList: state.streamConfigList,
    removeStreamConfig: state.removeStreamConfig,
    updateStreamConfig: state.updateStreamConfig
  }))

  const handleConfirmDelete = async () => {
    await removeStreamConfig(streamConfig.title)
    setDeleteDialogOpen(false)
  }

  const handleStartRecord = async (isFirst = true) => {
    isFirst &&
      (await updateStreamConfig(
        { ...streamConfig, status: StreamStatus.PREPARING_TO_RECORD },
        streamConfig.title
      ))

    const { code } = await window.api.startStreamRecord(JSON.stringify(streamConfig))

    if (code === SUCCESS_CODE) {
      await updateStreamConfig(
        { ...streamConfig, status: StreamStatus.RECORDING },
        streamConfig.title
      )
      toast({
        title: streamConfig.title,
        description: t('start_record')
      })
      return
    }

    if (code === CRAWLER_ERROR_CODE.NOT_URLS) {
      timer.current && clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        handleStartRecord(false)
      }, 1000 * streamConfig.interval)

      isFirst &&
        toast({
          title: streamConfig.title,
          description: t('error.start_record.not_urls')
        })
      await updateStreamConfig(
        { ...streamConfig, status: StreamStatus.MONITORING },
        streamConfig.title
      )
      return
    }

    const errMessage = errorCodeToI18nMessage(code, 'error.start_record.')

    await updateStreamConfig(
      { ...streamConfig, status: StreamStatus.NOT_STARTED },
      streamConfig.title
    )
    toast({
      title: streamConfig.title,
      description: errMessage,
      variant: 'destructive'
    })
  }

  const handlePlayClick = () => {
    handleStartRecord(true)
  }

  const handlePauseClick = async () => {
    await window.api.stopStreamRecord(streamConfig.title)
    clearTimeout(timer.current)
  }

  return (
    <>
      <div className="flex absolute right-0 gap-2">
        {/* <UseThemeIcon
          className="w-[21px] cursor-pointer"
          dark={darkPreviewIcon}
          light={lightPreviewIcon}
          tooltipContent={t('stream_config.preview')}
        /> */}

        {streamConfig.status === StreamStatus.NOT_STARTED ? (
          <UseThemeIcon
            className="w-[18px] cursor-pointer select-none"
            dark={darkPlayIcon}
            light={lightPlayIcon}
            handleClick={handlePlayClick}
          />
        ) : (
          <UseThemeIcon
            className="w-[20px] cursor-pointer select-none"
            dark={darkPauseIcon}
            light={lightPauseIcon}
            handleClick={handlePauseClick}
          />
        )}
        <UseThemeIcon
          className="w-[20px] cursor-pointer select-none"
          dark={darkSettingIcon}
          light={lightSettingIcon}
          handleClick={() => setSheetOpen(true)}
          tooltipContent={t('stream_config.edit')}
        />
        <UseThemeIcon
          className="w-[20px] cursor-pointer select-none"
          dark={darkDeleteIcon}
          light={lightDeleteIcon}
          handleClick={() => setDeleteDialogOpen(true)}
        />
      </div>

      <StreamConfigSheet
        streamConfig={streamConfig}
        setSheetOpen={setSheetOpen}
        sheetOpen={sheetOpen}
        type="edit"
      />

      <Dialog
        title={t('stream_config.confirm_delete', { title: streamConfig.title })}
        btnText={t('stream_config.delete')}
        dialogOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        handleBtnClick={handleConfirmDelete}
        variant="destructive"
      />
    </>
  )
}
