import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import validator from 'validator'

import { Button } from '@/shadcn/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shadcn/ui/form'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/shadcn/ui/sheet'
import { Input } from '@/shadcn/ui/input'
import { Switch } from '@/shadcn/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shadcn/ui/tooltip'
import {
  Dialog as ShadcnDialog,
  DialogContent as ShadcnDialogContent,
  DialogHeader as ShadcnDialogHeader,
  DialogTitle as ShadcnDialogTitle
} from '@/shadcn/ui/dialog'
import { useWebControlSettingStore } from '@/store/useWebControlSettingStore'
import { useStreamConfigStore } from '@/store/useStreamConfigStore'
import { useLoadingStore } from '@/store/useLoadingStore'
import { useConfettiStore } from '@/store/useConfettiStore'
import { useToast } from '@/hooks/useToast'
import { closeWebSocket, createWebSocket, sendMessage, WebSocketMessageType } from '@/lib/websocket'

const formSchema = z.object({
  webControlPath: z.string(),
  enableWebControl: z.boolean(),
  email: z.string()
})

interface StreamConfigSheetProps {
  sheetOpen: boolean
  setSheetOpen: (status: boolean) => void
}

const initialTitle = 'Fideo网页访问激活码(一个月)'
const initialMoney = 9.99

let intervalCheckOrderStatusTimer: NodeJS.Timeout | null = null

