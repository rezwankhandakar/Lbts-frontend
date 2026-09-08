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
 * Waiting for a third character would withhold it exactly where it matters
 * most.
 */
const MIN_PRODUCT_LENGTH = 1

/** Typing must not fire a request per keystroke. */
const DEBOUNCE_MS = 250

/**
 * The product field, told what the model on its row is.
 *
 * This is the point of the whole arrangement: an operator copies a model
 * number off the challan PDF, and the rate card says what that model is
 * called. The card's spelling then goes into the product box — which matters
 * beyond convenience, because pricing insists the product name match a card
 * row, so a product typed as "Fridge" against a card that says "Refrigerator"
 * is a line nothing can charge.
 *
 * Suggestions from the card sit **above** the type-ahead rather than mixed
 * into it. What has been filed before is a record of what people typed, right
 * and wrong alike; the card is the business's own spelling, so the two are
 * different kinds of answer and the list says which is which.
 *
 * Typing is never blocked and the card never overrides anything: a product
 * absent from it must stay typeable, because the card is a rate list and not
 * a catalogue of everything Walton ships.
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
   * The product-name lookup, used when the model has nothing to say.
   *
   * Two situations, and both are ordinary. A product the card prices with no
   * model — a hair dryer, an iron, a blender — has no model to paste, so this
   * is the only help available for it. And a model that matched nothing means
   * the operator is on their own unless the name itself can be offered.
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
   * The same rule paste-and-fill follows, and for the same reason: filling a
   * blank is help, overwriting something somebody typed is the system deciding
   * it knows better. The ref records which model was auto-filled from, so
   * clearing the box by hand is respected rather than immediately undone.
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
     * a model is still wanted beside the name, because that is the difference
     * between a line that will price and one that will not: an iron is priced
     * outright, a refrigerator is not priced until its model is there too.
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
      field="product"
      registration={registration}
      value={value}
      onPick={onPick}
      invalid={invalid}
      priorityOptions={priorityOptions}
      priorityLabel="From the rate card"
    />
  )
}
