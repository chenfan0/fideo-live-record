import { useMount } from 'react-use'
import StreamConfigCard from './components/StreamConfigCard'

import { useStreamConfigStore } from '@/store/useStreamConfigStore'
import { StreamStatus } from '@renderer/lib/utils'

export default function StreamConfigList() {
  const { streamConfigList } = useStreamConfigStore((state) => state)

  useMount(() => {
    window.api.onStreamRecordEnd(async (title, code) => {
      const { streamConfigList, updateStreamConfig } = useStreamConfigStore.getState()
      const index = streamConfigList.findIndex((streamConfig) => streamConfig.title === title)

      console.log('onStreamRecordEnd', title, code)
      // wip toasts 提示
      if (index === -1) {
        return
      }

      const streamConfig = streamConfigList[index]

      console.log('status:', streamConfig.status)
      if (streamConfig.status === StreamStatus.RECORDING) {
        updateStreamConfig({ ...streamConfig, status: StreamStatus.VIDEO_FORMAT_CONVERSION }, index)
        return
      }

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
