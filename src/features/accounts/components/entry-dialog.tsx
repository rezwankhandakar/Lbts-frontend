import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { EntryDialogRequest } from '../hooks/use-entry-dialog'
import { EntryForm } from './entry-form'

interface EntryDialogProps {
  request: EntryDialogRequest | null
  onClose: () => void
}

/** The entry form in a dialog. It mounts only while open, so every opening starts from its own request. */
export function EntryDialog({ request, onClose }: EntryDialogProps) {
  return (
    <Dialog open={request !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-xl">
        {request && <EntryForm request={request} onDone={onClose} />}
      </DialogContent>
    </Dialog>
  )
}
