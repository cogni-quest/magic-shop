import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { t } from '@/locale'
import { CATEGORIES, ITEMS, itemsIn } from './catalog'

const root = fileURLToPath(new URL('../..', import.meta.url))

/**
 * What the config cannot be trusted to get right by eye.
 *
 * Deliberately absent: that «Армия» holds four toys, or that an orc costs
 * fifty. That is content, it changes whenever a toy is bought in the real
 * world, and a test that fails every time the shelf changes teaches you to stop
 * reading tests.
 */
describe('the catalogue', () => {
  it('gives every toy its own id', () => {
    const ids = ITEMS.map((item) => item.id)
    // A duplicate would make two toys share one bought flag: buy one, the other
    // turns green too. Silent, and horrible.
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('puts every toy in a category that exists', () => {
    const known = new Set(CATEGORIES.map((category) => category.id))
    for (const item of ITEMS) expect(known).toContain(item.categoryId)
  })

  it('prices everything in whole, positive coins', () => {
    for (const item of ITEMS) {
      expect(Number.isInteger(item.price)).toBe(true)
      expect(item.price).toBeGreaterThan(0)
    }
  })

  it('has a Russian name for every toy, so the id never shows', () => {
    const names = new Set(Object.values(t.items))
    for (const item of ITEMS) expect(names).toContain(item.name)
  })

  it('has a Russian label for every tab', () => {
    const titles = new Set(Object.values(t.categories))
    for (const category of CATEGORIES) expect(titles).toContain(category.title)
  })

  it('shows only the asked-for category on a tab', () => {
    for (const category of CATEGORIES) {
      for (const item of itemsIn(category.id)) expect(item.categoryId).toBe(category.id)
    }
  })

  /**
   * The commonest mistake in the whole workflow — a row added before the
   * photograph was converted — caught by `npm test`, which CI runs before it
   * deploys. Worth the one filesystem dependency in this file.
   */
  it('has the photograph every row promises', () => {
    for (const item of ITEMS) {
      const file = `${root}public/${item.categoryId}/${item.id}.webp`
      expect(existsSync(file), `missing ${file} — run npm run photos`).toBe(true)
    }
  })
})
