import { useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'

import { errorCodeToI18nMessage, SUCCESS_CODE } from '../../../code'

import { useToast } from '@/hooks/useToast'
import { Button } from '@/shadcn/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shadcn/ui/form'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/shadcn/ui/sheet'
import { Input } from '@/shadcn/ui/input'
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from '@/shadcn/ui/select'
import { Switch } from '@/shadcn/ui/switch'
import { useStreamConfigStore } from '@renderer/store/useStreamConfigStore'
import { useDefaultSettingsStore } from '@renderer/store/useDefaultSettingsStore'
import { checkUrlValid } from '@renderer/lib/utils'

const formSchema = z.object({
  title: z.string(),
  roomUrl: z.string(),
  filename: z.string(),
  directory: z.string(),
  interval: z.number(),
  line: z.string(),
  status: z.number(),
  segmentTime: z.string(),
  cookie: z.string(),
  proxy: z.string(),
  liveUrls: z.array(z.string()),
  convertToMP4: z.boolean()
})

const defaultStreamConfig: IStreamConfig = {
  title: '',
  roomUrl: '',
  filename: '',
  directory: '',
  status: 0,
  line: '0',
  interval: 30,
  cookie: '',
  proxy: '',
  liveUrls: [],
  segmentTime: '',
  convertToMP4: true
}

function validStreamConfigData(
  streamConfigData: IStreamConfig,
  streamConfigList: IStreamConfig[],
  defaultStreamConfigData: IStreamConfig | null,
  validFields = Object.keys(streamConfigData) as (keyof IStreamConfig)[]
): [true] | [false, keyof IStreamConfig, string] {
  const { title, roomUrl, filename, directory, interval, proxy, segmentTime } = streamConfigData

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
    if (Number(interval) < 20) {
      return [false, 'interval', 'stream_config.interval_must_be_greater_than_20']
    }
    return [true]
  }
  const validProxyFn = () => {
    if (proxy && !checkUrlValid(proxy)) {
      return [false, 'proxy', 'stream_config.proxy_url_invalid']
    }
    return [true]
  }

  const validSegmentTimeFn = () => {
    if (segmentTime === '') {
      return [true]
    }
    if (Number.isNaN(Number(segmentTime))) {
      return [false, 'segmentTime', 'stream_config.segment_time_must_be_number']
    }
    if (Number(segmentTime) <= 0) {
      return [false, 'segmentTime', 'stream_config.segment_time_must_be_greater_than_0']
    }
    return [true]
  }

  const fieldToValidFnMap = {
    title: validTitleFn,
    roomUrl: validRoomUrlFn,
    filename: validFilenameFn,
    directory: validDirectoryFn,
    interval: validIntervalFn,
    proxy: validProxyFn,
    segmentTime: validSegmentTimeFn
    // cookie: () => [true],
    // line: () => [true],
    // status: () => [true],
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
  streamConfig: IStreamConfig | null
  type: 'create' | 'edit'
}

export default function StreamConfigSheet(props: StreamConfigSheetProps) {
  const { t } = useTranslation()
  const { toast } = useToast()

  const defaultSettingsConfig = useDefaultSettingsStore((state) => state.defaultSettingsConfig)
  const { streamConfigList, addStreamConfig, updateStreamConfig } = useStreamConfigStore(
    (state) => state
  )
  const { sheetOpen, setSheetOpen, type, streamConfig } = props
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...({
        ...defaultStreamConfig,
        directory: defaultSettingsConfig.directory,
        ...streamConfig
      } as unknown as Record<string, string | number>)
    }
  })
  const [liveUrls, setLiveUrls] = useState(form.getValues('liveUrls'))

  useEffect(() => {
    ;(Object.keys(defaultStreamConfig) as (keyof IStreamConfig)[]).forEach((key) =>
      form.register(key, {
        onBlur: () => {
          const formValues = form.getValues()
          const [valid] = validStreamConfigData(formValues, streamConfigList, streamConfig, [key])
          if (valid) {
            form.clearErrors(key)
          }
        }
      })
    )
  }, [])
  useEffect(() => {
    form.reset({
      ...defaultStreamConfig,
      directory: defaultSettingsConfig.directory,
      ...streamConfig
    })
  }, [streamConfig, defaultSettingsConfig.directory])

  const handleSelectDir = async () => {
    const { canceled, filePaths } = await window.api.selectDir()
    if (canceled) {
      return
    }
    form.setValue('directory', filePaths[0])
  }

  const handleGetLiveUrls = async (openStatus: boolean) => {
    if (!openStatus) return
    setLiveUrls([])
    const { code, liveUrls } = await window.api.getLiveUrls({
      roomUrl: form.getValues('roomUrl'),
      cookie: form.getValues('cookie'),
      proxy: form.getValues('proxy')
    })

    if (code !== SUCCESS_CODE) {
      toast({
        title: form.getValues('title'),
        description: t(errorCodeToI18nMessage(code, 'error.get_line.')),
        variant: 'destructive'
      })
      return
    }
    setLiveUrls(liveUrls)
  }

  const handleSetSheetOpen = async (status: boolean, trigger = false) => {
    const formValues = form.getValues()
    if (trigger) {
      const [valid, field, message] = validStreamConfigData(
        formValues,
        streamConfigList,
        streamConfig
      )
      if (!valid) {
        form.clearErrors()
        form.setError(field, { type: 'manual', message: t(message) })
        form.setFocus(field)
        return
      }
      formValues.liveUrls = liveUrls
      if (type === 'edit') {
        await updateStreamConfig(formValues, formValues.title)
      } else {
        await addStreamConfig(formValues)
      }
    }

    setSheetOpen(status)
    form.reset()
    setLiveUrls([])
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={(status) => handleSetSheetOpen(status)}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>
            {type === 'create' ? t('stream_config.create') : t('stream_config.edit')}
          </SheetTitle>
        </SheetHeader>
        <div className="show-scrollbar overflow-y-auto mr-[-14px]">
          <div className=" pl-1 pr-4 pb-2">
            <Form {...form}>
              <form className="space-y-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>{t('stream_config.title')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('stream_config.title_placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="roomUrl"
                  render={({ field }) => (
                    <FormItem className=" mt-4">
                      <FormLabel>{t('stream_config.room_url')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('stream_config.room_url_placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="line"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('stream_config.line')}</FormLabel>
                      <Select
                        onOpenChange={handleGetLiveUrls}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('stream_config.line_placeholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {liveUrls.length > 0 ? (
                            liveUrls.map((_, index) => (
                              <SelectItem key={index} value={String(index)}>
                                {t('stream_config.line')} {index + 1}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem disabled value="loading">
                              {t('stream_config.loading')}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="convertToMP4"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('stream_config.should_convert_to_mp4')}</FormLabel>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="flex"
                      />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="filename"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('stream_config.filename')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('stream_config.filename_placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                  name="interval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('stream_config.interval')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('stream_config.interval_placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="segmentTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('stream_config.segment_time')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('stream_config.segment_time_placeholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="proxy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('stream_config.proxy')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('stream_config.proxy_placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cookie"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('stream_config.cookie')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('stream_config.cookie_placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
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
