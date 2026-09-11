/**
 * The save, in the browser and nowhere else.
 *
 * Synchronous, unlike CogniQuest's `BrowserProfileStorage`: that one returns
 * promises because it sits behind a port which becomes a file once the game is
 * packaged into Electron. This is a web page and stays one, so async would buy
 * nothing and cost a loading state — where sync lets the shop read the wallet
 * inside `useState`'s initialiser and paint the right screen on the first frame.
 *
 * Storage can be unavailable: a private window, a per-site block, no room left.
 * For a child's shop, quietly carrying on without saves beats crashing.
 */

/**
 * Namespace for everything this app stores.
 *
 * No hyphen, though the repository has one: it matches CogniQuest's
 * `cogniquest:`, and the two are read side by side often enough that agreeing
 * with the sibling beats agreeing with the folder name.
 */
const PREFIX = 'magicshop:'

/** The key the wallet lives under — in full, `magicshop:wallet`. */
export const WALLET_KEY = 'wallet'

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
