import { useEffect, useState } from 'react'
import { LEDGER_KEY, load, loadQuestProfile, onQuestProfileChange, save } from '@/adapters/storage'
import { shortfall, stateOf, type ItemState, type Priced } from '@/core/shelf'
import * as ledger from '@/core/wallet'
import { ITEMS } from '@/shop/catalog'
import { STATE } from '@/shop/state'

export interface Shop {
  readonly coins: number
  readonly stateOf: (item: Priced) => ItemState
  readonly shortfall: (item: Priced) => number
  readonly buy: (item: Priced) => void
  /**
   * Whether this one can still be put back — true only for what was bought
   * since the page opened. See `undo`.
   */
  readonly undoable: (item: Priced) => boolean
  readonly undo: (item: Priced) => void
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
 * The coins are not in the ledger: they are Quest's gold less what the ledger
 * has spent, so the gold is read here too, from Quest's own save, and read
 * again whenever Quest may have banked more — see `onQuestProfileChange`.
 */
export function useWallet(): Shop {
  const [earned, setEarned] = useState(() => ledger.earnedIn(loadQuestProfile()))
  // `earned` goes in so a save with no starting point yet — a first open, or
  // one from before the shop knew Quest — can take today's gold as its start.
  const [held, setHeld] = useState(() => ledger.readLedger(load(LEDGER_KEY), STATE, ITEMS, earned))

  useEffect(
    () => onQuestProfileChange(() => setEarned(ledger.earnedIn(loadQuestProfile()))),
    [],
  )

  /**
   * What has been bought since this page opened, and therefore what «вернуть»
   * is still offered on.
   *
   * Deliberately NOT saved. It is the whole of the undo rule, and the rule is
   * that closing the shop settles the day: a toy bought in this sitting can be
   * put back while he is still looking at it, and one bought last week is his —
   * it is on his shelf at home by now, and handing the coins back for it would
   * be handing them back twice. An older mistake is the parent's to fix, in
   * the browser's saved ledger.
   *
   * Living in React state rather than in the ledger is what makes «this sitting»
   * true without a clock: a reload empties it, and nothing has to decide how
   * long a sitting lasts.
   */
  const [thisSitting, setThisSitting] = useState<ReadonlySet<string>>(() => new Set())

  // Writing on every change, the mount included. The extra write costs nothing
  // and it means there is exactly one place that saves — including the write
  // that upgrades a version-1 save, and the one that puts `spent` where Quest
  // can read it before anything has been bought.
  useEffect(() => {
    save(LEDGER_KEY, held)
  }, [held])

  const shelf = ledger.shelfOf(held, earned)

  return {
    coins: shelf.coins,
    stateOf: (item) => stateOf(shelf, item),
    shortfall: (item) => shortfall(shelf, item),

    // The refusals in the core are already unreachable through the buttons, and
    // it hands back the untouched ledger for every one of them — so these can
    // stay one line each and still be safe against a double tap.
    buy: (item) => {
      setHeld((current) => ledger.buy(current, item, earned).ledger)
      setThisSitting((current) => new Set(current).add(item.id))
    },

    undoable: (item) => thisSitting.has(item.id),

    undo: (item) => {
      setHeld((current) => ledger.refund(current, item).ledger)
      setThisSitting((current) => {
        const next = new Set(current)
        next.delete(item.id)
        return next
      })
    },
  }
}
