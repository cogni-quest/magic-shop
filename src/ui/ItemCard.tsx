import { useState, type CSSProperties } from 'react'
import { t } from '@/locale'
import type { Item } from '@/shop/catalog'
import type { ItemState } from './useWallet'
import { Photo } from './Photo'

/**
 * One toy on the shelf, in one of three states.
 *
 * The photograph gets the largest box on the card, the price is always the same
 * golden pill, and what is already owned is readable from across the room. Those
 * three are what make this a shop rather than a table of rows; everything else
 * is CogniQuest's restraint, unchanged.
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
      style={{ '--card': item.color } as CSSProperties}
      onAnimationEnd={() => setNudged(false)}
    >
      <button className="item__photo-btn" onClick={onOpenPhoto} aria-label={t.shop.openPhoto(item.name)}>
        <span className="item__frame">
          <Photo item={item} variant="tile" />
          {/* A padlock over a drained photograph says «not yet» before a word is
              read — and says it as a game does, rather than as a form does. */}
          {state === 'short' && (
            <span className="item__lock" aria-hidden="true">
              🔒
            </span>
          )}
        </span>
      </button>

      {/* A wax seal, pressed by hand — not a strike-through, which would read
          «cancelled». This one is his. */}
      {state === 'bought' && (
        <span className="item__seal" aria-hidden="true">
          {t.shop.bought}
        </span>
      )}

      <h2 className="item__name">{item.name}</h2>
      {item.note !== undefined && <p className="item__note">{item.note}</p>}

      <span className="item__price" aria-label={t.shop.price(item.price)}>
        <span aria-hidden="true">🪙</span>
        <span className="tabular">{item.price}</span>
      </span>

      <div className="item__action">
        {state === 'affordable' && (
          <button className="item__buy" onClick={onBuy}>
            {t.shop.buy}
          </button>
        )}

        {/* Not `disabled`. A disabled button swallows the tap, and a child who
            taps and gets nothing back concludes the shop is broken — so this
            one answers, by shaking and saying how far off he is. */}
        {state === 'short' && (
          <button
            className="item__buy item__buy--short"
            aria-disabled="true"
            aria-label={t.shop.shortLabel(shortfall)}
            onClick={() => setNudged(true)}
          >
            <span className="tabular">{t.shop.short(shortfall)}</span>
            <span aria-hidden="true"> 🪙</span>
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
