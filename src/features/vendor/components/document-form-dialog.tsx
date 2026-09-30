import { useState } from 'react'
import { Loader2 } from 'lucide-react'
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
import { documentFormSchema } from '../schemas/vendor-schemas'
import type { DocumentFormValues } from '../schemas/vendor-schemas'
import { documentTypesFor } from '../types'
import type { DocumentOwnerType, DocumentRecord, VendorDocumentType } from '../types'
import { DocumentAttachmentField } from './document-attachment-field'
import { DateField, FieldError, FormSection } from './form-parts'
import { useT } from '@/lib/i18n'
import { documentTypeLabel } from '../lib/vendor-meta'

interface DocumentFormDialogProps {
  record: DocumentRecord | null
  /** What the document is about, when a new one is being filed. */
  owner: { type: DocumentOwnerType; id: string; label: string } | null
  /**
   * Everything already on record for that subject, when the dialog was opened
   * from a vehicle or a driver rather than from a document row.
   *
   * This is what lets one entry point cover both jobs: choosing a type that is
   * already filed turns the form into a renewal of *that* row rather than an
   * attempt to add a second one, which the API refuses with a 409 and which the
   * operator had no way to see coming.
   */
  existing?: DocumentRecord[]
  open: boolean
  isPending: boolean
  onOpenChange: (open: boolean) => void
  /**
   * `renewing` is the row this replaces, or null for a genuinely new document.
   * The caller chooses between POST and PATCH from it rather than guessing.
   */
  onSubmit: (
    values: DocumentFormValues,
    file: File | null,
    renewing: DocumentRecord | null,
  ) => void
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
  existing = [],
  open,
  isPending,
  onOpenChange,
  onSubmit,
}: DocumentFormDialogProps) {
  const t = useT()

  const [file, setFile] = useState<File | null>(null)

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
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
  const [loaded, setLoaded] = useState<string | null>(null)
  const currentSession = open ? (record?.id ?? `new:${owner?.id ?? ''}`) : null

  if (currentSession !== session) {
    setSession(currentSession)
    setFile(null)
    setLoaded(null)
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

  /**
   * The row this submission will actually write.
   *
   * Opened from a document row it is that row. Opened from a vehicle or a
   * driver it is whichever of their documents matches the chosen type — so
   * picking "Fitness Certificate" on a lorry that already has one renews it,
   * and picking one it does not have files a new one. The type select is where
   * that decision gets made, and it says which is which beside every option.
   */
  const target = record ?? existing.find((item) => item.documentType === documentType) ?? null

  /**
   * Loads the matched row's values whenever the chosen type lands on a
   * different one.
   *
   * Adjusted during render against that row's id — the pattern this module
   * already uses for the session above — rather than in an effect, because an
   * effect here would show the previous document's expiry date for one frame.
   * A file the operator has already staged is theirs and is deliberately not
   * cleared: choosing the type is not undoing the scan.
   *
   * `isDirty` is the guard that matters. The subject's documents arrive from the
   * API, and on a cold instance that can be a minute after the dialog opened —
   * long enough for somebody to have typed a document number into it. Loading
   * over what they wrote would be the quietest possible way to lose it, so a
   * form somebody has touched is left exactly as it is. The reset carries no
   * `keepDefaultValues`, which is what makes the flag mean "typed since the
   * last load" rather than "differs from a blank form".
   */
  const targetKey = open ? (target?.id ?? `none:${documentType}`) : null

  if (record === null && targetKey !== loaded && !isDirty) {
    setLoaded(targetKey)
    reset({
      documentType,
      documentNumber: target?.documentNumber ?? '',
      issueDate: target?.issueDate ?? '',
      expiryDate: target?.expiryDate ?? '',
      note: target?.note ?? '',
    })
  }

  const subject = record?.ownerLabel ?? owner?.label ?? ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {target ? t('vendor.document.renewTitle') : t('vendor.document.file')}
          </DialogTitle>
          <DialogDescription>
            {target
              ? t('vendor.document.renewDescription', {
                  type: documentTypeLabel(target.documentType, t),
                  subject,
                })
              : t('vendor.document.addDescription', { subject })}
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={handleSubmit((values) => onSubmit(values, file, target))}
          className="space-y-5"
          aria-busy={isPending}
        >
          <FormSection title={t('vendor.document.detailsSection')}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="document-type">{t('vendor.document.typeLabel')}</Label>
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
                      {types.map((type) => {
                        const filed = existing.find((item) => item.documentType === type)

                        return (
                          <SelectItem key={type} value={type}>
                            <span className="min-w-0 truncate">{documentTypeLabel(type, t)}</span>
                            {filed && (
                              <span className="shrink-0 rounded-full border bg-muted px-1.5 py-px text-[10.5px] leading-4 font-medium text-muted-foreground">
                                {t('vendor.document.onRecordChip')}
                              </span>
                            )}
                          </SelectItem>
                        )
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError error={errors.documentType?.message} />
                {record ? (
                  <p className="text-xs leading-snug text-muted-foreground">
                    {t('vendor.document.typeFixed')}
                  </p>
                ) : (
                  target && (
                    <p className="text-xs leading-snug text-tone-amber">
                      {t('vendor.document.alreadyOnRecord')}
                    </p>
                  )
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
                label={t('vendor.document.issueDate')}
                value={issueDate}
                onChange={(value) => setValue('issueDate', value, { shouldDirty: true })}
                disabled={isPending}
                error={errors.issueDate?.message}
              />

              <DateField
                id="document-expiry"
                label={t('vendor.document.expiryDate')}
                value={expiryDate}
                onChange={(value) => setValue('expiryDate', value, { shouldDirty: true })}
                disabled={isPending}
                error={errors.expiryDate?.message}
                hint={t('vendor.document.expiryHint')}
              />
            </div>
          </FormSection>

          <FormSection
            title={t('vendor.document.attachment')}
            description={t('vendor.document.attachmentHint')}
          >
            <DocumentAttachmentField
              file={file}
              current={target?.attachment ?? null}
              disabled={isPending}
              onFileChange={setFile}
            />

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
              {t('common.actions.cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && (
                <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />
              )}
              {target ? t('common.actions.saveChanges') : t('vendor.document.file')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
