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

const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.'
  }),
  roomUrl: z.string().url({
    message: 'Room URL must be a valid URL.'
  }),
  cookies: z.string().optional(),
  proxy: z.string().optional(),
  filename: z.string(),
  directory: z.string(),
  interval: z
    .number({
      message: 'Interval must be a number.'
    })
    .optional(),
  line: z.string(),
  status: z.number(),
  segmentTime: z.number().optional()
})

interface StreamConfigSheetProps {
  sheetOpen: boolean
  setSheetOpen: (status: boolean) => void
  streamConfig?: IStreamConfig
  type: 'create' | 'edit'
}

const defaultStreamConfig: IStreamConfig = {
  title: '',
  roomUrl: '',
  filename: '',
  saveDirectoryPath: '',
  status: 0,
  line: '0',
  interval: 30,
  cookie: '',
  proxy: ''
}

export default function StreamConfigSheet(props: StreamConfigSheetProps) {
  const { t } = useTranslation()
  const { sheetOpen, setSheetOpen, streamConfig = { ...defaultStreamConfig }, type } = props
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...(streamConfig as unknown as Record<string, string | number>)
    }
  })
  useEffect(() => {
    ;(['roomUrl', 'line', 'interval'] as const).forEach((key) => {
      form.register(key, {
        onBlur: () => form.trigger(key),
        onChange: () => form.trigger(key)
      })
    })
  }, [])

  const handleSetSheetOpen = async (status: boolean) => {
    if (status === true) {
      const valid = await form.trigger()
      if (!valid) return
    }
    setSheetOpen(status)
    form.reset()
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={handleSetSheetOpen}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>
            {type === 'create' ? t('stream_config.create') : t('stream_config.edit')}
          </SheetTitle>
        </SheetHeader>{' '}
        <div className="show-scrollbar overflow-y-auto mr-[-14px]">
          <div className=" pl-1 pr-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('stream_config.line_placeholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="3">m@example.com</SelectItem>
                          <SelectItem value="1">m@google.com</SelectItem>
                          <SelectItem value="2">m@support.com</SelectItem>
                        </SelectContent>
                      </Select>
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
                          <Button variant="outline" type="button">
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
                  name="cookies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('stream_config.cookies')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('stream_config.cookies_placeholder')} {...field} />
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
          <Button variant="secondary" onClick={() => handleSetSheetOpen(true)}>
            {t('stream_config.confirm')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
