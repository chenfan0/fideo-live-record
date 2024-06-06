import { useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shadcn/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shadcn/ui/form'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/shadcn/ui/sheet'
import { Input } from '@/shadcn/ui/input'
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from '@/shadcn/ui/select'
import { useStreamConfigStore } from '@renderer/store/useStreamConfigStore'
import { checkUrlValid } from '@renderer/lib/utils'
import { useDefaultSettingsStore } from '@renderer/store/useDefaultSettingsStore'

const formSchema = z.object({
  directory: z.string(),
  lang: z.string()
})

function validStreamConfigData(
  streamConfigData: IStreamConfig,
  streamConfigList: IStreamConfig[],
  defaultStreamConfigData: IStreamConfig | null,
  validFields = Object.keys(streamConfigData) as (keyof IStreamConfig)[]
): [true] | [false, keyof IStreamConfig, string] {
  const { title, roomUrl, filename, directory, interval, proxy } = streamConfigData

  const validTitleFn = () => {
    if (!title) {
      return [false, 'title', 'stream_config.title_can_not_be_empty']
    }
    if (
      defaultStreamConfigData?.title !== title &&
      streamConfigList.some((item) => item.title === title)
    ) {
      return [false, 'title', 'stream_config.title_already_exists']
    }
    return [true]
  }
  const validRoomUrlFn = () => {
    if (!roomUrl) {
      return [false, 'roomUrl', 'stream_config.room_url_can_not_be_empty']
    }
    if (!checkUrlValid(roomUrl)) {
      return [false, 'roomUrl', 'stream_config.room_url_invalid']
    }
    return [true]
  }
  const validFilenameFn = () => {
    if (!filename) {
      return [false, 'filename', 'stream_config.filename_can_not_be_empty']
    }
    return [true]
  }
  const validDirectoryFn = () => {
    if (!directory) {
      return [false, 'directory', 'stream_config.directory_can_not_be_empty']
    }
    return [true]
  }
  const validIntervalFn = () => {
    if (!interval) {
      return [false, 'interval', 'stream_config.interval_can_not_be_empty']
    }
    if (Number.isNaN(Number(interval))) {
      return [false, 'interval', 'stream_config.interval_must_be_number']
    }
    return [true]
  }
  const validProxyFn = () => {
    if (proxy && !checkUrlValid(proxy)) {
      return [false, 'proxy', 'stream_config.proxy_url_invalid']
    }
    return [true]
  }

  const fieldToValidFnMap = {
    title: validTitleFn,
    roomUrl: validRoomUrlFn,
    filename: validFilenameFn,
    directory: validDirectoryFn,
    interval: validIntervalFn,
    proxy: validProxyFn
    // cookies: () => [true],
    // line: () => [true],
    // status: () => [true],
    // segmentTime: () => [true], // todo
    // roomLines: () => [true]
  }

  for (const validField of validFields) {
    const validFn = fieldToValidFnMap[validField]
    if (!validFn) {
      continue
    }
    const [valid, field, message] = validFn()
    if (!valid) {
      return [valid, field, message]
    }
  }

  return [true]
}

interface StreamConfigSheetProps {
  sheetOpen: boolean
  setSheetOpen: (status: boolean) => void
}

export default function DefaultSettingSheet(props: StreamConfigSheetProps) {
  const { t } = useTranslation()
  const { sheetOpen, setSheetOpen } = props

  const { defaultSettingsConfig, setDefaultSettingsConfig } = useDefaultSettingsStore(
    (state) => state
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...({ ...defaultSettingsConfig } as unknown as Record<string, string | number>)
    }
  })
  // useEffect(() => {
  //   ;(Object.keys(defaultStreamConfig) as (keyof IStreamConfig)[]).forEach((key) =>
  //     form.register(key, {
  //       onBlur: () => {
  //         const formValues = form.getValues()
  //         const [valid] = validStreamConfigData(formValues, streamConfigList, streamConfig, [key])
  //         if (valid) {
  //           form.clearErrors(key)
  //         }
  //       }
  //     })
  //   )
  // }, [])

  const handleSelectDir = async () => {
    const { canceled, filePaths } = await window.api.selectDir()
    if (canceled) {
      return
    }
    form.setValue('directory', filePaths[0])
  }

  const handleSetSheetOpen = async (status: boolean, trigger = false) => {
    const formValues = form.getValues()
    if (trigger) {
      // const [valid, field, message] = validStreamConfigData(
      //   formValues,
      //   streamConfigList,
      //   streamConfig
      // )
      // if (!valid) {
      //   form.clearErrors()
      //   form.setError(field, { type: 'manual', message: t(message) })
      //   form.setFocus(field)
      //   return
      // }
      // if (type === 'edit') {
      //   updateStreamConfig(formValues, index!)
      // } else {
      //   addStreamConfig(formValues)
      // }
    }

    setSheetOpen(status)
    form.reset()
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={(status) => handleSetSheetOpen(status)}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{t('nav_bar.default_setting')}</SheetTitle>
        </SheetHeader>
        <div className="show-scrollbar overflow-y-auto mr-[-14px]">
          <div className=" pl-1 pr-4 pb-2">
            <Form {...form}>
              <form className="space-y-8">
                <FormField
                  control={form.control}
                  name="directory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('stream_config.directory')}</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            placeholder={t('stream_config.directory_placeholder')}
                            {...field}
                            disabled
                          />
                          <Button variant="outline" type="button" onClick={handleSelectDir}>
                            {t('stream_config.select')}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lang"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('stream_config.line')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('stream_config.line_placeholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="cn">中文</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        </div>
        <SheetFooter>
          <Button variant="secondary" onClick={() => handleSetSheetOpen(false, true)}>
            {t('stream_config.confirm')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
