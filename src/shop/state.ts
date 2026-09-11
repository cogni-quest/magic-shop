import type { ShelfState } from '@/core/shelf'
import raw from './state.json'

/**
 * What the child has, as the repository records it.
 *
 * `state.json` beside this file is the source of truth and is edited by hand:
 * change the number, add the id of a toy he has been given, commit, and the
 * shelf says so the next time it deploys. Nothing in the browser writes to it —
 * a static site has nowhere to write but the tablet it is open on, and a tablet
 * that disagreed with the repository would be worse than no memory at all.
 *
 * Bundled rather than fetched, which is what makes a typo in it a failed build
 * instead of a blank shop: TypeScript reads the file, and `src/shop/state.test.ts`
 * checks what TypeScript cannot — that every id in `bought` is a toy that exists.
 */
export const STATE: ShelfState = raw
