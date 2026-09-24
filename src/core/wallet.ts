/**
 * THE LEDGER. What the child has left of the gold he earned in Quest.
 *
 * Pure: no DOM, no storage, no React. Every function returns a new ledger
 * rather than editing the one it was given, which is what lets React notice a
 * purchase and what lets a test say «this refusal changed nothing» by identity.
 *
 * ── Where the coins come from ───────────────────────────────────────────────
 *
 * Quest banks gold for every opponent beaten and only ever adds to it. This
 * shop never copies that number; it keeps the amount to take off it, `spent`,
 * and the balance is worked out on every read:
 *
 *     coins = gold banked in Quest − spent
 *
 * So each app writes one number that nobody else writes. Two tabs open at once
 * cannot lose a coin or mint one — there is no balance to overwrite, only two
 * tallies that each move on their own side. Quest reads `spent` back out of
 * this ledger to show the same balance in its corner: that field is the
 * contract, see `quest/src/adapters/storage/shopSpent.ts` on the other side.
 *
 * ── Where it starts ─────────────────────────────────────────────────────────
 *
 * The two apps were joined up with a child already mid-way: some coins in hand,
 * some toys on his shelf, and a Quest save holding a lifetime of gold most of
 * which is long spent. `state.json` records the first two by hand. The third is
 * caught by the tablet, once — the gold Quest held the first time this ledger
 * met it, `start.gold`. From then on only gold earned past that point counts:
 *
 *     spent = start.gold − state.coins + every purchase made here
 *
 * which makes the balance `state.coins` on the day, and lets it grow from there.
 * The toys in `state.json` cost nothing on top: they are already paid for, in
 * the coins the file says are left.
 */
import type { Priced, ShelfState } from './shelf'

/**
 * 2 since the balance left this record: version 1 carried `coins` and a
 * fingerprint of the committed file. A version-1 save is read once, for its
 * purchases, and written back as version 2 — see `readLedger`.
 */
export const LEDGER_VERSION = 2

/**
 * A ceiling on the balance.
 *
 * Nothing honest reaches it. It guards against a Quest save edited in devtools,
 * and a five-figure balance would make every price on the shelf meaningless at
 * a glance.
 */
export const MAX_COINS = 9999

/**
 * The moment recorded against a toy that arrived with the committed file rather
 * than being bought here.
 *
 * Zero, which is a real `Date.now()` in 1970 and therefore safely before every
 * purchase this shop will ever make. It marks the ones the page must not sell
 * back — see `refund` — and the ones that cost nothing on top of the file's
 * coins.
 */
export const GRANTED = 0

export interface Purchase {
  /** When (`Date.now()`), or GRANTED for what the committed file lists. */
  readonly at: number
  /**
   * What it cost at the time — the catalogue price, recorded for a granted toy
   * too, though that one is not charged.
   *
   * Kept with the purchase rather than looked up in the catalogue, so raising a
   * price on the shelf does not reach back and take coins for a toy he already
   * has.
   */
  readonly price: number
}

export interface Ledger {
  readonly version: number
  /**
   * Where the count begins.
   *
   * `gold` is what Quest held the first time this tablet's ledger met it, and
   * is never moved after. `coins` is what `state.json` says was in hand then —
   * read from the file on every open, so correcting it by hand is a commit.
   */
  readonly start: { readonly gold: number; readonly coins: number }
  /**
   * Item id → the purchase.
   *
   * A map rather than a list because a toy is bought once: the shelf holds one
   * of each orc, and «buy it again» is a mistake to refuse, not a quantity to
   * count.
   */
  readonly bought: Readonly<Record<string, Purchase>>
  /**
   * What to take off Quest's gold: `start.gold − start.coins` and every price
   * paid here. Negative when Quest held less than the file's coins on the day.
   *
   * Redundant here — `readLedger` works it out again rather than trusting it —
   * and written anyway, because it is the one number Quest needs and Quest
   * knows neither the file nor the catalogue.
   */
  readonly spent: number
}

/**
 * The ledger the file describes, before this tablet has spent anything —
 * starting from whatever Quest holds right now.
 */
export function ledgerFrom(committed: ShelfState, catalog: readonly Priced[], earned: number): Ledger {
  return readLedger(null, committed, catalog, earned)
}

/**
 * Turns whatever came back out of storage into a ledger.
 *
 * Junk, a missing field or a version this build does not know gives the file's
 * own ledger rather than an exception, started from the gold Quest holds now.
 * The shop must open even when the save is broken, because a child who cannot
 * open it cannot be told why.
 *
 * A version-1 save is taken for its purchases, and starts the count now like
 * any save without a `start`. It recorded when each toy was bought but not for
 * how much, so those are priced from the catalogue as it stands.
 */
