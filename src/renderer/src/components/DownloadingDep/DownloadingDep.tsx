import { useTranslation } from 'react-i18next'

import { Card, CardHeader, CardContent, CardTitle, CardFooter } from '@renderer/shadcn/ui/card'
import { Progress } from '@renderer/shadcn/ui/progress'

import { useDownloadDepInfoStore } from '@/store/useDownloadDepStore'
import { Button } from '@renderer/shadcn/ui/button'

export default function DownloadingDep() {
  const { t } = useTranslation()

  const { downloadDepProgressInfo, updateUpdateDownloadProgressInfo } = useDownloadDepInfoStore(
    (state) => state
  )

  const handleRetryDownloadDep = () => {
    updateUpdateDownloadProgressInfo({
      title: '',
      showRetry: false,
      downloading: true,
      progress: 0
    })
    window.api.retryDownloadDep()
  }

  return (
    <div className="fixed top-[0%] left-[0%] right-[0%] bottom-[0%] bg-background opacity-[95%]">
      <Card className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[50%] ">
        <CardHeader>
          <CardTitle className="font-medium">
            {downloadDepProgressInfo.showRetry
              ? t('downloading_dep.retry_title')
              : t('downloading_dep.downloading_title', {
                  title: downloadDepProgressInfo.title
                })}
          </CardTitle>
        </CardHeader>
        {downloadDepProgressInfo.downloading && (
          <CardContent>
            <Progress className=" h-[10px]" value={downloadDepProgressInfo.progress * 100} />
            <div className="mt-4 text-right">
              {(downloadDepProgressInfo.progress * 100).toFixed(2)}%
            </div>
          </CardContent>
        )}
        {downloadDepProgressInfo.showRetry && (
          <CardFooter className="flex justify-end">
            <Button onClick={handleRetryDownloadDep}>{t('downloading_dep.retry')}</Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
