/**
 * Russian text pack. Every word the child ever sees lives here.
 *
 * The rule is CogniQuest's, and holding both projects to it is what lets them
 * be read side by side: nothing outside this folder is written in Russian —
 * code, comments and developer-facing messages are English, and anything
 * addressed to the child is a key in this file.
 *
 * The one thing outside it is the `<title>` in `index.html`, which the browser
 * needs before any JavaScript runs and which is the shop's name rather than a
 * string in its interface.
 */
export const ru = {
  code: 'ru',

  app: {
    /** Also the `<title>` in `index.html`, which is written out by hand there. */
    title: 'Лавка чудес',
  },

  /** Tab labels, keyed by category id. */
  categories: {
    army: 'Армия',
  } as Record<string, string>,

  /**
   * Toy names, keyed by KIND rather than by item id.
   *
   * The name belongs to the toy, not to the picture of it: a second photograph
   * of a toy already listed here is a row in the catalogue and no edit in this
   * file. The four mountain orcs are four moulds, so they are four lines — each
   * named for what it is holding, which is how the child tells them apart on
   * the shelf.
   */
  items: {
    'mountain-orc-broadsword': 'Горный орк с палашом',
    'mountain-orc-axe': 'Горный орк с топором',
    'mountain-orc-cleaver': 'Горный орк с тесаком',
    'mountain-orc-club': 'Горный орк с дубиной',
  } as Record<string, string>,

  shop: {
    /** Read out for the number in the corner; the coin already says it visually. */
    purseLabel: (coins: number) => `в кошельке ${ru.coins(coins)}`,
    price: (coins: number) => `цена ${ru.coins(coins)}`,
    /** Engraved above the number, in small capitals. */
    priceLabel: 'цена',
    /**
     * What a case says when the coins are there for it. Not «купить» — nothing
     * on this page buys anything; the trade happens at the kitchen table.
     */
    ready: 'можно брать',
    short: (missing: number) => `не хватает ${missing}`,
    shortLabel: (missing: number) => `не хватает ${ru.coins(missing)}`,
    bought: 'Куплено',
    empty: 'Здесь пока пусто',
    /** The full-screen photograph. */
    openPhoto: (name: string) => `${name} — посмотреть`,
    close: 'Закрыть',
  },

  /**
   * «1 монета, 2 монеты, 5 монет».
   *
   * Grammar, therefore language, therefore here and not in a component. The
   * eleven-to-fourteen exception is why this is a function and not a lookup on
   * the last digit: 21 is «монета» and 11 is not.
   */
  coins: (n: number): string => {
    const tens = n % 100
    const ones = n % 10
    if (tens >= 11 && tens <= 14) return `${n} монет`
    if (ones === 1) return `${n} монета`
    if (ones >= 2 && ones <= 4) return `${n} монеты`
    return `${n} монет`
  },
}
