import type { ShelfState } from '@/core/shelf'
import raw from './state.json'

/**
 * Where the child stood when the shop and Quest were joined up: the coins in
 * hand that day, and the toys already on his shelf. Edited by hand.
 *
 * Not a balance kept here. The coins he has now are Quest's gold less what the
 * shop has spent, and this file only sets where that count begins — see
 * «Where it starts» in `core/wallet.ts`. Every id in `bought` is on his shelf,
 * cannot be sold back, and is already paid for out of those coins.
 *
 * Bundled rather than fetched, which is what makes a typo in it a failed build
 * instead of a blank shop: TypeScript reads the file, and `src/shop/state.test.ts`
 * checks what TypeScript cannot — that every id in `bought` is a toy that exists.
 */
export const STATE: ShelfState = raw
