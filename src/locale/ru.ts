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
   * Four photographs of the same orc soldier are four rows in the catalogue and
   * one line here — the name belongs to the toy, not to the picture of it, and
   * that is what makes a fifth orc a single row and no edit in this file.
   */
  items: {
    'orc-soldier': 'Орк солдат',
  } as Record<string, string>,

  shop: {
    /** Above the shelf, so the balance in the corner has something to answer. */
    purseLabel: (coins: number) => `в кошельке ${ru.coins(coins)}`,
    purseEdit: 'Сколько у тебя монет?',
    price: (coins: number) => `цена ${ru.coins(coins)}`,
    buy: 'Купить',
    short: (missing: number) => `не хватает ${missing}`,
    shortLabel: (missing: number) => `не хватает ${ru.coins(missing)}`,
    bought: 'Куплено',
    undo: 'вернуть',
    /** The collection, counted out loud — half the reason a child buys anything. */
    collected: (owned: number, total: number) => `собрано ${owned} из ${total}`,
    empty: 'Здесь пока пусто',
    /** The full-screen photograph. */
    openPhoto: (name: string) => `${name} — посмотреть`,
    close: 'Закрыть',
  },

  /** Clears the shelf. Two steps, like «Новая игра» next door. */
  reset: {
    start: 'Начать заново',
    ask: 'Стереть покупки?',
    yes: 'Да',
    no: 'Нет',
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
