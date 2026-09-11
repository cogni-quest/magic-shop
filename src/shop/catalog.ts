/**
 * THE CATALOGUE. Two tables, and normally only the second one gets edited.
 *
 *   CATEGORIES_TABLE — the tabs, in the order they appear
 *   ITEMS_TABLE      — what is on the shelf
 *
 * Built the way CogniQuest builds its roster (`src/game/monsters.ts`): small
 * tables up top, joined here to the text pack and to `publicUrl()`, so adding a
 * toy is a line of data rather than a change to anything that renders.
 *
 * To add a toy: a photograph at `photos/<category>/<id>.jpg`, `npm run photos`,
 * and one row in ITEMS_TABLE. Nothing else — the name comes from the kind, and
 * the picture is found by the id.
 */
import { publicUrl } from '@/assets'
import { t } from '@/locale'

export interface Category {
  readonly id: string
  /** Localised tab label, from `t.categories`. */
  readonly title: string
  /** A bare emoji, the way CogniQuest uses 🪙 ⚔️ 🗺️ rather than an icon font. */
  readonly icon: string
  /** The colour every card in this category is framed in. */
  readonly color: string
}

export interface Item {
  readonly id: string
  readonly categoryId: string
  /** Localised name, from `t.items`, keyed by kind. */
  readonly name: string
  /** Coins. A whole number — the shop deals in whole coins only. */
  readonly price: number
  /** Already resolved through `publicUrl()`; safe to put straight in `src`. */
  readonly image: string
  /** Inherited from the category, so a card and its tab agree on colour. */
  readonly color: string
  /**
   * Where the toy sits in its photograph, as a CSS `object-position`.
   *
   * The card crops a tall rectangle out of a snapshot taken in a garden, and
   * these figures are nowhere near the middle of their frames — centred
   * cropping cuts the head off one and shows mostly pine needles for another.
   * One hand-set pair of percentages per photograph is the cheapest honest fix;
   * a script cannot find a green orc against green grass.
   */
  readonly focus: string
  /**
   * How far to zoom into the photograph on a card, around that same point.
   *
   * These were snapshots, not product shots: the toy stands a fair way off and
   * fills maybe a quarter of the frame, so a plain crop gives a card of pine
   * needles with a green speck in it. One number per photograph brings the orc
   * up to the size of the card. The full-screen view ignores it and shows the
   * picture as taken.
   */
  readonly zoom: number
  /** What tells two toys of one kind apart, when anything needs to. */
  readonly note?: string
}

// ─────────────────────────────────────────────────────────────────────────
// CATEGORIES — id · emoji · colour. The tab bar is this table, in this order.
//
// Gold, because on this shelf the metal already means something: gold is what a
// thing costs, emerald is what is already his, cinnabar is what he cannot reach
// yet. A category's colour is the fourth voice and has to stay out of those
// three — which the next one along will have to respect too.
// ─────────────────────────────────────────────────────────────────────────

type CategoryRow = readonly [id: string, icon: string, color: string]

const CATEGORIES_TABLE: readonly CategoryRow[] = [['army', '⚔', '#d9a441']]

// ─────────────────────────────────────────────────────────────────────────
// ITEMS — id · category · kind · price · where the toy is in its photograph.
//
// `id` IS A SAVE KEY: a bought toy is remembered by it, so renaming one un-buys
// that toy on the child's tablet. Written once, never touched.
//
// `kind` is what the toy is. Four photographs of the same orc soldier share one
// kind and therefore one name, which is the whole reason the name is not a
// column here.
//
// The picture is not a column either: it is always
// `/<category>/<id>.webp`. One row, one file named after it — nothing to keep
// in step and nothing to mistype.
// ─────────────────────────────────────────────────────────────────────────

type ItemRow = readonly [
  id: string,
  categoryId: string,
  kind: string,
  price: number,
  focus: string,
  zoom: number,
]

const ITEMS_TABLE: readonly ItemRow[] = [
  // Sitting on a pine branch, small in a busy frame — the deepest zoom of the four.
  ['orc-1', 'army', 'orc-soldier', 50, '34% 52%', 2.1],
  // Swinging an axe, hanging off a branch against the sky.
  ['orc-2', 'army', 'orc-soldier', 50, '45% 47%', 1.7],
  // Sword and shield on paving stones; the stones make a clean backdrop.
  ['orc-3', 'army', 'orc-soldier', 50, '45% 42%', 1.7],
  // The only one shot landscape, so the crop throws away width, not height.
  ['orc-4', 'army', 'orc-soldier', 50, '38% 52%', 1.5],
]

/** Hand notes, where two toys of one kind need telling apart. Empty today. */
const NOTES: Record<string, string> = {}

export const CATEGORIES: readonly Category[] = CATEGORIES_TABLE.map(([id, icon, color]) => ({
  id,
  icon,
  color,
  // Falling back to the id rather than to an empty tab: a missing translation
  // should look wrong on screen, not invisible.
  title: t.categories[id] ?? id,
}))

export const ITEMS: readonly Item[] = ITEMS_TABLE.map(([id, categoryId, kind, price, focus, zoom]) => {
  const category = CATEGORIES.find((one) => one.id === categoryId)
  // A config mistake should fail loudly at load rather than quietly at render.
  if (!category) throw new RangeError(`Item ${id} sits in an unknown category ${categoryId}`)

  const note = NOTES[id]

  return {
    id,
    categoryId,
    price,
    focus,
    zoom,
    name: t.items[kind] ?? kind,
    image: publicUrl(`/${categoryId}/${id}.webp`),
    color: category.color,
    ...(note !== undefined ? { note } : {}),
  }
})

export function itemsIn(categoryId: string): readonly Item[] {
  return ITEMS.filter((item) => item.categoryId === categoryId)
}
