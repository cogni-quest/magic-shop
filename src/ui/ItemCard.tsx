import { useState, type CSSProperties } from 'react'
import { t } from '@/locale'
import type { Item } from '@/shop/catalog'
import { Corners } from './Corners'
import { Photo } from './Photo'
import type { ItemState } from './useWallet'

/**
 * One toy, in its case on the shelf.
 *
 * A panel of black lacquer with a gold hairline, a second line inside it and a
 * vignette in each corner — the lid of a box, opened. Three states, told apart
 * by the colour of the metal: gold for what he can take today, cinnabar for what
 * he cannot yet, emerald for what is already his.
 */
export function ItemCard({
  item,
  state,
  shortfall,
  onBuy,
  onRefund,
  onOpenPhoto,
}: {
  item: Item
  state: ItemState
  /** How many coins short, when that is what the state means. */
  shortfall: number
  onBuy: () => void
  onRefund: () => void
  onOpenPhoto: () => void
}) {
  // Set by a tap on a price the child cannot pay, cleared when the shake ends.
  const [nudged, setNudged] = useState(false)

  return (
    <article
      className={`item item--${state}${nudged ? ' item--nudged' : ''}`}
      style={{ '--f': item.color } as CSSProperties}
      onAnimationEnd={() => setNudged(false)}
    >
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

      <div className="item__action">
        {state === 'affordable' && (
          <button className="item__buy" onClick={onBuy}>
            {t.shop.buy}
          </button>
        )}

        {/* Not `disabled`. A disabled button swallows the tap, and a child who
            taps and gets nothing back concludes the shop is broken — so this one
            answers, by shaking and saying how far off he is. */}
        {state === 'short' && (
          <button
            className="item__buy item__buy--short"
            aria-disabled="true"
            aria-label={t.shop.shortLabel(shortfall)}
            onClick={() => setNudged(true)}
          >
            <span className="tabular">{t.shop.short(shortfall)}</span>
          </button>
        )}

        {/* Small and quiet, because it undoes something the child wanted — but
            present, because the alternative to a mis-tap is an argument. */}
        {state === 'bought' && (
          <button className="item__undo" onClick={onRefund}>
            {t.shop.undo}
          </button>
        )}
      </div>
    </article>
  )
}
