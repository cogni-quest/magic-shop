/**
 * THE LEDGER. What the child has now: what the repository granted him, less
 * what he has spent on this tablet since.
 *
 * Pure: no DOM, no storage, no React. Every function returns a new ledger
 * rather than editing the one it was given, which is what lets React notice a
 * purchase and what lets a test say «this refusal changed nothing» by identity.
 *
 * ── Why this is not the old wallet ──────────────────────────────────────────
 *
 * The buy button was dropped once, and for a good reason: a static site can
 * only write to the browser it happens to be open in, and a tablet quietly
 * disagreeing with `state.json` is worse than no memory at all. Spending is
 * back, so that disagreement is not left quiet.
 *
 * `state.json` stays the source of truth. A ledger records which committed
 * state it was opened from — `base` — and the moment that file changes, whatever
 * the tablet remembers is dropped in favour of it. Between two edits of the
 * file the tablet may spend as it likes; the next commit overrules it, with no
 * merge and no argument.
 *
 * Which makes the rule sayable in one line, and it is the line the parent needs:
 * **edit the file and the tablet obeys; leave it alone and the tablet counts.**
 */
import type { Priced, ShelfState } from './shelf'

export const LEDGER_VERSION = 1

/**
 * A ceiling on the balance.
 *
 * Nothing here can reach it — purchases only subtract, and the committed file
 * is checked by `faultsIn`. It guards the other writer of this record, which is
 * a child with devtools open on a tablet, and a five-figure balance would make
 * every price on the shelf meaningless at a glance.
 */
export const MAX_COINS = 9999

export interface Ledger {
  readonly version: number
  /**
   * A fingerprint of the committed state this ledger was opened from.
   *
   * The whole reconciliation is this field. It is not a date and not a counter:
   * the parent edits a JSON file by hand and would have to remember to bump
   * either. The content of the file is the one thing that cannot be forgotten.
   */
  readonly base: string
  /** Coins in hand. Whole, never negative, never above MAX_COINS. */
  readonly coins: number
  /**
   * Item id → when it was bought (`Date.now()`), or 0 for the ones that came
   * out of the committed file already his.
   *
   * A map rather than a list because a toy is bought once: the shelf holds one
   * of each orc, and «buy it again» is a mistake to refuse, not a quantity to
   * count.
   */
  readonly bought: Readonly<Record<string, number>>
}

/**
 * The fingerprint of a committed state.
 *
 * `bought` is sorted, so reordering the array in the file by hand is not an
 * edit — it says the same thing, and wiping a tablet's purchases over a
 * reordered list would be a nasty surprise for a parent tidying JSON.
 */
export function fingerprint(committed: ShelfState): string {
  return JSON.stringify([committed.coins, [...committed.bought].sort()])
}

/** The ledger the file describes, before this tablet has spent anything. */
export function ledgerFrom(committed: ShelfState): Ledger {
  const bought: Record<string, number> = {}
  // 0, not `now`: these were not bought here. They arrived already his, and a
  // timestamp from the moment the page first opened would be a small lie.
  for (const id of committed.bought) bought[id] = 0

  return {
    version: LEDGER_VERSION,
    base: fingerprint(committed),
    coins: clamp(committed.coins),
    bought,
  }
}

/**
 * Turns whatever came back out of storage into a ledger.
 *
 * Junk, a missing field, a version this build does not know, or a `base` that
 * no longer matches the committed file: all of them give the file's own ledger
 * rather than an exception. The shop must open even when the save is broken,
 * because a child who cannot open it cannot be told why.
 */
export function readLedger(raw: unknown, committed: ShelfState): Ledger {
  const fromFile = ledgerFrom(committed)

  if (typeof raw !== 'object' || raw === null) return fromFile

  const data = raw as Partial<Ledger>

  if (data.version !== LEDGER_VERSION) return fromFile
  // THE RULE. The repository has moved, so the tablet has not.
  if (data.base !== fromFile.base) return fromFile
  if (typeof data.coins !== 'number') return fromFile

  const bought: Record<string, number> = {}

  if (typeof data.bought === 'object' && data.bought !== null) {
    // Only the entries that look like purchases. A stray string here would
    // survive as long as the save does and break arithmetic far from home.
    for (const [id, at] of Object.entries(data.bought)) {
      if (typeof at === 'number' && Number.isFinite(at)) bought[id] = at
    }
  }

  // What the file says he owns, he owns — even if the tablet's copy lost it.
  // Storage is allowed to fail; the repository is not allowed to be wrong.
  for (const id of committed.bought) {
    if (!(id in bought)) bought[id] = 0
  }

  return {
    version: LEDGER_VERSION,
    base: fromFile.base,
    coins: clamp(data.coins),
    bought,
  }
}

/** The ledger as the shelf wants to read it — see `stateOf` in `shelf.ts`. */
export function shelfOf(ledger: Ledger): ShelfState {
  return { coins: ledger.coins, bought: Object.keys(ledger.bought) }
}

export type BuyResult =
  | { ok: true; ledger: Ledger }
  | { ok: false; reason: 'poor' | 'owned'; ledger: Ledger }

/**
 * Buys, or says why not.
 *
 * Both refusals are already unreachable through the buttons, so this could have
 * returned the ledger unchanged and left the caller none the wiser. It does not:
 * a refusal a test can name stays true when the buttons change. The «owned»
 * branch in particular is the double-tap guard, and it belongs here rather than
 * in a disabled attribute.
 */
export function buy(ledger: Ledger, item: Priced, now: () => number = () => Date.now()): BuyResult {
  if (item.id in ledger.bought) return { ok: false, reason: 'owned', ledger }
  if (ledger.coins < item.price) return { ok: false, reason: 'poor', ledger }

  return {
    ok: true,
    ledger: {
      ...ledger,
      coins: ledger.coins - item.price,
      bought: { ...ledger.bought, [item.id]: now() },
    },
  }
}

/** Whole, not negative, not absurd. The one gate every balance passes through. */
function clamp(coins: number): number {
  if (!Number.isFinite(coins)) return 0
  return Math.min(MAX_COINS, Math.max(0, Math.round(coins)))
}
