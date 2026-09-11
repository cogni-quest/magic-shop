import type { CSSProperties } from 'react'
import type { Category } from '@/shop/catalog'

/**
 * The shelves there are to look at.
 *
 * Rendered from the table even while the table holds one row: a single tab
 * still says «there will be other things here», and the day the second one
 * arrives nothing about this file or the layout changes. It scrolls sideways
 * rather than wrapping, so six categories on a phone stay one row.
 */
export function Tabs({
  categories,
  activeId,
  onPick,
}: {
  categories: readonly Category[]
  activeId: string
  onPick: (id: string) => void
}) {
  return (
    <nav className="tabs" role="tablist">
      {categories.map((category) => (
        <button
          key={category.id}
          role="tab"
          aria-selected={category.id === activeId}
          className={`tab${category.id === activeId ? ' tab--active' : ''}`}
          style={{ '--card': category.color } as CSSProperties}
          onClick={() => onPick(category.id)}
        >
          <span className="tab__icon" aria-hidden="true">
            {category.icon}
          </span>
          {category.title}
        </button>
      ))}
    </nav>
  )
}
