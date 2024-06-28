import { useMount } from 'react-use'
import StreamConfigCard from './components/StreamConfigCard'

import { SUCCESS_CODE, FFMPEG_ERROR_CODE, errorCodeToI18nMessage } from '../../../../code'

import { useStreamConfigStore } from '@/store/useStreamConfigStore'
import { useFfmpegProgressInfoStore } from '@/store/useFfmpegProgressInfoStore'
import { StreamStatus } from '@renderer/lib/utils'
import { useToast } from '@renderer/hooks/useToast'
import { useTranslation } from 'react-i18next'

export default function StreamConfigList() {
  const { streamConfigList } = useStreamConfigStore((state) => state)
  const { updateFfmpegProgressInfo } = useFfmpegProgressInfoStore((state) => state)
  const { toast } = useToast()
  const { t } = useTranslation()

  useMount(() => {
    window.api.onFFmpegProgressInfo((progressInfo) => {
      console.log('onFFmpegProgressInfo', progressInfo)
      updateFfmpegProgressInfo(progressInfo)
    })

    window.api.onStreamRecordEnd(async (title, code) => {
      const { streamConfigList, updateStreamConfig } = useStreamConfigStore.getState()
      const index = streamConfigList.findIndex((streamConfig) => streamConfig.title === title)

      console.log('onStreamRecordEnd', title, code)
      if (index === -1) {
        return
      }

      const streamConfig = streamConfigList[index]
      // SUCCESS_CODE  stop by stream end
      // FFMPEG_ERROR_CODE.USER_KILL_PROCESS stop by user
      const isStopByUser = code === FFMPEG_ERROR_CODE.USER_KILL_PROCESS
      const isStopByStreamEnd = code === SUCCESS_CODE

      console.log('status:', streamConfig.status)
      if (streamConfig.status === StreamStatus.RECORDING) {
        updateStreamConfig({ ...streamConfig, status: StreamStatus.VIDEO_FORMAT_CONVERSION }, index)
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

      updateStreamConfig({ ...streamConfig, status: StreamStatus.NOT_STARTED }, index)
    })
  })

  return (
    <>
      {
        <div className="stream-config-list flex flex-col gap-[12px] p-[24px] overflow-y-auto h-[calc(100vh-80px)]">
          {streamConfigList.map((streamConfig, index) => (
            <StreamConfigCard key={streamConfig.title} streamConfig={streamConfig} index={index} />
          ))}
        </div>
      }
    </>
  )
}
