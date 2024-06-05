import StreamConfigCard from './components/StreamConfigCard'

import { useStreamConfigStore } from '@/store/useStremConfigStore'

export default function StreamConfigList() {
  const streamConfigList = useStreamConfigStore((state) => state.streamConfigList)
  console.log(streamConfigList)
  return (
    <div className="stream-config-list flex flex-col gap-[12px] p-[24px] overflow-y-auto h-[calc(100vh-80px)]">
      <StreamConfigCard />
      <StreamConfigCard />
      <StreamConfigCard />
      <StreamConfigCard />
      <StreamConfigCard />
      <StreamConfigCard />
      <StreamConfigCard />
    </div>
  )
}
