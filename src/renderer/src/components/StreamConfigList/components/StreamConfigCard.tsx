import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/shadcn/ui/card'
import { Badge } from '@/shadcn/ui/badge'
import Progress from '@/components/StreamConfigList/components/Progress'
import OperationBar from '@/components/StreamConfigList/components/OperationBar'

interface StreamConfigCardProps {
  streamConfig: IStreamConfig
  index: number
}

const streamStatusToLocaleMap = {
  0: 'stream_config.not_started',
  1: 'stream_config.preparing_to_record',
  2: 'stream_config.monitoring',
  3: 'stream_config.recording',
  4: 'stream_config.video_format_conversion'
}

export default function StreamConfigCard({ streamConfig, index }: StreamConfigCardProps) {
  const { t } = useTranslation()
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center relative">
          <div className="flex gap-2 flex-1">
            <h1 className="overflow-hidden whitespace-nowrap text-ellipsis max-w-[30%]">
              {streamConfig.title}
            </h1>
            <Badge variant="outline">{t(streamStatusToLocaleMap[streamConfig.status])}</Badge>
          </div>
          <OperationBar index={index} />
        </CardTitle>
        <CardDescription className="overflow-hidden whitespace-nowrap text-ellipsis max-w-[95%]">
          {t('stream_config.room_url')}:&nbsp;
          <span className=" underline cursor-pointer">{streamConfig.roomUrl}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Progress />
      </CardContent>
    </Card>
  )
}
