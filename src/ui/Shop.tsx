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
 * Everything about money lives in `useWallet`; everything about what is on sale
 * lives in the catalogue. What is left here is which shelf is open and which
 * photograph is being looked at — the two pieces of state that are about the
 * screen rather than about the child.
 */
export function Shop() {
  const wallet = useWallet()
  const [categoryId, setCategoryId] = useState(CATEGORIES[0]?.id ?? '')
  const [viewing, setViewing] = useState<Item | null>(null)

  const items = itemsIn(categoryId)

  return (
    <div className="shop">
      <ShopBar
        coins={wallet.coins}
        onCoins={wallet.setCoins}
        onClear={wallet.clearPurchases}
        owned={wallet.boughtCount}
      />

      <Tabs categories={CATEGORIES} activeId={categoryId} onPick={setCategoryId} />

      {/* An engraved line between the shelf's name and the shelf, the way a
          page of a book is ruled off from its heading. */}
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
                  state={wallet.stateOf(item)}
                  shortfall={wallet.shortfall(item)}
                  onBuy={() => wallet.buy(item)}
                  onRefund={() => wallet.refund(item)}
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
