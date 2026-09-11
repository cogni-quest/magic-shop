/**
 * WHAT THE SHELF SHOWS, given what the child has.
 *
 * Pure: no DOM, no storage, no React. It takes the record out of
 * `src/shop/state.json` and a toy, and answers the one question every case on
 * the shelf asks — is this his already, can he take it today, or not yet.
 *
 * There is deliberately nothing here that spends. The state lives in the
 * repository and is edited by hand between sessions; the page only reads it. A
 * buy button would have to write somewhere, and the only somewhere available to
 * a static site is the browser it happens to be open in — which would make the
 * tablet disagree with the repository the first time the child tapped it. The
 * shop that could spend is in the history, at `Add the shop`, if it is ever
 * wanted back.
 */

export interface ShelfState {
  /** Coins the child has right now. Whole and not negative. */
  readonly coins: number
  /** Ids of the toys already on his shelf, from the catalogue. */
  readonly bought: readonly string[]
}

/**
 * What the shelf needs to know about a toy, and nothing more.
 *
 * `Item` from the catalogue satisfies this structurally, but the core does not
 * import it: the catalogue reaches for `publicUrl()`, `publicUrl()` reaches for
 * `import.meta.env`, and that would put a browser in the dependency graph of the
 * one module whose point is not to have one.
 */
export interface Priced {
  readonly id: string
  readonly price: number
}

/** The three things a case on the shelf can be. */
export type ItemState = 'affordable' | 'short' | 'bought'

export function isBought(state: ShelfState, itemId: string): boolean {
  return state.bought.includes(itemId)
}

export function canAfford(state: ShelfState, item: Priced): boolean {
  return state.coins >= item.price
}

/** How many coins short the child is. Zero when he is not. */
export function shortfall(state: ShelfState, item: Priced): number {
  return Math.max(0, item.price - state.coins)
}

export function stateOf(state: ShelfState, item: Priced): ItemState {
  if (isBought(state, item.id)) return 'bought'
  return canAfford(state, item) ? 'affordable' : 'short'
}

/**
 * What a hand-edited state file is allowed to say.
 *
 * TypeScript already reads `state.json` and would refuse a string where a number
 * belongs, so this is for what the compiler cannot see: a negative balance, a
 * fraction of a coin, an id listed twice, or an id for a toy that is not in the
 * catalogue. The test calls it; nothing at runtime does, because by then the
 * file has already shipped.
 *
 * Returns the complaints, in order. An empty array means the file is sound.
 */
export function faultsIn(state: ShelfState, knownIds: readonly string[]): string[] {
  const faults: string[] = []

  if (!Number.isInteger(state.coins)) faults.push(`coins must be a whole number, not ${state.coins}`)
  if (state.coins < 0) faults.push(`coins must not be negative, but is ${state.coins}`)

  const seen = new Set<string>()
  for (const id of state.bought) {
    if (seen.has(id)) faults.push(`${id} is listed twice in bought`)
    if (!knownIds.includes(id)) faults.push(`${id} is in bought but not in the catalogue`)
    seen.add(id)
  }

  return faults
}
