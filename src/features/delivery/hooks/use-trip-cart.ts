import { useMemo, useReducer } from 'react'
import {
  EMPTY_CART,
  addChallan,
  addLine,
  editLine,
  refreshSources,
  removeChallan,
  removeLine,
  restoreSource,
  retakeChallan,
  setLineQty,
  splitChallan,
  summarize,
} from '../lib/cart'
import type { CartState, CartSummary, ChallanCandidate } from '../types'

type LineFields = { productName: string; model: string; qty: number }

type Action =
  | { type: 'add'; candidate: ChallanCandidate }
  | { type: 'remove'; challanId: string }
  | { type: 'qty'; challanId: string; key: string; qty: number }
  | { type: 'edit-line'; challanId: string; key: string; change: LineFields }
  | { type: 'remove-line'; challanId: string; key: string }
  | { type: 'add-line'; challanId: string; line: LineFields }
  | { type: 'restore'; challanId: string; index: number }
  | { type: 'split'; challanId: string; take: Record<number, number> }
  | { type: 'refresh'; candidates: ChallanCandidate[] }
  | { type: 'retake'; candidate: ChallanCandidate }
  | { type: 'reset'; state: CartState }

/** Every action is one of the pure transitions in `lib/cart.ts`; nothing is decided here. */
function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case 'add':
      return addChallan(state, action.candidate)
    case 'remove':
      return removeChallan(state, action.challanId)
    case 'qty':
      return setLineQty(state, action.challanId, action.key, action.qty)
    case 'edit-line':
      return editLine(state, action.challanId, action.key, action.change)
    case 'remove-line':
      return removeLine(state, action.challanId, action.key)
    case 'add-line':
      return addLine(state, action.challanId, action.line)
    case 'restore':
      return restoreSource(state, action.challanId, action.index)
    case 'split':
      return splitChallan(state, action.challanId, action.take)
    case 'refresh':
      return refreshSources(state, action.candidates)
    case 'retake':
      return retakeChallan(state, action.candidate)
    case 'reset':
      return action.state
  }
}

export interface TripCart {
  state: CartState
  summary: CartSummary
  add: (candidate: ChallanCandidate) => void
  remove: (challanId: string) => void
  setQty: (challanId: string, key: string, qty: number) => void
  editLine: (challanId: string, key: string, change: LineFields) => void
  removeLine: (challanId: string, key: string) => void
  addLine: (challanId: string, line: LineFields) => void
  restore: (challanId: string, index: number) => void
  split: (challanId: string, take: Record<number, number>) => void
  refresh: (candidates: ChallanCandidate[]) => void
  /** Takes a challan again after the challan itself was corrected. */
  retake: (candidate: ChallanCandidate) => void
  reset: (state?: CartState) => void
}

export function useTripCart(initial: CartState = EMPTY_CART): TripCart {
  const [state, dispatch] = useReducer(reducer, initial)
  const summary = useMemo(() => summarize(state), [state])

  // Stable callbacks: `dispatch` never changes, so neither do these.
  const actions = useMemo(
    () => ({
      add: (candidate: ChallanCandidate) => dispatch({ type: 'add', candidate }),
      remove: (challanId: string) => dispatch({ type: 'remove', challanId }),
      setQty: (challanId: string, key: string, qty: number) =>
        dispatch({ type: 'qty', challanId, key, qty }),
      editLine: (challanId: string, key: string, change: LineFields) =>
        dispatch({ type: 'edit-line', challanId, key, change }),
      removeLine: (challanId: string, key: string) =>
        dispatch({ type: 'remove-line', challanId, key }),
      addLine: (challanId: string, line: LineFields) =>
        dispatch({ type: 'add-line', challanId, line }),
      restore: (challanId: string, index: number) => dispatch({ type: 'restore', challanId, index }),
      split: (challanId: string, take: Record<number, number>) =>
        dispatch({ type: 'split', challanId, take }),
      refresh: (candidates: ChallanCandidate[]) => dispatch({ type: 'refresh', candidates }),
      retake: (candidate: ChallanCandidate) => dispatch({ type: 'retake', candidate }),
      reset: (next: CartState = EMPTY_CART) => dispatch({ type: 'reset', state: next }),
    }),
    [],
  )

  return { state, summary, ...actions }
}
