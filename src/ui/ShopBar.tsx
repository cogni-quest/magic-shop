import { t } from '@/locale'

/**
 * The sign over the door: whose shop this is, and what the child has to spend.
 *
 * The purse used to be a field he could type into. It is a plain number now —
 * what he has is recorded in the repository, and a field that looked editable
 * but forgot everything on reload would be a lie told to a six-year-old.
 */
export function ShopBar({ coins }: { coins: number }) {
  return (
    <header className="shopbar">
      <div className="shopbar__crest">
        <h1 className="shopbar__title">{t.app.title}</h1>
      </div>

      <p className="purse" aria-label={t.shop.purseLabel(coins)}>
        <span className="purse__amount tabular">{coins}</span>
        <span className="purse__coin" aria-hidden="true">
          🪙
        </span>
      </p>
    </header>
  )
}
