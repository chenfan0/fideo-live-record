import { useMemo } from 'react'
import { useMount } from 'react-use'
import { useTranslation } from 'react-i18next'

import StreamConfigCard from './components/StreamConfigCard'

import {
  SUCCESS_CODE,
  FFMPEG_ERROR_CODE,
  errorCodeToI18nMessage,
  UNKNOWN_CODE
} from '../../../../code'
import emitter from '@/lib/bus'
import { RECORD_END_NOT_USER_STOP } from '../../../../const'

import { useStreamConfigStore } from '@/store/useStreamConfigStore'
import { useDefaultSettingsStore } from '@renderer/store/useDefaultSettingsStore'
import { useNavSelectedStatusStore } from '@renderer/store/useNavSelectedStatusStore'
import { useFfmpegProgressInfoStore } from '@/store/useFfmpegProgressInfoStore'
import { StreamStatus, useXizhiToPushNotification } from '@renderer/lib/utils'
import { useToast } from '@renderer/hooks/useToast'

const unknownErrorRetryTimesMap: Record<string, number> = {}

const maxRetryTimes = 3
const alreadyCallbackOneTimeSet = new Set()

export default function StreamConfigList() {
  const navSelectedStatus = useNavSelectedStatusStore((state) => state.navSelectedStatus)
  const { streamConfigList } = useStreamConfigStore((state) => ({
    streamConfigList: state.streamConfigList
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

  useMount(() => {
    window.api.onFFmpegProgressInfo((progressInfo) => {
      updateFfmpegProgressInfo(progressInfo)
    })

    window.api.onStreamRecordEnd(async (title, code, errMsg) => {
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
      const isStopByResolutionChange = code === FFMPEG_ERROR_CODE.RESOLUTION_CHANGE

      let message = ''

      if (isStopByUser) {
        message = 'user_stop_record'
      }

      if (isStopByStreamEnd) {
        message = 'stream_end_stop_record'
      }

      // 用户在获取直播地址时点击停止录制或者在监控中点击停止录制
      if (
        isStopByUser &&
        (streamConfig.status === StreamStatus.PREPARING_TO_RECORD ||
          streamConfig.status === StreamStatus.MONITORING)
      ) {
        await updateStreamConfig(
          { ...streamConfig, status: StreamStatus.NOT_STARTED },
          streamConfig.title
        )

        toast({
          title: streamConfig.title,
          description: code === UNKNOWN_CODE ? t(message) + errMsg : t(message)
        })
        return
      }

      /**
       * 当录制过程出现错误，直播结束或者用户手动停止
       * 会回调两次该函数，第一次是开始转换为mp4文件之前，第二次是转换后
       */

      if (!alreadyCallbackOneTimeSet.has(title)) {
        alreadyCallbackOneTimeSet.add(title)

        // 第一次回调，除了当前状态是录制中并且需要转换为mp4文件的情况需要进行处理，其他情况都不需要处理
        if (streamConfig.status === StreamStatus.RECORDING && streamConfig.convertToMP4) {
          await updateStreamConfig(
            { ...streamConfig, status: StreamStatus.VIDEO_FORMAT_CONVERSION },
            streamConfig.title
          )
        }
        return
      }

      // 第二次回调，删除当前title
      alreadyCallbackOneTimeSet.delete(title)

      unknownErrorRetryTimesMap[title] = unknownErrorRetryTimesMap[title] || 0
      unknownErrorRetryTimesMap[title] += 1

      if (!message) {
        message = errorCodeToI18nMessage(code, 'error.stop_record.')
      }

      toast({
        title: streamConfig.title,
        description: code === UNKNOWN_CODE ? t(message) + errMsg : t(message)
      })
      if (!isStopByUser && xiZhiKey) {
        useXizhiToPushNotification({
          key: xiZhiKey,
          title: streamConfig.title,
          content: code === UNKNOWN_CODE ? t(message) + '\n' + errMsg : t(message)
        })
      }

      await updateStreamConfig(
        { ...streamConfig, status: StreamStatus.NOT_STARTED },
        streamConfig.title
      )

      if (isStopByUser || unknownErrorRetryTimesMap[title] >= maxRetryTimes) {
        unknownErrorRetryTimesMap[title] = 0
        return
      }

      if (isStopByResolutionChange || isStopByStreamEnd) {
        unknownErrorRetryTimesMap[title] = 0
      }

      emitter.emit(RECORD_END_NOT_USER_STOP, streamConfig.title)
    })
  })

  return (
    <>
      {
        <div className="show-scrollbar flex flex-col gap-[12px] p-[24px] overflow-y-auto h-[calc(100vh-80px)]">
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
    </>
  )
}
