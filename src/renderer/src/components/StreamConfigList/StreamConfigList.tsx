import { useMemo, useState } from 'react'
import { useMount } from 'react-use'
import { useTranslation } from 'react-i18next'

import Dialog from '@/components/Dialog'
import StreamConfigCard from './components/StreamConfigCard'

import { SUCCESS_CODE, FFMPEG_ERROR_CODE, errorCodeToI18nMessage } from '../../../../code'
import emitter from '@/lib/bus'
import { RECORD_END_NOT_USER_STOP } from '../../../../const'

import { useStreamConfigStore } from '@/store/useStreamConfigStore'
import { useDefaultSettingsStore } from '@renderer/store/useDefaultSettingsStore'
import { useNavSelectedStatusStore } from '@renderer/store/useNavSelectedStatusStore'
import { useFfmpegProgressInfoStore } from '@/store/useFfmpegProgressInfoStore'
import { StreamStatus, useXizhiToPushNotification } from '@renderer/lib/utils'
import { useToast } from '@renderer/hooks/useToast'

export default function StreamConfigList() {
  const [closeWindowDialogOpen, setCloseWindowDialogOpen] = useState(false)

  const navSelectedStatus = useNavSelectedStatusStore((state) => state.navSelectedStatus)
  const { streamConfigList, updateStreamConfig } = useStreamConfigStore((state) => ({
    streamConfigList: state.streamConfigList,
    updateStreamConfig: state.updateStreamConfig
  }))
  const selectedStreamConfigTitleList = useMemo(() => {
    if (navSelectedStatus === '-1') {
      return streamConfigList.map((stream) => stream.title)
    }
    return streamConfigList
      .filter((streamConfig) => streamConfig.status === Number(navSelectedStatus))
      .map((stream) => stream.title)
  }, [streamConfigList, navSelectedStatus])

  const { updateFfmpegProgressInfo } = useFfmpegProgressInfoStore((state) => state)
  const { toast } = useToast()
  const { t } = useTranslation()

  const handleForceCloseWindow = async () => {
    setCloseWindowDialogOpen(false)

    for (const streamConfig of streamConfigList) {
      if (streamConfig.status !== StreamStatus.NOT_STARTED) {
        await updateStreamConfig(
          { ...streamConfig, status: StreamStatus.NOT_STARTED },
          streamConfig.title
        )
      }
    }

    window.api.forceCloseWindow()
  }

  useMount(() => {
    window.api.onFFmpegProgressInfo((progressInfo) => {
      updateFfmpegProgressInfo(progressInfo)
    })

    window.api.onStreamRecordEnd(async (title, code) => {
      const { streamConfigList, updateStreamConfig } = useStreamConfigStore.getState()
      const xiZhiKey = useDefaultSettingsStore.getState().defaultSettingsConfig.xizhiKey
      const index = streamConfigList.findIndex((streamConfig) => streamConfig.title === title)

      if (index === -1) {
        return
      }

      const streamConfig = streamConfigList[index]
      // SUCCESS_CODE  stop by stream end
      // FFMPEG_ERROR_CODE.USER_KILL_PROCESS stop by user
      const isStopByUser = code === FFMPEG_ERROR_CODE.USER_KILL_PROCESS
      const isStopByStreamEnd = code === SUCCESS_CODE
      let stopWithLineError = false

      if (streamConfig.status === StreamStatus.RECORDING) {
        await updateStreamConfig(
          { ...streamConfig, status: StreamStatus.VIDEO_FORMAT_CONVERSION },
          streamConfig.title
        )
        return
      }

      let message = ''

      if (isStopByUser) {
        message = 'user_stop_record'
      }

      if (isStopByStreamEnd) {
        message = 'stream_end_stop_record'
      }

      if (!isStopByUser) {
        const { code, liveUrls } = await window.api.getLiveUrls({
          roomUrl: streamConfig.roomUrl,
          proxy: streamConfig.proxy,
          cookie: streamConfig.cookie
        })
        if (code === SUCCESS_CODE && liveUrls[Number(streamConfig.line)]) {
          // if not stop by user and still can get live urls
          // mean the stream can no be record, hint change the stream line
          message = 'error.stop_record.current_line_error'
          stopWithLineError = true
        } else {
          // mean the stream is not live
          // start monitor the stream
          message = 'stream_end_stop_record'
        }
      }

      if (!message) {
        message = errorCodeToI18nMessage(code, 'error.stop_record.')
      }

      toast({
        title: streamConfig.title,
        description: t(message)
      })
      if (!isStopByUser && xiZhiKey) {
        useXizhiToPushNotification({
          key: xiZhiKey,
          title: streamConfig.title,
          content: t(message)
        })
      }

      await updateStreamConfig(
        { ...streamConfig, status: StreamStatus.NOT_STARTED },
        streamConfig.title
      )

      if (isStopByUser || stopWithLineError) {
        return
      }

      emitter.emit(RECORD_END_NOT_USER_STOP, streamConfig.title)
    })

    window.api.onUserCloseWindow(() => {
      const { streamConfigList } = useStreamConfigStore.getState()

      const stillWorkStream = streamConfigList.find(
        (streamConfig) => streamConfig.status !== StreamStatus.NOT_STARTED
      )
      if (!stillWorkStream) {
        window.api.forceCloseWindow()
        return
      }
      setCloseWindowDialogOpen(true)
    })
  })

  return (
    <>
      {
        <div className="stream-config-list flex flex-col gap-[12px] p-[24px] overflow-y-auto h-[calc(100vh-80px)]">
          {streamConfigList.map((streamConfig) => (
            <div
              key={streamConfig.title}
              className={selectedStreamConfigTitleList.includes(streamConfig.title) ? '' : 'hidden'}
            >
              <StreamConfigCard streamConfig={streamConfig} />
            </div>
          ))}
        </div>
      }
      <Dialog
        title={t('stream_config.confirm_force_close_window')}
        btnText={t('stream_config.confirm')}
        dialogOpen={closeWindowDialogOpen}
        onOpenChange={setCloseWindowDialogOpen}
        variant="default"
        handleBtnClick={handleForceCloseWindow}
      />
    </>
  )
}
