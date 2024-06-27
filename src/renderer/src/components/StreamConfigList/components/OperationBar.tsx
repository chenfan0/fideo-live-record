import { useTranslation } from 'react-i18next'

import UseThemeIcon from '@/components/UseThemeIcon'
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
import { useState } from 'react'
import DeleteRecordDialog from './DeleteRecordDialog'
import { CRAWLER_ERROR_CODE, SUCCESS_CODE, errorCodeToI18nMessage } from '../../../../../code'
import { useToast } from '@renderer/hooks/useToast'

interface OperationBarProps {
  index: number
}

export default function OperationBar(props: OperationBarProps) {
  let timer: NodeJS.Timeout
  const { index } = props
  const { t } = useTranslation()
  const { toast } = useToast()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const { streamConfigList, removeStreamConfig, updateStreamConfig } = useStreamConfigStore(
    (state) => ({
      streamConfigList: state.streamConfigList,
      removeStreamConfig: state.removeStreamConfig,
      updateStreamConfig: state.updateStreamConfig
    })
  )
  const streamConfig = streamConfigList[index]

  const handleConfirmDelete = () => {
    removeStreamConfig(index)
    setDeleteDialogOpen(false)
  }

  const handleStartRecord = async (isFirst = true) => {
    isFirst &&
      updateStreamConfig({ ...streamConfig, status: StreamStatus.PREPARING_TO_RECORD }, index)

    const { code } = await window.api.startStreamRecord(JSON.stringify(streamConfig))

    console.log('code', code)

    if (code === SUCCESS_CODE) {
      updateStreamConfig({ ...streamConfig, status: StreamStatus.RECORDING }, index)
      toast({
        title: streamConfig.title,
        description: t('start_record')
      })
      return
    }

    if (code === CRAWLER_ERROR_CODE.NOT_URLS) {
      timer && clearTimeout(timer)
      timer = setTimeout(() => {
        handleStartRecord(false)
      }, 1000 * streamConfig.interval)

      isFirst &&
        toast({
          title: streamConfig.title,
          description: t('error.start_record.not_urls')
        })
      updateStreamConfig({ ...streamConfig, status: StreamStatus.MONITORING }, index)
      return
    }

    const errMessage = errorCodeToI18nMessage(code, 'error.start_record.')

    updateStreamConfig({ ...streamConfig, status: StreamStatus.NOT_STARTED }, index)
    toast({
      title: streamConfig.title,
      description: errMessage,
      variant: 'destructive'
    })

    // updateStreamConfig({ ...streamConfig, status: StreamStatus.NOT_STARTED }, index)
    // toast({
    //   title: streamConfig.title,
    //   description: t('record.start_failed'),
    //   variant: 'destructive'
    // })
  }

  const handlePlayClick = () => {
    handleStartRecord(true)
    clearTimeout(timer)
  }

  const handlePauseClick = async () => {
    await window.api.stopStreamRecord(streamConfig.title)
    clearTimeout(timer)
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
          tooltipContent={t('stream_config.edit_record')}
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
        index={index}
        type="edit"
      />

      <DeleteRecordDialog
        title={streamConfig.title}
        dialogOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        handleConfirmDelete={handleConfirmDelete}
      />
    </>
  )
}
