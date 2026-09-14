import { useEffect, useState } from 'react'
import { LEDGER_KEY, load, save } from '@/adapters/storage'
import { shortfall, stateOf, type ItemState, type Priced } from '@/core/shelf'
import * as ledger from '@/core/wallet'
import { STATE } from '@/shop/state'

export interface Shop {
  readonly coins: number
  readonly stateOf: (item: Priced) => ItemState
  readonly shortfall: (item: Priced) => number
  readonly buy: (item: Priced) => void
}

/**
 * All of the shop's state, in one hook, so the components below stay
 * presentational — CogniQuest's `useBattle` in miniature.
 *
 * The ledger is read synchronously in the initialiser and written back on every
 * change. No loading screen: `localStorage` answers before the first paint, and
 * a shop that flickered through an empty shelf on every open would look broken
 * to a child who bought something yesterday.
 *
 * The committed `STATE` is passed in on every read, because it is what decides
 * whether the save may be believed at all — see `readLedger`.
 */
export function useWallet(): Shop {
  const [held, setHeld] = useState(() => ledger.readLedger(load(LEDGER_KEY), STATE))

  // Writing on every change, the mount included. The extra write costs nothing
  // and it means there is exactly one place that saves — including the write
  // that records a reconciliation, so a tablet reset by a new commit stops
  // asking about it on the next open.
  useEffect(() => {
    save(LEDGER_KEY, held)
  }, [held])

  const shelf = ledger.shelfOf(held)

  return {
    coins: shelf.coins,
    stateOf: (item) => stateOf(shelf, item),
    shortfall: (item) => shortfall(shelf, item),
    // The refusals are already unreachable through the buttons, and the core
    // hands back the untouched ledger for both — so this can stay one line and
    // still be safe against a double tap.
    buy: (item) => setHeld((current) => ledger.buy(current, item).ledger),
  }
}
