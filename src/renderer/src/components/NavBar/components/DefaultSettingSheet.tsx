import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shadcn/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shadcn/ui/form'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/shadcn/ui/sheet'
import { Input } from '@/shadcn/ui/input'
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from '@/shadcn/ui/select'
import { useDefaultSettingsStore } from '@renderer/store/useDefaultSettingsStore'
import { useEffect } from 'react'

const formSchema = z.object({
  directory: z.string(),
  lang: z.string()
})

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
      ...{ ...defaultSettingsConfig }
    }
  })

  useEffect(() => {
    form.reset({ ...defaultSettingsConfig })
  }, [defaultSettingsConfig])

  const handleSelectDir = async () => {
    const { canceled, filePaths } = await window.api.selectDir()
    if (canceled) {
      return
    }
    form.setValue('directory', filePaths[0])
  }

  const handleSetSheetOpen = async (status: boolean, trigger = false) => {
    const formValues = form.getValues() as IDefaultDefaultSettingsConfig
    if (trigger) {
      console.log('trigger', formValues)
      setDefaultSettingsConfig(formValues)
    }

    setSheetOpen(status)
    form.reset()
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={(status) => handleSetSheetOpen(status)}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{t('default_settings.title')}</SheetTitle>
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
                      <FormLabel>{t('default_settings.directory')}</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            placeholder={t('default_settings.directory_placeholder')}
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
                      <FormLabel>{t('default_settings.language')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('default_settings.language_placeholder')} />
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
