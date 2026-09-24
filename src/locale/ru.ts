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
    orcs: 'Орки',
    vikings: 'Викинги',
    elves: 'Эльфы',
  } as Record<string, string>,

  /**
   * Toy names, keyed by KIND rather than by item id.
   *
   * The name belongs to the toy, not to the picture of it: a second photograph
   * of a toy already listed here is a row in the catalogue and no edit in this
   * file. Every figure on the shelf is its own mould, so each has a line — named
   * for what it holds, which is how the child tells one orc from another, or for
   * what it is, where that is the plainer word: a jarl is a jarl.
   */
  items: {
    'mountain-orc-broadsword': 'Горный орк с палашом',
    'mountain-orc-axe': 'Горный орк с топором',
    'mountain-orc-cleaver': 'Горный орк с тесаком',
    'mountain-orc-club': 'Горный орк с дубиной',
    'viking-axe-shield': 'Викинг с топором и щитом',
    'viking-jarl': 'Ярл',
    'viking-archer': 'Викинг лучник',
    'viking-greatsword': 'Викинг с двуручным мечом',
    'viking-berserk': 'Берсерк',
    'elf-archer-watch': 'Эльф лучник в дозоре',
    'elf-archer-leap': 'Эльф лучник в прыжке',
    'elf-archer-ready': 'Эльф лучник наготове',
    'elf-swordsman': 'Эльф с мечом',
    'elf-archer-ambush': 'Эльф лучник из засады',
  } as Record<string, string>,

  shop: {
    /** Read out for the number in the corner; the coin already says it visually. */
    purseLabel: (coins: number) => `в кошельке ${ru.coins(coins)}`,
    price: (coins: number) => `цена ${ru.coins(coins)}`,
    /** Engraved above the number, in small capitals. */
    priceLabel: 'цена',
    /**
     * What a case says when the coins are there for it — and it does buy: one
     * tap arms the case, «да» spends. It said «можно брать» while the page could
     * not spend at all, which was honest then and would be a dodge now.
     */
    buy: 'Купить',
    /** The armed case, in the width of a mark. Read out in full by `confirm`. */
    confirmShort: 'точно?',
    confirm: (name: string, price: number) => `купить «${name}» за ${ru.coins(price)}?`,
    yes: 'да',
    no: 'нет',
    /**
     * Offered only on what was bought in this sitting. «Вернуть», not «отменить»:
     * the coins come back and the toy goes back on the shelf, which is a return
     * and not the undoing of something that never happened.
     */
    undo: 'вернуть',
    undoLabel: (name: string) => `вернуть «${name}» в лавку`,
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
