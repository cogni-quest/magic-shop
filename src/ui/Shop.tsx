import { useState } from 'react'
import { t } from '@/locale'
import { CATEGORIES, itemsIn, type Item } from '@/shop/catalog'
import { ItemCard } from './ItemCard'
import { Lightbox } from './Lightbox'
import { ShopBar } from './ShopBar'
import { Tabs } from './Tabs'
import { useWallet } from './useWallet'
import './Shop.css'

/**
 * The shop, which is the whole app.
 *
 * What the child has is kept by `useWallet`: the gold he banked in Quest, less
 * what this shop has spent, with what he already had from `src/shop/state.json`.
 * The rest of the state here is about the screen: which shelf is open, and
 * which photograph is being looked at.
 */
export function Shop() {
  const [categoryId, setCategoryId] = useState(CATEGORIES[0]?.id ?? '')
  const [viewing, setViewing] = useState<Item | null>(null)

  const shop = useWallet()
  const items = itemsIn(categoryId)

  return (
    <div className="shop">
      <ShopBar coins={shop.coins} />

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
                  state={shop.stateOf(item)}
                  shortfall={shop.shortfall(item)}
                  undoable={shop.undoable(item)}
                  onOpenPhoto={() => setViewing(item)}
                  onBuy={() => shop.buy(item)}
                  onUndo={() => shop.undo(item)}
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
