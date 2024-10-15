import { useToast as _useToast } from '@/shadcn/ui/use-toast'

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

    window.socket.send(
      JSON.stringify({
        type: 'toast',
        data: {
          title,
          description
        }
      })
    )

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
