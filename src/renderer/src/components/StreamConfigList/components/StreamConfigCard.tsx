import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/shadcn/ui/card'
import { MoveCardDropdownMenu } from './MoveCardDropDownMenu'
import { Badge } from '@/shadcn/ui/badge'
import Progress from '@/components/StreamConfigList/components/Progress'
import OperationBar from '@/components/StreamConfigList/components/OperationBar'
import { StreamStatus } from '@renderer/lib/utils'
import { useFfmpegProgressInfoStore } from '@renderer/store/useFfmpegProgressInfoStore'

import { useNavSelectedStatusStore } from '@renderer/store/useNavSelectedStatusStore'

interface StreamConfigCardProps {
  streamConfig: IStreamConfig
}

const streamStatusToLocaleMap = {
  0: 'stream_config.not_started',
  1: 'stream_config.preparing_to_record',
  2: 'stream_config.monitoring',
  3: 'stream_config.recording',
  4: 'stream_config.video_format_conversion'
}

export default function StreamConfigCard({ streamConfig }: StreamConfigCardProps) {
  const { t } = useTranslation()
  const ffmpegProgressInfo = useFfmpegProgressInfoStore((state) => state.ffmpegProgressInfo)
  const navSelectedStatus = useNavSelectedStatusStore((state) => state.navSelectedStatus)

  const handleRoomUrlClick = () => {
    window.api.navByDefaultBrowser(streamConfig.roomUrl)
  }

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="flex items-center relative">
          <div className="flex gap-2 flex-1">
            <h1 className="overflow-hidden whitespace-nowrap text-ellipsis max-w-[30%]">
              {streamConfig.title}
            </h1>
            {streamConfig.status !== StreamStatus.NOT_STARTED && (
              <Badge variant="outline">{t(streamStatusToLocaleMap[streamConfig.status])}</Badge>
            )}
          </div>
          <OperationBar streamConfig={streamConfig} />
        </CardTitle>
        <CardDescription className="overflow-hidden whitespace-nowrap text-ellipsis max-w-[95%]">
          {t('stream_config.room_url')}:&nbsp;
          <span className=" underline cursor-pointer" onClick={handleRoomUrlClick}>
            {streamConfig.roomUrl}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Progress animate={streamConfig.status !== StreamStatus.NOT_STARTED} />
        <div className="mt-2 h-[20px] flex gap-16">
          {ffmpegProgressInfo[streamConfig.title] && (
            <>
              <div>{ffmpegProgressInfo[streamConfig.title]?.timemark}</div>
              <div>
                {(streamConfig.segmentTime === '0' || streamConfig.segmentTime === '') &&
                  ffmpegProgressInfo[streamConfig.title].targetSize / 1024 + 'M'}
              </div>
            </>
          )}
        </div>

        {navSelectedStatus === '-1' && <MoveCardDropdownMenu streamConfig={streamConfig} />}
      </CardContent>
    </Card>
  )
}
