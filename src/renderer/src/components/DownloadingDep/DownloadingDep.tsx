import { useTranslation } from 'react-i18next'

import { Card, CardHeader, CardContent, CardTitle } from '@renderer/shadcn/ui/card'
import { Progress } from '@renderer/shadcn/ui/progress'

import { useDownloadDepInfoStore } from '@/store/useDownloadDepStore'

export default function DownloadingDep() {
  const { t } = useTranslation()

  const { downloadDepProgressInfo } = useDownloadDepInfoStore((state) => state)

  return (
    <div className="fixed top-[0%] left-[0%] right-[0%] bottom-[0%] bg-background">
      <Card className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[50%] ">
        <CardHeader>
          <CardTitle className="font-medium">{t('downloading_dep.title')}</CardTitle>
        </CardHeader>
        {downloadDepProgressInfo.downloading && (
          <CardContent>
            <Progress className=" h-[10px]" value={downloadDepProgressInfo.progress * 100} />
            <div className="mt-4 text-right">
              {(downloadDepProgressInfo.progress * 100).toFixed(2)}%
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
