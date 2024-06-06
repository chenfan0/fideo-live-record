import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shadcn/ui/dialog'
import { Button } from '@renderer/shadcn/ui/button'

interface DeleteRecordDialogProps {
  title: string
  dialogOpen: boolean
  onOpenChange: (open: boolean) => void
  handleConfirmDelete: () => void
}

export default function DeleteRecordDialog(props: DeleteRecordDialogProps) {
  const { title, dialogOpen, onOpenChange, handleConfirmDelete } = props
  const { t } = useTranslation()
  return (
    <Dialog open={dialogOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mt-[20px]">
            {t('stream_config.confirm_delete')} ({title})
          </DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <Button className="mt-[20px]" variant="destructive" onClick={handleConfirmDelete}>
            {t('stream_config.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
