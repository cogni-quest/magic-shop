/**
 * THE WALLET. What the child has, and what he has already spent it on.
 *
 * Pure: no DOM, no storage, no React. Every function returns a new wallet
 * rather than editing the one it was given, which is what lets React notice a
 * purchase and what lets a test say «this refusal changed nothing» by identity.
 *
 * The balance is typed in by hand — the coins are earned in a different app, on
 * a different domain, so there is nothing to read — and that is why the numbers
 * here are defended so carefully: every one of them arrives from a text field a
 * six-year-old can put anything into.
 */

export const WALLET_VERSION = 1

/**
 * A ceiling on the balance.
 *
 * «5000000» is one held key away, and a five-figure balance makes every price
 * on the screen meaningless at a glance. High enough that the real number never
 * meets it.
 */
export const MAX_COINS = 9999

/**
 * What the wallet needs to know about a thing on sale, and nothing more.
 *
 * `Item` from the catalogue satisfies this structurally, but the core does not
 * import it: the catalogue reaches for `publicUrl()`, `publicUrl()` reaches for
 * `import.meta.env`, and that would put a browser in the dependency graph of
 * the one module whose whole point is not to have one.
 */
export interface Purchasable {
  readonly id: string
  readonly price: number
}

export interface WalletData {
  version: number
  /** Coins in hand. Whole, never negative, never above MAX_COINS. */
  coins: number
  /**
   * Item id → when it was bought (`Date.now()`).
   *
   * A map rather than a list because a toy is bought once: the shelf holds one
   * of each orc, and «buy it again» is a mistake to refuse, not a quantity to
   * count. The moment is not shown anywhere yet; it is what a «newest first»
   * shelf would be built from, and recording it now costs nothing and saves a
   * version bump later.
   */
  bought: Record<string, number>
}

export function emptyWallet(): WalletData {
  return { version: WALLET_VERSION, coins: 0, bought: {} }
}

/**
 * Turns whatever came back out of storage into a wallet.
 *
 * Junk, a missing field, or a version this build does not know about all give
 * an empty wallet rather than an exception: the shop must open even when the
 * save is broken, because a child who cannot open it cannot be told why.
 *
 * Fields are back-filled one at a time instead of the record being thrown away
 * at the first surprise. That is CogniQuest's rule in `Profile`, and the reason
 * is the same: when the shape grows a field, an old save should gain the field,
 * not lose the purchases.
 */
export function readWallet(raw: unknown): WalletData {
  if (typeof raw !== 'object' || raw === null) return emptyWallet()

  const data = raw as Partial<WalletData>

  // A foreign version is the one case where the save really is unreadable —
  // the fields may mean something else entirely. Start over.
  if (data.version !== WALLET_VERSION) return emptyWallet()

  const wallet = emptyWallet()

  // Re-clamped rather than trusted: the other writer of this record is a text
  // editor with devtools open.
  if (typeof data.coins === 'number') wallet.coins = clamp(data.coins)

  if (typeof data.bought === 'object' && data.bought !== null) {
    // Only the entries that look like purchases. A stray string here would
    // survive as long as the save does and break arithmetic far from home.
    for (const [id, at] of Object.entries(data.bought)) {
      if (typeof at === 'number' && Number.isFinite(at)) wallet.bought[id] = at
    }
  }

  return wallet
}

/**
 * Sets the balance from the field in the bar.
 *
 * Fractions and minuses are flattened rather than refused — the field is a toy,
 * and an empty purse is a better answer to «-5» than an error message nobody
 * reads. `bought` is deliberately untouched: retyping the balance after a week
 * of earning must not un-buy anything.
 */
export function setCoins(wallet: WalletData, coins: number): WalletData {
  return { ...wallet, coins: clamp(coins) }
}

/** Whole, not negative, not absurd. The one gate every balance passes through. */
function clamp(coins: number): number {
  if (!Number.isFinite(coins)) return 0
  return Math.min(MAX_COINS, Math.max(0, Math.round(coins)))
}

export function isBought(wallet: WalletData, itemId: string): boolean {
  return itemId in wallet.bought
}

export function canAfford(wallet: WalletData, item: Purchasable): boolean {
  return wallet.coins >= item.price
}

/** How many coins short the child is. Zero when he is not. */
export function shortfall(wallet: WalletData, item: Purchasable): number {
  return Math.max(0, item.price - wallet.coins)
}

export type BuyResult =
  | { ok: true; wallet: WalletData }
  | { ok: false; reason: 'poor' | 'owned'; wallet: WalletData }

/**
 * Buys, or says why not.
 *
 * Both refusals are already unreachable through the buttons, so this could have
 * returned the wallet unchanged and left the caller none the wiser. It does not:
 * a refusal a test can name stays true when the buttons change. The «owned»
 * branch in particular is the double-tap guard, and it belongs here rather than
 * in a disabled attribute.
 */
export function buy(
  wallet: WalletData,
  item: Purchasable,
  now: () => number = () => Date.now(),
): BuyResult {
  if (isBought(wallet, item.id)) return { ok: false, reason: 'owned', wallet }
  if (!canAfford(wallet, item)) return { ok: false, reason: 'poor', wallet }

  return {
    ok: true,
    wallet: {
      ...wallet,
      coins: wallet.coins - item.price,
      bought: { ...wallet.bought, [item.id]: now() },
    },
  }
}

/**
 * Undoes a purchase, coins and all.
 *
 * Here because the buy button is large and a six-year-old's aim is not: without
 * it, one stray tap costs fifty coins and an argument. Returning something never
 * bought is a no-op rather than free money.
 */
export function refund(wallet: WalletData, item: Purchasable): WalletData {
  if (!isBought(wallet, item.id)) return wallet

  const bought = { ...wallet.bought }
  delete bought[item.id]

  return { ...wallet, coins: clamp(wallet.coins + item.price), bought }
}

/**
 * Clears the shelf without touching the balance.
 *
 * The two are separate on purpose: the coins are typed in and can be retyped in
 * a second, while the purchases are the only thing here that took the child a
 * week to accumulate.
 */
export function forgetPurchases(wallet: WalletData): WalletData {
  return { ...wallet, bought: {} }
}
