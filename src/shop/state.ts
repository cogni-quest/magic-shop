import type { ShelfState } from '@/core/shelf'
import raw from './state.json'

/**
 * What the child has, as the repository records it.
 *
 * `state.json` beside this file is the source of truth and is edited by hand:
 * change the number, add the id of a toy he has been given, commit, and the
 * shelf says so the next time it deploys. Nothing in the browser writes to this
 * file — it cannot, a static site has nowhere to write but the tablet it is open
 * on.
 *
 * The tablet does keep its own ledger, and the shop does spend again. The two
 * are not allowed to drift: `core/wallet.ts` stamps every save with the
 * committed state it was opened from, so editing this file throws the tablet's
 * copy away and starts again from what is written here. Between edits the
 * tablet counts; the next commit overrules it.
 *
 * Bundled rather than fetched, which is what makes a typo in it a failed build
 * instead of a blank shop: TypeScript reads the file, and `src/shop/state.test.ts`
 * checks what TypeScript cannot — that every id in `bought` is a toy that exists.
 */
export const STATE: ShelfState = raw
