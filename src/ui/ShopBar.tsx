import { useState } from 'react'
import { t } from '@/locale'

/**
 * The sign over the door: whose shop this is, and what is in the purse.
 *
 * The shelf itself already says how much of the collection is his — every case
 * on it is either sealed or padlocked — so the sign says it no second time.
 */
export function ShopBar({
  coins,
  onCoins,
  onClear,
  owned,
}: {
  coins: number
  onCoins: (coins: number) => void
  onClear: () => void
  /** How many toys are already his. Nothing bought, nothing to clear. */
  owned: number
}) {
  const [confirming, setConfirming] = useState(false)
  const canClear = owned > 0

  return (
    <header className="shopbar">
      <div className="shopbar__crest">
        <h1 className="shopbar__title">{t.app.title}</h1>
      </div>

      <div className="shopbar__right">
        {/* Two steps, like «Новая игра» in CogniQuest: a stray tap must not throw
            away a month of collecting. */}
        {canClear &&
          (confirming ? (
            <>
              <span className="reset__ask">{t.reset.ask}</span>
              <button
                className="reset__yes"
                onClick={() => {
                  onClear()
                  setConfirming(false)
                }}
              >
                {t.reset.yes}
              </button>
              <button className="reset__no" onClick={() => setConfirming(false)}>
                {t.reset.no}
              </button>
            </>
          ) : (
            <button className="reset__start" onClick={() => setConfirming(true)}>
              {t.reset.start}
            </button>
          ))}

        <Purse coins={coins} onCoins={onCoins} />
      </div>
    </header>
  )
}

/**
 * The purse — a number until it is tapped, a field while it is being typed.
 *
 * The coins are earned in another app on another domain, so there is nothing to
 * read and this field is the only way they get in. Everything fiddly about it
 * follows from who types into it:
 *
 *   · the draft is a string, so clearing the field does not snap it to 0
 *   · digits only, capped at five, so a leant-on key is visibly wrong before it
 *     is silently clamped
 *   · Enter and leaving both commit; Escape puts it back
 *   · `inputMode="numeric"` rather than `type="number"` — a tablet shows a
 *     keypad, and there are no spinner arrows to catch a small finger
 */
function Purse({ coins, onCoins }: { coins: number; onCoins: (coins: number) => void }) {
  const [draft, setDraft] = useState<string | null>(null)

  if (draft === null) {
    return (
      <button
        className="purse"
        onClick={() => setDraft(String(coins))}
        aria-label={`${t.shop.purseLabel(coins)}. ${t.shop.purseEdit}`}
      >
        <span className="purse__amount tabular">{coins}</span>
        <span className="purse__coin" aria-hidden="true">
          🪙
        </span>
      </button>
    )
  }

  const commit = () => {
    onCoins(draft === '' ? 0 : Number(draft))
    setDraft(null)
  }

  return (
    <span className="purse purse--editing">
      <input
        className="purse__input tabular"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={draft}
        aria-label={t.shop.purseEdit}
        autoFocus
        onFocus={(event) => event.currentTarget.select()}
        onChange={(event) => setDraft(event.target.value.replace(/\D/g, '').slice(0, 5))}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') commit()
          if (event.key === 'Escape') setDraft(null)
        }}
      />
      <span className="purse__coin" aria-hidden="true">
        🪙
      </span>
    </span>
  )
}
