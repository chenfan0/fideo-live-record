import { useToast as _useToast } from '@/shadcn/ui/use-toast'
import { sendMessage } from '@/lib/websocket'
import { WEBSOCKET_MESSAGE_TYPE } from '../../../const'

export function useToast() {
  const { toast: _toast } = _useToast()

  function toast({
    title,
    description,
    variant = 'default'
  }: {
    title: string
    description: string
    variant?: 'default' | 'destructive' | null
  }) {
    const isHide = document.hidden

    sendMessage({
      type: WEBSOCKET_MESSAGE_TYPE.SHOW_TOAST,
      data: {
        title,
        description,
        variant
      }
    })

    if (!isHide) {
      _toast({
        title,
        description,
        variant
      })
    } else {
      window.api.showNotification(title, description)
    }
  }

  return { toast }
}
