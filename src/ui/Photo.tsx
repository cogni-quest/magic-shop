import { useEffect, useState } from 'react'
import type { Item } from '@/shop/catalog'

/**
 * The photograph of the toy.
 *
 * Two shapes of the same picture: `tile` crops a tall rectangle to fill the
 * card — which is why every item carries a focus point — and `full` shows the
 * whole frame, because that is what the child opened it for.
 *
 * The fallback is for a broken link and nothing else: a renamed file, or a base
 * path resolving somewhere the photographs are not. That second one is a real
 * risk here — the site is served from `/magic-shop/` — so this will earn its
 * keep at least once. Borrowed, `useEffect` included, from CogniQuest's
 * `MonsterAvatar`: fixing the path should recover without a reload.
 */
export function Photo({ item, variant }: { item: Item; variant: 'tile' | 'full' }) {
  const [failed, setFailed] = useState(false)

  useEffect(() => setFailed(false), [item.image])

  if (failed) {
    return (
      <span
        className={`photo photo--${variant} photo--fallback`}
        style={{ background: item.color }}
        role="img"
        aria-label={item.name}
      >
        🪖
      </span>
    )
  }

  return (
    <img
      className={`photo photo--${variant}`}
      src={item.image}
      alt={item.name}
      // Only the tile crops, so only the tile has anywhere to aim. The zoom
      // turns about that same point, which is what keeps the toy in the frame
      // as it grows.
      style={
        variant === 'tile'
          ? {
              objectPosition: item.focus,
              transform: `scale(${item.zoom})`,
              transformOrigin: item.focus,
            }
          : undefined
      }
      onError={() => setFailed(true)}
    />
  )
}
