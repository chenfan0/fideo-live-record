import {
  Dialog as ShadcnDialog,
  DialogContent as ShadcnDialogContent,
  DialogHeader as ShadcnDialogHeader,
  DialogTitle as ShadcnDialogTitle,
  DialogFooter as ShadcnDialogFooter
} from '@/shadcn/ui/dialog'
import { Button } from '@renderer/shadcn/ui/button'

interface DialogProps {
  title: string
  btnText: string
  dialogOpen: boolean
  onOpenChange: (open: boolean) => void
  handleBtnClick: () => void
  variant?:
    | 'link'
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | null
    | undefined
}

export default function Dialog(props: DialogProps) {
  const { title, dialogOpen, btnText, variant, onOpenChange, handleBtnClick } = props
  return (
    <ShadcnDialog open={dialogOpen} onOpenChange={onOpenChange}>
      <ShadcnDialogContent>
        <ShadcnDialogHeader>
          <ShadcnDialogTitle className="mt-[20px]">{title}</ShadcnDialogTitle>
        </ShadcnDialogHeader>
        <ShadcnDialogFooter>
          <Button className="mt-[20px]" variant={variant} onClick={handleBtnClick}>
            {btnText}
          </Button>
        </ShadcnDialogFooter>
      </ShadcnDialogContent>
    </ShadcnDialog>
  )
}
