import { useState } from 'react'
import { stateOf, shortfall } from '@/core/shelf'
import { t } from '@/locale'
import { CATEGORIES, itemsIn, type Item } from '@/shop/catalog'
import { STATE } from '@/shop/state'
import { ItemCard } from './ItemCard'
import { Lightbox } from './Lightbox'
import { ShopBar } from './ShopBar'
import { Tabs } from './Tabs'
import './Shop.css'

/**
 * The shop, which is the whole app.
 *
 * What the child has comes out of the repository (`src/shop/state.json`) and
 * nothing here changes it, so the only state on this side is about the screen:
 * which shelf is open, and which photograph is being looked at.
 */
export function Shop() {
  const [categoryId, setCategoryId] = useState(CATEGORIES[0]?.id ?? '')
  const [viewing, setViewing] = useState<Item | null>(null)

  const items = itemsIn(categoryId)

  return (
    <div className="shop">
      <ShopBar coins={STATE.coins} />

      <Tabs categories={CATEGORIES} activeId={categoryId} onPick={setCategoryId} />

      {/* An engraved line between the shelf's name and the shelf, the way a page
          of a book is ruled off from its heading. */}
      <hr className="rule" />

      <main className="shelf">
        {/* What a category added before its photographs looks like. */}
        {items.length === 0 ? (
          <p className="shelf__empty">{t.shop.empty}</p>
        ) : (
          <ul className="grid">
            {items.map((item) => (
              <li key={item.id}>
                <ItemCard
                  item={item}
                  state={stateOf(STATE, item)}
                  shortfall={shortfall(STATE, item)}
                  onOpenPhoto={() => setViewing(item)}
                />
              </li>
            ))}
          </ul>
        )}
      </main>

      {viewing && <Lightbox item={viewing} onClose={() => setViewing(null)} />}
    </div>
  )
}
