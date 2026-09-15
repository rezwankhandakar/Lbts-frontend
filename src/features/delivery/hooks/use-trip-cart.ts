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
  setLineQty,
  splitChallan,
  summarize,
  updateParty,
} from '../lib/cart'
import type { CartParty, CartState, CartSummary, ChallanCandidate } from '../types'

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
  | { type: 'party'; challanId: string; party: CartParty; note: string }
  | { type: 'refresh'; candidates: ChallanCandidate[] }
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
    case 'party':
      return updateParty(state, action.challanId, action.party, action.note)
    case 'refresh':
      return refreshSources(state, action.candidates)
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
  updateParty: (challanId: string, party: CartParty, note: string) => void
  refresh: (candidates: ChallanCandidate[]) => void
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
      updateParty: (challanId: string, party: CartParty, note: string) =>
        dispatch({ type: 'party', challanId, party, note }),
      refresh: (candidates: ChallanCandidate[]) => dispatch({ type: 'refresh', candidates }),
      reset: (next: CartState = EMPTY_CART) => dispatch({ type: 'reset', state: next }),
    }),
    [],
  )

  return { state, summary, ...actions }
}
