import { describe, expect, it } from 'vitest'
import { canAfford, faultsIn, isBought, shortfall, stateOf, type ShelfState } from './shelf'

const orc = { id: 'orc-1', price: 50 }
const known = ['orc-1', 'orc-2', 'orc-3', 'orc-4']

function state(coins: number, bought: string[] = []): ShelfState {
  return { coins, bought }
}

describe('what a case on the shelf shows', () => {
  it('is his, whatever the balance says', () => {
    expect(stateOf(state(0, ['orc-1']), orc)).toBe('bought')
    expect(isBought(state(0, ['orc-1']), orc.id)).toBe(true)
  })

  it('can be taken when the coins reach the price', () => {
    expect(stateOf(state(60), orc)).toBe('affordable')
  })

  it('can be taken at exactly the price — the boundary, and the interesting one', () => {
    expect(canAfford(state(50), orc)).toBe(true)
    expect(stateOf(state(50), orc)).toBe('affordable')
  })

  it('is out of reach one coin short', () => {
    expect(stateOf(state(49), orc)).toBe('short')
    expect(shortfall(state(49), orc)).toBe(1)
  })

  it('says how far off, and says nothing when it is not', () => {
    expect(shortfall(state(30), orc)).toBe(20)
    expect(shortfall(state(80), orc)).toBe(0)
  })
})

/**
 * `state.json` is edited by hand between sessions, so these are the mistakes a
 * tired parent makes at ten in the evening — and `npm test` runs before the
 * deploy does.
 */
describe('reading a hand-edited state file', () => {
  it('passes a sound one', () => {
    expect(faultsIn(state(120, ['orc-2']), known)).toEqual([])
  })

  it('refuses a negative balance', () => {
    expect(faultsIn(state(-10), known)).toHaveLength(1)
  })

  it('refuses a fraction of a coin', () => {
    expect(faultsIn(state(12.5), known)).toHaveLength(1)
  })

  it('catches a toy that is not in the catalogue — usually a typo in the id', () => {
    expect(faultsIn(state(10, ['orc-9']), known)).toEqual([
      'orc-9 is in bought but not in the catalogue',
    ])
  })

  it('catches the same toy listed twice', () => {
    expect(faultsIn(state(10, ['orc-1', 'orc-1']), known)).toEqual([
      'orc-1 is listed twice in bought',
    ])
  })
})
