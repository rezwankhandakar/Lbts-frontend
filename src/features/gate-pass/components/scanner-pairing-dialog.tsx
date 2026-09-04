import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  getScannerAgentUrl,
  getScannerToken,
  setScannerAgentUrl,
  setScannerToken,
} from '../lib/scanner-agent'

interface ScannerPairingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Re-runs the scanner check once the pairing changes. */
  onPaired: () => void
}

/**
 * Pairs this browser with the scanner helper running on this machine.
 *
 * The helper prints a code when it starts, and it goes in here once per
 * workstation. Without it, any page the operator happens to open could drive
 * the scanner on their desk — a browser will not let a hostile page *read* the
 * agent's answers, but nothing stops it firing a scan.
 *
 * The address is here too because a second helper on a shared machine has to
 * live on a different port, and that is easier to explain in one field than in
 * a support call.
 */
export function ScannerPairingDialog({ open, onOpenChange, onPaired }: ScannerPairingDialogProps) {
  const [token, setToken] = useState(() => getScannerToken())
  const [url, setUrl] = useState(() => getScannerAgentUrl())

  const save = () => {
    setScannerAgentUrl(url)
    setScannerToken(token)
    onOpenChange(false)
    onPaired()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="size-4 text-primary" aria-hidden />
            Connect the scanner
          </DialogTitle>
          <DialogDescription>
            Start the LBTS Scanner Agent on this computer. It prints a pairing code the first time
            it runs; paste it here.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="scanner-token" className="text-[13px] font-medium">
              Pairing code
            </Label>
            <Input
              id="scanner-token"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Paste the code from the helper window"
              autoComplete="off"
              spellCheck={false}
            />
            <p className="text-xs text-muted-foreground">
              Stored in this browser only. It is not sent to the LBTS server.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="scanner-url" className="text-[13px] font-medium">
              Helper address
            </Label>
            <Input
              id="scanner-url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="http://127.0.0.1:39217"
              autoComplete="off"
              spellCheck={false}
            />
            <p className="text-xs text-muted-foreground">
              Change this only if the helper was started on a different port.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={token.trim().length === 0}>
            Connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
