import { useRef, useState } from 'react'
import { FileUp, Loader2, Paperclip, X } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  ALLOWED_DOCUMENT_EXTENSIONS,
  MAX_DOCUMENT_BYTES,
  isAllowedDocument,
} from '../lib/photo-rules'
import { formatFileSize } from '../lib/vendor-meta'
import { documentFormSchema } from '../schemas/vendor-schemas'
import type { DocumentFormValues } from '../schemas/vendor-schemas'
import { documentTypesFor } from '../types'
import type { DocumentOwnerType, DocumentRecord, VendorDocumentType } from '../types'
import { DateField, FieldError, FormSection } from './form-parts'

interface DocumentFormDialogProps {
  record: DocumentRecord | null
  /** What the document is about, when a new one is being filed. */
  owner: { type: DocumentOwnerType; id: string; label: string } | null
  open: boolean
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: DocumentFormValues, file: File | null) => void
}

/**
 * Filing a compliance document, or renewing one.
 *
 * **Renewing is an edit, not a second row.** A vehicle has one fitness
 * certificate at a time; the renewed one replaces the old, and two rows would
 * make "is this vehicle's fitness valid" a question with two answers. So the
 * document type is fixed once the row exists, and everything else — the number,
 * the dates, the scan — is what changes.
 *
 * **There is no status field, and there could not be.** Valid, expiring and
 * expired are arithmetic over the expiry date; a status somebody could type
 * would be a way to contradict the date printed beside it.
 *
 * The attachment is optional on purpose. The expiry date is what raises the
 * compliance alert, and waiting for somebody to find the scanner is how a
 * lapsed certificate goes unnoticed for a month.
 */
export function DocumentFormDialog({
  record,
  owner,
  open,
  isPending,
  onOpenChange,
  onSubmit,
}: DocumentFormDialogProps) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      documentType: 'Registration Certificate',
      documentNumber: '',
      issueDate: '',
      expiryDate: '',
      note: '',
    },
    mode: 'onTouched',
  })

  const ownerType = record?.ownerType ?? owner?.type ?? 'Vehicle'
  const types = documentTypesFor(ownerType)

  /**
   * Reloads whenever the dialog opens on a different document, or on a
   * different subject for a new one.
   *
   * Adjusted during render rather than in an effect — the pattern
   * `change-role-dialog.tsx` established — because a file staged for the
   * previous document would otherwise be attached to this one, which is the
   * quietest possible way to put the wrong scan on a record.
   */
  const [session, setSession] = useState<string | null>(null)
  const currentSession = open ? (record?.id ?? `new:${owner?.id ?? ''}`) : null

  if (currentSession !== session) {
    setSession(currentSession)
    setFile(null)
    reset(
      record
        ? {
            documentType: record.documentType,
            documentNumber: record.documentNumber,
            issueDate: record.issueDate ?? '',
            expiryDate: record.expiryDate ?? '',
            note: record.note ?? '',
          }
        : {
            documentType: types[0],
            documentNumber: '',
            issueDate: '',
            expiryDate: '',
            note: '',
          },
    )
  }

  const documentType = useWatch({ control, name: 'documentType' })
  const issueDate = useWatch({ control, name: 'issueDate' })
  const expiryDate = useWatch({ control, name: 'expiryDate' })

  const subject = record?.ownerLabel ?? owner?.label ?? ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{record ? 'Update document' : 'File document'}</DialogTitle>
          <DialogDescription>
            {record
              ? `Renewing replaces this document rather than adding a second one, so the compliance count stays honest. ${subject}.`
              : `A compliance document for ${subject}. Its status is worked out from the expiry date, so there is nothing to set by hand.`}
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={handleSubmit((values) => onSubmit(values, file))}
          className="space-y-5"
          aria-busy={isPending}
        >
          <FormSection title="Document details">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="document-type">Document type</Label>
                <Select
                  value={documentType}
                  onValueChange={(value) =>
                    setValue('documentType', value as VendorDocumentType, { shouldDirty: true })
                  }
                  disabled={isPending || record !== null}
                >
                  <SelectTrigger id="document-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {types.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError error={errors.documentType?.message} />
                {record && (
                  <p className="text-xs leading-snug text-muted-foreground">
                    The type cannot change — a tax token is not a route permit, and each is its own
                    row.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="document-number">
                  Document number <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="document-number"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={isPending}
                  {...register('documentNumber')}
                />
                <FieldError error={errors.documentNumber?.message} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <DateField
                id="document-issue"
                label="Issue date (optional)"
                value={issueDate}
                onChange={(value) => setValue('issueDate', value, { shouldDirty: true })}
                disabled={isPending}
                error={errors.issueDate?.message}
              />

              <DateField
                id="document-expiry"
                label="Expiry date"
                value={expiryDate}
                onChange={(value) => setValue('expiryDate', value, { shouldDirty: true })}
                disabled={isPending}
                error={errors.expiryDate?.message}
                hint="Leave blank for a document that does not lapse, such as an NID."
              />
            </div>
          </FormSection>

          <FormSection
            title="Attachment"
            description={`Optional. ${ALLOWED_DOCUMENT_EXTENSIONS}, up to ${MAX_DOCUMENT_BYTES / (1024 * 1024)} MB. It is stored privately and only reachable through this app.`}
          >
            <input
              ref={fileInput}
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                const chosen = event.target.files?.[0]
                event.target.value = ''
                if (chosen && isAllowedDocument(chosen)) {
                  setFile(chosen)
                }
              }}
            />

            {file ? (
              <div className="flex items-center gap-2.5 rounded-lg border bg-muted/40 px-3 py-2.5">
                <Paperclip className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label="Remove the chosen file"
                  disabled={isPending}
                  onClick={() => setFile(null)}
                >
                  <X aria-hidden />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => fileInput.current?.click()}
                  className="w-full sm:w-auto"
                >
                  <FileUp data-icon="inline-start" aria-hidden />
                  {record?.attachment ? 'Replace the attached file' : 'Attach a scan'}
                </Button>

                {record?.attachment && (
                  <p className="text-xs text-muted-foreground">
                    Currently holding {record.attachment.originalName} (
                    {formatFileSize(record.attachment.size)}). Choosing a new file replaces it.
                  </p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="document-note">
                Note <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea id="document-note" rows={2} disabled={isPending} {...register('note')} />
            </div>
          </FormSection>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && (
                <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />
              )}
              {record ? 'Save changes' : 'File document'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
