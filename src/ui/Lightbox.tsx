import { useEffect } from 'react'
import { t } from '@/locale'
import type { Item } from '@/shop/catalog'
import { Photo } from './Photo'

/**
 * The photograph, whole and as large as the screen allows.
 *
 * The card shows a crop about 150 px wide on a phone, and the toy is the entire
 * point of this shop — so tapping the picture has to do something, and what it
 * does is show the picture.
 */
export function Lightbox({ item, onClose }: { item: Item; onClose: () => void }) {
  // Escape closes it. A tablet has no Escape, which is why the scrim and the
  // button close it too; this is for the parent on a laptop.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={item.name} onClick={onClose}>
      {/* The picture is not a target: a tap that lands on it should close this
          too, the way tapping anything else does. Nothing here to stop. */}
      <div className="lightbox__box">
        <Photo item={item} variant="full" />
        <p className="lightbox__name">{item.name}</p>
      </div>

      <button className="lightbox__close" aria-label={t.shop.close}>
        ✕
      </button>
    </div>
  )
}
