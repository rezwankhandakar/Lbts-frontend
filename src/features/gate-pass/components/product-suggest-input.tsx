import { useEffect, useMemo, useRef } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import {
  useModelMatches,
  useProductNameMatches,
} from '@/features/product-rate/hooks/use-product-rates'
import { SuggestInput } from './suggest-input'
import type { PriorityOption } from './suggest-input'

interface ProductSuggestInputProps {
  id: string
  registration: UseFormRegisterReturn
  /** The live product value, so the list reflects what is in the box. */
  value: string
  /** The model on the same row — what the rate card is asked about. */
  model: string
  onPick: (value: string) => void
  invalid?: boolean
}

/** Below this a model is a prefix matching half the card and helps nobody. */
const MIN_MODEL_LENGTH = 2

/**
 * One character is enough in the product box.
 *
 * The card is a few hundred rows and the answer is capped at eight, so a short
 * prefix costs nothing — and for a product the card prices with no model at
 * all, a hair dryer or an iron, this lookup is the *only* assistance there is.
 */
const MIN_PRODUCT_LENGTH = 1

/** Typing must not fire a request per keystroke. */
const DEBOUNCE_MS = 250

/**
 * The product field, told what the model on its row is.
 *
 * The same arrangement the Challan entry form uses, pointed at this module's
 * suggestion endpoint — deliberately the same, because it is the same job: an
 * operator copies a model number off the paper, and the rate card is what says
 * the product that model belongs to. The card's model is a *segment* of the
 * challan's, so `WCF-1D5-GDEL-LX` is answered by the card's `1D5` row and
 * `WCF1D5GDELLX` is found by containment; all of that is the server's
 * `GET /product-rates/models` and none of it is repeated here.
 *
 * Suggestions from the card sit **above** the type-ahead rather than mixed
 * into it. What has been filed before is a record of what people typed, right
 * and wrong alike; the card is the business's own spelling, so the two are
 * different kinds of answer and the list says which is which.
 *
 * Typing is never blocked and the card never overrides anything: a product
 * absent from it must stay typeable, because the card is a rate list and not a
 * catalogue of everything Walton ships.
 */
export function ProductSuggestInput({
  id,
  registration,
  value,
  model,
  onPick,
  invalid,
}: ProductSuggestInputProps) {
  const debouncedModel = useDebouncedValue(model.trim(), DEBOUNCE_MS)
  const matchesQuery = useModelMatches(
    debouncedModel,
    debouncedModel.length >= MIN_MODEL_LENGTH,
  )

  /**
   * Memoised so the identity is stable across renders. `?? []` on its own
   * would hand the effect below a new array every time the form re-rendered —
   * which, on a form that re-renders on every keystroke, means an effect that
   * runs on every keystroke.
   */
  const matches = useMemo(() => matchesQuery.data ?? [], [matchesQuery.data])

  /**
   * The product-name lookup, used when the model has nothing to say. A product
   * the card prices with no model has none to paste, so this is the only help
   * available for it.
   *
   * Switched off while the model *has* matched, because those answers are
   * better: they came from the model on this very row rather than from what
   * happens to start with the same letters.
   */
  const debouncedProduct = useDebouncedValue(value.trim(), DEBOUNCE_MS)
  const namesQuery = useProductNameMatches(
    debouncedProduct,
    matches.length === 0 && debouncedProduct.length >= MIN_PRODUCT_LENGTH,
  )
  const names = useMemo(() => namesQuery.data ?? [], [namesQuery.data])

  /**
   * One unambiguous match fills an **empty** product box, and only an empty
   * one.
   *
   * Filling a blank is help; overwriting something somebody typed is the
   * system deciding it knows better — and on a form transcribed from paper the
   * typed value is the one that came off the challan. The ref records which
   * model was filled from, so clearing the box by hand is respected rather
   * than immediately undone.
   */
  const filledFrom = useRef<string | null>(null)

  useEffect(() => {
    if (value.trim() !== '' || matches.length !== 1 || debouncedModel === '') {
      return
    }
    if (filledFrom.current === debouncedModel) {
      return
    }
    filledFrom.current = debouncedModel
    onPick(matches[0].productName)
  }, [matches, debouncedModel, value, onPick])

  /**
   * Deduplicated by product name: a model can appear on more than one row of
   * the card — the same product in two capacity bands — and offering the same
   * name twice would make the list look like a choice when it is not. The
   * capacity comes along as the hint, which is what tells two genuinely
   * different products apart.
   */
  const priorityOptions = useMemo<PriorityOption[]>(() => {
    const options: PriorityOption[] = []
    const seen = new Set<string>()

    for (const match of matches) {
      const key = match.productName.toLowerCase()
      if (seen.has(key)) {
        continue
      }
      seen.add(key)
      options.push({
        value: match.productName,
        hint: [match.productModel, match.capacity].filter(Boolean).join(' · ') || undefined,
      })
    }

    if (options.length > 0) {
      return options
    }

    /**
     * Falling back to what the card calls its products. The hint says whether
     * a model is still wanted beside the name, which is the difference between
     * a product the card prices outright and one it does not price until the
     * model is there too.
     */
    return names.map((name) => ({
      value: name.productName,
      hint:
        name.modelCount === 0
          ? 'Priced whatever the model'
          : `${name.modelCount} ${name.modelCount === 1 ? 'model' : 'models'} on the card`,
    }))
  }, [matches, names])

  return (
    <SuggestInput
      id={id}
      field="productName"
      registration={registration}
      value={value}
      onPick={onPick}
      invalid={invalid}
      priorityOptions={priorityOptions}
      priorityLabel="From the rate card"
    />
  )
}
