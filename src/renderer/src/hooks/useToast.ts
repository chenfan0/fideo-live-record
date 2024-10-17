import { useToast as _useToast } from '@/shadcn/ui/use-toast'
import { sendMessage, WebSocketMessageType } from '@/lib/websocket'

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
      type: WebSocketMessageType.SHOW_TOAST,
      data: {
        title,
        description
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