export function readLedger(
  raw: unknown,
  committed: ShelfState,
  catalog: readonly Priced[],
  earned: number,
): Ledger {
  const data = (typeof raw === 'object' && raw !== null ? raw : {}) as {
    version?: unknown
    start?: unknown
    bought?: unknown
  }
  const known = data.version === LEDGER_VERSION || data.version === 1

  const bought: Record<string, Purchase> = {}

  if (known && typeof data.bought === 'object' && data.bought !== null) {
    // Only the entries that look like purchases, and never a granted one: the
    // file below is the whole authority on those, so a toy dropped from it is
    // dropped here too. A stray string would otherwise survive as long as the
    // save does and break arithmetic far from home.
    for (const [id, entry] of Object.entries(data.bought)) {
      const purchase = data.version === 1 ? fromVersion1(entry, id, catalog) : fromVersion2(entry)
      if (purchase && purchase.at !== GRANTED) bought[id] = purchase
    }
  }

  // What the file says he owns, he owns — even if the tablet's copy lost it.
  // Storage is allowed to fail; the repository is not allowed to be wrong.
  // Re-stamped as GRANTED rather than left as the save found it, so a moment
  // edited into the save cannot make a file-granted toy look sellable.
  for (const id of committed.bought) bought[id] = { at: GRANTED, price: priceIn(catalog, id) }

  const startGold = data.version === LEDGER_VERSION ? goldIn(data.start) : null

  return withSpent({ gold: startGold ?? clamp(earned), coins: clamp(committed.coins) }, bought)
}

/**
 * The gold Quest has banked, out of whatever its save turned out to be.
 *
 * Nothing, rather than an exception, for a save that is missing, broken or of a
 * version this shop has not met.
 */
export function earnedIn(questProfile: unknown): number {
  if (typeof questProfile !== 'object' || questProfile === null) return 0
  const data = questProfile as { version?: unknown; gold?: unknown }
  if (data.version !== 1 || typeof data.gold !== 'number') return 0
  return clamp(data.gold)
}

/** What is left to spend. Never below nothing, even after a new game in Quest. */
export function coinsLeft(ledger: Ledger, earned: number): number {
  return clamp(earned - ledger.spent)
}

/** The ledger as the shelf wants to read it — see `stateOf` in `shelf.ts`. */
export function shelfOf(ledger: Ledger, earned: number): ShelfState {
  return { coins: coinsLeft(ledger, earned), bought: Object.keys(ledger.bought) }
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
export function buy(
  ledger: Ledger,
  item: Priced,
  earned: number,
  now: () => number = () => Date.now(),
): BuyResult {
  if (item.id in ledger.bought) return { ok: false, reason: 'owned', ledger }
  if (coinsLeft(ledger, earned) < item.price) return { ok: false, reason: 'poor', ledger }

  return {
    ok: true,
    ledger: withSpent(ledger.start, { ...ledger.bought, [item.id]: { at: now(), price: item.price } }),
  }
}

export type RefundResult =
  | { ok: true; ledger: Ledger }
  | { ok: false; reason: 'not-bought' | 'granted'; ledger: Ledger }

/**
 * Puts a purchase back, coins and all — at what it was bought for, not at what
 * the shelf asks today.
 *
 * Here because the buy button is large and a six-year-old's aim is not. Which
 * of his purchases he is still allowed to undo is not this module's business —
 * the shop offers it only for what was bought while the page has been open, and
 * that is a fact about the page, not about the ledger.
 *
 * One refusal is this module's business, though, and it is the reason `granted`
 * exists: what the committed file handed him is not the tablet's to sell back.
 * `readLedger` asserts the file's purchases on every open, so the toy would
 * return by itself on the next reload and the coins would be free.
 */
export function refund(ledger: Ledger, item: Priced): RefundResult {
  const purchase = ledger.bought[item.id]

  if (purchase === undefined) return { ok: false, reason: 'not-bought', ledger }
  if (purchase.at === GRANTED) return { ok: false, reason: 'granted', ledger }

  const bought = { ...ledger.bought }
  delete bought[item.id]

  return { ok: true, ledger: withSpent(ledger.start, bought) }
}

function withSpent(start: Ledger['start'], bought: Record<string, Purchase>): Ledger {
  let spent = start.gold - start.coins
  for (const purchase of Object.values(bought)) {
    if (purchase.at !== GRANTED) spent += purchase.price
  }
  return { version: LEDGER_VERSION, start, bought, spent }
}

function goldIn(start: unknown): number | null {
  if (typeof start !== 'object' || start === null) return null
  const { gold } = start as { gold?: unknown }
  return typeof gold === 'number' && Number.isFinite(gold) ? clamp(gold) : null
}

function priceIn(catalog: readonly Priced[], id: string): number {
  return catalog.find((item) => item.id === id)?.price ?? 0
}

function fromVersion1(entry: unknown, id: string, catalog: readonly Priced[]): Purchase | null {
  if (typeof entry !== 'number' || !Number.isFinite(entry)) return null
  return { at: entry, price: priceIn(catalog, id) }
}

function fromVersion2(entry: unknown): Purchase | null {
  if (typeof entry !== 'object' || entry === null) return null
  const { at, price } = entry as Partial<Purchase>
  if (typeof at !== 'number' || !Number.isFinite(at)) return null
  if (typeof price !== 'number' || !Number.isFinite(price)) return null
  return { at, price: clamp(price) }
}

/** Whole, not negative, not absurd. The one gate every number passes through. */
function clamp(coins: number): number {
  if (!Number.isFinite(coins)) return 0
  return Math.min(MAX_COINS, Math.max(0, Math.round(coins)))
}
