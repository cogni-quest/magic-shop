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
  /**
   * The category's colour, inherited.
   *
   * Not the frame of the case: that is the toy's state, in one of the three
   * metals, and a fourth colour there would say a thing the shop does not mean.
   * This is what stands in for a photograph that will not load.
   */
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
// CATEGORIES — id · emoji · colour. The tab bar is this table, in this order,
// which is cheapest shelf first: elves at thirty, vikings at forty, orcs at
// fifty.
//
// Gold, because on this shelf the metal already means something: gold is what a
// thing costs, emerald is what is already his, cinnabar is what he cannot reach
// yet. A category's colour is the fourth voice and has to stay out of those
// three — which the next one along will have to respect too.
//
// The orcs keep the gold they were shelved in. The vikings take the one clear
// quarter of the wheel left: red is cinnabar, green is emerald, yellow is gold,
// so blue is what remains — and a cold northern steel is no hardship for them.
//
// `id` IS ALSO THE FOLDER the photographs live in, `public/<id>/`, so renaming a
// category means moving files. Splitting one in two, as «Армия» was split into
// these, means moving them into two.
// ─────────────────────────────────────────────────────────────────────────

type CategoryRow = readonly [id: string, icon: string, color: string]

const CATEGORIES_TABLE: readonly CategoryRow[] = [
  // Amethyst: the fourth voice, clear of gold, cinnabar and emerald, and far
  // enough from the vikings' steel blue to read as its own colour on the tab bar.
  ['elves', '⚜', '#9b7fd4'],
  // Both glyphs default to TEXT presentation, so they take the tab's colour like
  // a letter does. An emoji-by-default character (🪓, ⚓) arrives in its own
  // colours instead and lands a cartoon sticker on the lacquer.
  ['vikings', '🛡', '#6f9fd0'],
  ['orcs', '⚔', '#d9a441'],
]

// ─────────────────────────────────────────────────────────────────────────
// ITEMS — id · category · kind · price · where the toy is in its photograph.
//
// `id` IS A SAVE KEY: a bought toy is remembered by it, so renaming one un-buys
// that toy on the child's tablet. Written once, never touched.
//
// `kind` is what the toy is, and the name is looked up from it rather than
// written here. Two toys off the same mould share a kind and therefore one line
// of Russian; every figure below is its own mould, so each carries its own. The
// orcs are told apart by what they hold, and so are most of the vikings — but a
// jarl and a berserk are told apart by what they are, which is what the child
// calls them.
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
  // Sitting on a pine branch, broad blade across his knees — the deepest zoom of the four.
  ['orc-1', 'orcs', 'mountain-orc-broadsword', 50, '34% 52%', 2.1],
  // Swinging an axe overhead, hanging off a branch against the sky.
  ['orc-2', 'orcs', 'mountain-orc-axe', 50, '45% 47%', 1.7],
  // Cleaver and shield on paving stones; the stones make a clean backdrop.
  ['orc-3', 'orcs', 'mountain-orc-cleaver', 50, '45% 42%', 1.7],
  // Spiked club raised; the only one shot landscape, so the crop throws away width, not height.
  ['orc-4', 'orcs', 'mountain-orc-club', 50, '38% 52%', 1.5],
  // Crouched on bare soil, shield to one side and the axe low — as deep a zoom as orc-1.
  ['viking-1', 'vikings', 'viking-axe-shield', 40, '38% 26%', 2.1],
  // Arms folded over a sword hanging point-down; cloak, horns, and the stillest pose on the shelf.
  ['viking-2', 'vikings', 'viking-jarl', 40, '47% 28%', 1.7],
  // Braced along a tree trunk with the bow held out to one side; the crop has to keep the whole bow.
  ['viking-3', 'vikings', 'viking-archer', 40, '71% 50%', 1.7],
  // Blade raised past his own height, so the crop is aimed near the top of the frame rather than the middle.
  ['viking-4', 'vikings', 'viking-greatsword', 40, '46% 5%', 1.5],
  // Crouched on rocks, bow drawn, quiver on his back — watching before he shoots.
  ['elf-1', 'elves', 'elf-archer-watch', 30, '54% 40%', 1.7],
  // Mid-leap, cloak flaring wide, loosing an arrow on the turn.
  ['elf-2', 'elves', 'elf-archer-leap', 30, '54% 45%', 1.6],
  // Standing easy among the leaves, bow lowered and not yet drawn.
  ['elf-3', 'elves', 'elf-archer-ready', 30, '60% 59%', 2.0],
  // Sword raised past his shoulder, half lost in a bed of marigolds.
  ['elf-4', 'elves', 'elf-swordsman', 30, '39% 43%', 2.0],
  // Low to the ground, bow drawn, breaking cover.
  ['elf-5', 'elves', 'elf-archer-ambush', 30, '51% 62%', 1.7],
  // Mid-stride, axe swung wide — the broadest figure here, so width sets the zoom and height comes free.
  ['viking-5', 'vikings', 'viking-berserk', 40, '62% 17%', 1.5],
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
