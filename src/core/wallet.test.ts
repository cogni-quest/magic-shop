import { describe, expect, it } from 'vitest'
import type { ShelfState } from './shelf'
import { LEDGER_VERSION, MAX_COINS, buy, fingerprint, ledgerFrom, readLedger, shelfOf } from './wallet'

const COMMITTED: ShelfState = { coins: 100, bought: ['orc-1'] }

const ORC = { id: 'orc-2', price: 50 }
const VIKING = { id: 'viking-1', price: 40 }

/** A save as it would come back out of `localStorage`, opened from COMMITTED. */
function saved(over: Record<string, unknown> = {}) {
  return { ...ledgerFrom(COMMITTED), ...over }
}

describe('opening a ledger', () => {
  it('starts from the committed file', () => {
    const ledger = ledgerFrom(COMMITTED)

    expect(ledger.coins).toBe(100)
    expect(Object.keys(ledger.bought)).toEqual(['orc-1'])
  })

  it('marks what the file granted with 0 rather than with now', () => {
    // These were not bought here, and a timestamp from the first page load
    // would be a small lie in the one field that records when.
    expect(ledgerFrom(COMMITTED).bought['orc-1']).toBe(0)
  })

  it('reads a save it wrote itself', () => {
    const spent = buy(ledgerFrom(COMMITTED), ORC)
    expect(spent.ok).toBe(true)

    const reopened = readLedger(JSON.parse(JSON.stringify(spent.ledger)), COMMITTED)

    expect(reopened.coins).toBe(50)
    expect('orc-2' in reopened.bought).toBe(true)
  })
})

/**
 * The rule the buy button rests on. Without it the tablet and the repository
 * drift apart silently, which is exactly why the button was removed once.
 */
describe('the repository overruling the tablet', () => {
  it('throws the save away when the committed coins change', () => {
    const spent = buy(ledgerFrom(COMMITTED), ORC)
    const granted: ShelfState = { coins: 500, bought: ['orc-1'] }

    const reopened = readLedger(spent.ledger, granted)

    expect(reopened.coins).toBe(500)
    expect('orc-2' in reopened.bought).toBe(false)
  })

  it('throws the save away when the committed purchases change', () => {
    const spent = buy(ledgerFrom(COMMITTED), ORC)
    const given: ShelfState = { coins: 100, bought: ['orc-1', 'orc-3'] }

    const reopened = readLedger(spent.ledger, given)

    expect(reopened.coins).toBe(100)
    expect(Object.keys(reopened.bought).sort()).toEqual(['orc-1', 'orc-3'])
  })

  it('does not count a reordered bought list as a change', () => {
    // A parent tidying the JSON by hand must not wipe a week of purchases.
    const a: ShelfState = { coins: 100, bought: ['orc-1', 'orc-3'] }
    const b: ShelfState = { coins: 100, bought: ['orc-3', 'orc-1'] }

    expect(fingerprint(a)).toBe(fingerprint(b))

    const spent = buy(ledgerFrom(a), ORC)
    expect(readLedger(spent.ledger, b).coins).toBe(50)
  })

  it('keeps what the file says he owns, even if the save lost it', () => {
    const reopened = readLedger(saved({ bought: {} }), COMMITTED)

    expect('orc-1' in reopened.bought).toBe(true)
  })
})

describe('reading a save that cannot be trusted', () => {
  it('falls back to the file for junk, null and the wrong version', () => {
    for (const raw of [null, 'nonsense', 42, [], { version: 99 }, saved({ version: 2 })]) {
      expect(readLedger(raw, COMMITTED).coins).toBe(100)
    }
  })

  it('falls back to the file when the balance is not a number', () => {
    expect(readLedger(saved({ coins: '50' }), COMMITTED).coins).toBe(100)
  })

  it('drops entries in bought that are not moments', () => {
    const reopened = readLedger(saved({ bought: { 'orc-2': 'yesterday', 'orc-4': 12 } }), COMMITTED)

    expect('orc-2' in reopened.bought).toBe(false)
    expect(reopened.bought['orc-4']).toBe(12)
  })

  it('clamps a balance edited in devtools', () => {
    expect(readLedger(saved({ coins: -5 }), COMMITTED).coins).toBe(0)
    expect(readLedger(saved({ coins: 1e9 }), COMMITTED).coins).toBe(MAX_COINS)
    expect(readLedger(saved({ coins: 12.7 }), COMMITTED).coins).toBe(13)
    expect(readLedger(saved({ coins: Number.NaN }), COMMITTED).coins).toBe(0)
  })

  it('stamps what it returns with this build', () => {
    expect(readLedger(null, COMMITTED).version).toBe(LEDGER_VERSION)
  })
})

describe('buying', () => {
  it('takes the price and records the moment', () => {
    const result = buy(ledgerFrom(COMMITTED), VIKING, () => 1_700_000)

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.ledger.coins).toBe(60)
    expect(result.ledger.bought['viking-1']).toBe(1_700_000)
  })

  it('leaves the ledger it was given alone', () => {
    const before = ledgerFrom(COMMITTED)
    buy(before, VIKING)

    expect(before.coins).toBe(100)
    expect('viking-1' in before.bought).toBe(false)
  })

  it('refuses what he cannot afford, and changes nothing', () => {
    const poor = ledgerFrom({ coins: 39, bought: [] })
    const result = buy(poor, VIKING)

    expect(result.ok).toBe(false)
    if (result.ok) return

    expect(result.reason).toBe('poor')
    // By identity: a refusal must not so much as re-render the shelf.
    expect(result.ledger).toBe(poor)
  })

  it('refuses a second tap on a toy already his', () => {
    const owner = ledgerFrom(COMMITTED)
    const result = buy(owner, { id: 'orc-1', price: 50 })

    expect(result.ok).toBe(false)
    if (result.ok) return

    expect(result.reason).toBe('owned')
    expect(result.ledger).toBe(owner)
  })

  it('lets the last coins go exactly', () => {
    const result = buy(ledgerFrom({ coins: 40, bought: [] }), VIKING)

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.ledger.coins).toBe(0)
  })
})

describe('handing the ledger to the shelf', () => {
  it('reads back as the state the shelf classifies', () => {
    const spent = buy(ledgerFrom(COMMITTED), VIKING)
    const shelf = shelfOf(spent.ledger)

    expect(shelf.coins).toBe(60)
    expect([...shelf.bought].sort()).toEqual(['orc-1', 'viking-1'])
  })
})
