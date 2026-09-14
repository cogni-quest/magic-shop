import { useState } from 'react'
import type { ItemState } from '@/core/shelf'
import { t } from '@/locale'
import type { Item } from '@/shop/catalog'
import { Corners } from './Corners'
import { Photo } from './Photo'

/**
 * One toy, in its case on the shelf.
 *
 * A panel of black lacquer with a gold hairline, a second line inside it and a
 * vignette in each corner — the lid of a box, opened. Three states, told apart
 * by the colour of the metal: gold for what he can take today, cinnabar for what
 * he cannot yet, emerald for what is already his.
 *
 * Buying asks first. One tap arms the case and a second spends; «нет» puts it
 * back. The button is large, the aim of a six-year-old is not, and forty coins
 * take a week to earn — so the cheap thing to spend on a stray tap is one more
 * tap. The two words replace the mark in place, inside the same fixed-height
 * row, so nothing on the shelf moves while he decides.
 *
 * The case carries no category colour, deliberately. `--f` is its metal and the
 * stylesheet sets it from the state; an inline one would outrank `.item--short`
 * and `.item--bought` and glow a toy the child already owns in his category's
 * colour rather than in emerald. The categories speak on the tabs instead.
 */
export function ItemCard({
  item,
  state,
  shortfall,
  onOpenPhoto,
  onBuy,
}: {
  item: Item
  state: ItemState
  /** How many coins short, when that is what the state means. */
  shortfall: number
  onOpenPhoto: () => void
  onBuy: () => void
}) {
  const [asking, setAsking] = useState(false)

  return (
    <article className={`item item--${state}`}>
      <Corners />

      <button className="item__photo-btn" onClick={onOpenPhoto} aria-label={t.shop.openPhoto(item.name)}>
        <span className="item__frame">
          <Photo item={item} variant="tile" />
          {/* A padlock over a drained photograph says «not yet» before a word is
              read — and says it the way a game does, not the way a form does. */}
          {state === 'short' && (
            <span className="item__lock" aria-hidden="true">
              🔒
            </span>
          )}
        </span>
      </button>

      {/* Struck across the corner of the case, like a seal in wax. Not a
          strike-through, which would read «cancelled»: this one is his. */}
      {state === 'bought' && <span className="item__seal">{t.shop.bought}</span>}

      <h2 className="item__name">{item.name}</h2>
      {item.note !== undefined && <p className="item__note">{item.note}</p>}

      <p className="eyebrow">{t.shop.priceLabel}</p>
      <span className="item__price tabular" aria-label={t.shop.price(item.price)}>
        {item.price}
        <span className="item__coin" aria-hidden="true">
          🪙
        </span>
      </span>

      {/* Kept at a fixed height across all three states, so a shelf of cases
          lines up whatever is on it. */}
      <div className="item__mark">
        {state === 'affordable' && !asking && (
          <button className="mark mark--ready" onClick={() => setAsking(true)}>
            {t.shop.buy}
          </button>
        )}

        {state === 'affordable' && asking && (
          <span className="ask" role="group" aria-label={t.shop.confirm(item.name, item.price)}>
            <span className="ask__q" aria-hidden="true">
              {t.shop.confirmShort}
            </span>
            <button className="ask__btn ask__btn--yes" onClick={onBuy}>
              {t.shop.yes}
            </button>
            <button className="ask__btn" onClick={() => setAsking(false)}>
              {t.shop.no}
            </button>
          </span>
        )}

        {state === 'short' && (
          <span className="mark mark--short tabular" aria-label={t.shop.shortLabel(shortfall)}>
            {t.shop.short(shortfall)}
          </span>
        )}
      </div>
    </article>
  )
}
