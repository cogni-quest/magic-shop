/**
 * The save, in the browser and nowhere else.
 *
 * Synchronous, unlike CogniQuest's `BrowserProfileStorage`: that one returns
 * promises because it sits behind a port which becomes a file once the game is
 * packaged into Electron. This is a web page and stays one, so async would buy
 * nothing and cost a loading state — where sync lets the shop read the ledger
 * inside `useState`'s initialiser and paint the right screen on the first frame.
 *
 * Storage can be unavailable: a private window, a per-site block, no room left.
 * For a child's shop, quietly carrying on without saves beats crashing — and
 * here it degrades to something honest rather than to nothing, because what the
 * repository granted him is compiled into the page and needs no storage at all.
 */

/**
 * Namespace for everything this app stores.
 *
 * No hyphen, though the repository has one — an older name, kept so a tablet's
 * purchases survive. Quest's is `quest:`; the two never collide.
 */
const PREFIX = 'magicshop:'

/**
 * Where Quest keeps its profile — its prefix and its `PROFILE_KEY`, joined.
 *
 * Readable from here because both sites are served from one origin
 * (`cogni-quest.github.io`, under `/quest/` and `/magic-shop/`), and so share
 * one `localStorage`. Under `npm run dev` they sit on different ports, which
 * are different origins: there the shop sees no gold at all.
 *
 * Read, never written. The profile is Quest's; this shop only needs the one
 * number in it — see `earnedIn` in `core/wallet.ts`.
 */
const QUEST_PROFILE_KEY = 'quest:profile'

/**
 * The key the ledger lives under — in full, `magicshop:ledger`.
 *
 * Not `wallet`, which an older build of this shop used for a record of a
 * different shape. A tablet that ran both would otherwise hand this one a
 * stranger; a new name lets the old key sit there harmlessly until the browser
 * clears it.
 */
export const LEDGER_KEY = 'ledger'

export function load(key: string): unknown {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw === null ? null : JSON.parse(raw)
  } catch (cause) {
    console.warn('Could not read the save:', cause)
    return null
  }
}

export function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch (cause) {
    console.warn('Could not write the save:', cause)
  }
}

/** Quest's profile as it is saved, or null. Untrusted: see `earnedIn`. */
export function loadQuestProfile(): unknown {
  try {
    const raw = localStorage.getItem(QUEST_PROFILE_KEY)
    return raw === null ? null : JSON.parse(raw)
  } catch (cause) {
    console.warn('Could not read the Quest save:', cause)
    return null
  }
}

/**
 * Calls back whenever Quest's profile may have changed.
 *
 * The `storage` event covers a Quest tab open beside this one — the browser
 * fires it here when the other tab writes. Coming back to a tab the tablet had
 * put to sleep is covered by `visibilitychange`, since an event missed while
 * hidden is not replayed. Returns the unsubscribe.
 */
export function onQuestProfileChange(callback: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === QUEST_PROFILE_KEY || event.key === null) callback()
  }
  const onVisible = () => {
    if (document.visibilityState === 'visible') callback()
  }

  window.addEventListener('storage', onStorage)
  document.addEventListener('visibilitychange', onVisible)

  return () => {
    window.removeEventListener('storage', onStorage)
    document.removeEventListener('visibilitychange', onVisible)
  }
}