export default function WebControlSettingSheet(props: StreamConfigSheetProps) {
  const { t } = useTranslation()
  const { setLoading } = useLoadingStore()
  const { setShowConfetti } = useConfettiStore()
  const { sheetOpen, setSheetOpen } = props

  const { webControlSetting, setWebControlSetting } = useWebControlSettingStore((state) => state)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [qrcode, setQrcode] = useState('')
  const [title, setTitle] = useState(initialTitle)
  const [money, setMoney] = useState(initialMoney)

  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...webControlSetting
    }
  })

  useEffect(() => {
    form.reset({ ...webControlSetting })
  }, [webControlSetting])

  useEffect(() => {
    window.api.onFrpcProcessError((err) => {
      toast({
        title: t('web_control_setting.frpc_process_error'),
        description: err,
        variant: 'destructive'
      })
      setWebControlSetting({ ...form.getValues(), enableWebControl: false })
      closeWebSocket()
    })
  }, [])

  const handleSetSheetOpen = async (status: boolean, trigger = false) => {
    const formValues = form.getValues() as IWebControlSetting
    if (trigger) {
      setWebControlSetting(formValues)
    }

    setQrcode('')
    setSheetOpen(status)
    form.reset()
  }

  const handleClosePayingDialog = (status: boolean) => {
    setDialogOpen(status)
    if (!status) {
      if (intervalCheckOrderStatusTimer) {
        clearTimeout(intervalCheckOrderStatusTimer)
      }

      setQrcode('')
      setTitle(initialTitle)
      setMoney(initialMoney)
    }
  }

  function intervalCheckOrderStatus(orderId: number) {
    fetch('https://api-web-control.fideo.site/api/pay/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orderId
      })
    }).then((res) => {
      res
        .json()
        .then(({ code, data: webControlPath }) => {
          // 这里的code是200，表示支付成功
          if (code === 200) {
            form.setValue('webControlPath', webControlPath)
            setWebControlSetting(form.getValues())
            setDialogOpen(false)
            setShowConfetti(true)
            toast({
              title: t('web_control_setting.get_web_control_path_success'),
              description: t('web_control_setting.get_web_control_path_success_desc')
            })
          } else {
            if (intervalCheckOrderStatusTimer) {
              clearTimeout(intervalCheckOrderStatusTimer)
            }

            intervalCheckOrderStatusTimer = setTimeout(() => {
              intervalCheckOrderStatus(orderId)
            }, 1000)
          }
        })
        .catch(() => {
          if (intervalCheckOrderStatusTimer) {
            clearTimeout(intervalCheckOrderStatusTimer)
          }

          intervalCheckOrderStatusTimer = setTimeout(() => {
            intervalCheckOrderStatus(orderId)
          }, 1000)
        })
    })
  }

  const handleGetWebControlPath = async () => {
    const email = form.getValues('email')
    if (!email) {
      form.setError('email', { message: t('web_control_setting.email_required') })
      return
    }

    if (!validator.isEmail(email)) {
      form.setError('email', { message: t('web_control_setting.email_invalid') })
      return
    }

    form.clearErrors('email')
    setLoading(true)

    try {
      const res = await fetch('https://api-web-control.fideo.site/api/pay/wx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email
        })
      })
      const { code, data } = (await res.json()) as {
        code: number
        data: { orderId: number; qrcode: string; title: string; money: number }
      }

      if (code !== 200) {
        toast({
          title: t('web_control_setting.get_web_control_path_failed'),
          description: t('web_control_setting.get_web_control_path_failed_desc'),
          variant: 'destructive'
        })
        return
      }
      const { orderId, qrcode, title, money } = data

      setQrcode(qrcode)
      setTitle(title)
      setMoney(money)

      setDialogOpen(true)
      intervalCheckOrderStatusTimer = setTimeout(() => {
        intervalCheckOrderStatus(orderId)
      }, 2000)
    } catch (error) {
      console.error(error)

      setDialogOpen(false)
      setLoading(false)
      setTitle(initialTitle)
      setMoney(initialMoney)
      toast({
        title: t('web_control_setting.get_web_control_path_failed'),
        description: t('web_control_setting.get_web_control_path_failed_desc'),
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleWebControl = async (status: boolean, field: any) => {
    form.clearErrors('webControlPath')
    if (status) {
      if (!form.getValues('webControlPath')) {
        form.setError('webControlPath', {
          message: t('web_control_setting.web_control_path_required')
        })
        return
      }
      setLoading(true)
      const webControlPath = form.getValues('webControlPath')
      const { status: startStatus, code, port } = await window.api.startFrpcProcess(webControlPath)

      if (startStatus) {
        field.onChange(status)
        createWebSocket(port!, code!)
        sendMessage({
          type: WebSocketMessageType.UPDATE_STREAM_CONFIG_LIST,
          data: useStreamConfigStore.getState().streamConfigList
        })
        setWebControlSetting(form.getValues())
      }

      toast({
        title: startStatus
          ? t('web_control_setting.start_web_control_success')
          : t('web_control_setting.start_web_control_failed'),
        description: startStatus
          ? t('web_control_setting.start_web_control_success_desc')
          : t('web_control_setting.start_web_control_failed_desc'),
        variant: startStatus ? 'default' : 'destructive'
      })
    } else {
      window.api.stopFrpcProcess()
      field.onChange(status)
      setWebControlSetting(form.getValues())

      toast({
        title: t('web_control_setting.stop_web_control_success'),
        description: t('web_control_setting.stop_web_control_success_desc')
      })

      closeWebSocket()
    }
    setLoading(false)
  }

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={(status) => handleSetSheetOpen(status)}>
        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle>{t('web_control_setting.title')}</SheetTitle>
          </SheetHeader>
          <div className="show-scrollbar overflow-y-auto mr-[-14px]">
            <div className=" pl-1 pr-4 pb-2">
              <Form {...form}>
                <form className="space-y-8">
                  <FormField
                    control={form.control}
                    name="webControlPath"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('web_control_setting.web_control_path')}</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              placeholder={t('web_control_setting.web_control_path_placeholder')}
                              {...field}
                            />
                            <Button
                              variant="outline"
                              type="button"
                              onClick={handleGetWebControlPath}
                            >
                              {t('web_control_setting.get_web_control_path')}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('web_control_setting.email')}</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              placeholder={t('web_control_setting.email_placeholder')}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="enableWebControl"
                    render={({ field }) => (
                      <FormItem>
                        <TooltipProvider delayDuration={400}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <FormLabel className=" cursor-pointer">
                                {t('web_control_setting.enable_web_control')}
                              </FormLabel>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-[400px]">
                                {t('web_control_setting.enable_web_control_tooltip')}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(status) => handleToggleWebControl(status, field)}
                          className="flex"
                        />
                      </FormItem>
                    )}
                  />
                  {form.getValues('enableWebControl') && form.getValues('webControlPath') && (
                    <FormField
                      control={form.control}
                      name="enableWebControl"
                      render={() => (
                        <FormItem>
                          <FormLabel>{t('web_control_setting.web_control_address')}</FormLabel>

                          <FormControl>
                            <TooltipProvider delayDuration={400}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="overflow-hidden  text-ellipsis text-nowrap">
                                    <a
                                      className="cursor-pointer underline"
                                      onClick={() => {
                                        window.api.navByDefaultBrowser(
                                          `https://web-control.fideo.site/${form.getValues('webControlPath')}`
                                        )
                                      }}
                                    >
                                      {`https://web-control.fideo.site/${form.getValues('webControlPath')}`}
                                    </a>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div>
                                    {`https://web-control.fideo.site/${form.getValues('webControlPath')}`}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
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
      <ShadcnDialog open={dialogOpen} onOpenChange={(status) => handleClosePayingDialog(status)}>
        <ShadcnDialogContent>
          <ShadcnDialogHeader>
            <ShadcnDialogTitle className="mt-[20px] text-center">
              <p>{title}</p>
              <p className="mt-3">{`￥${money}`}</p>
            </ShadcnDialogTitle>
          </ShadcnDialogHeader>
          <div className="flex justify-center h-[280px]">
            {qrcode && <img className="h-[280px]" src={qrcode}></img>}
          </div>
        </ShadcnDialogContent>
      </ShadcnDialog>
    </>
  )
}
