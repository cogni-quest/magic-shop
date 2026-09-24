import { describe, expect, it } from 'vitest'
import type { ShelfState } from './shelf'
import {
  GRANTED,
  LEDGER_VERSION,
  MAX_COINS,
  buy,
  coinsLeft,
  earnedIn,
  ledgerFrom,
  readLedger,
  refund,
  shelfOf,
} from './wallet'

const ORC_1 = { id: 'orc-1', price: 50 }
const ORC = { id: 'orc-2', price: 50 }
const VIKING = { id: 'viking-1', price: 40 }
const CATALOG = [ORC_1, ORC, VIKING]

/** `state.json`: 100 coins in hand on the day, and orc-1 already his. */
const COMMITTED: ShelfState = { coins: 100, bought: ['orc-1'] }

/** Gold Quest held when the ledger first met it — mostly long spent. */
const AT_START = 300

const fresh = () => ledgerFrom(COMMITTED, CATALOG, AT_START)

/** A save as it would come back out of `localStorage`. */
function saved(over: Record<string, unknown> = {}) {
  return JSON.parse(JSON.stringify({ ...fresh(), ...over }))
}

describe('where the count starts', () => {
  it('is the file’s coins on the day, whatever Quest held', () => {
    expect(coinsLeft(fresh(), AT_START)).toBe(100)
  })

  it('counts only the gold earned after that', () => {
    expect(coinsLeft(fresh(), AT_START + 7)).toBe(107)
  })

  it('does not charge for what the file granted — it is paid for in those coins', () => {
    const ledger = fresh()

    expect(ledger.bought['orc-1']).toEqual({ at: GRANTED, price: 50 })
    expect(ledger.spent).toBe(AT_START - 100)
  })

  it('goes negative in `spent` when Quest held less than the coins', () => {
    const ledger = ledgerFrom(COMMITTED, CATALOG, 5)

    expect(ledger.spent).toBe(-95)
    expect(coinsLeft(ledger, 5)).toBe(100)
  })

  it('keeps its starting gold across reopenings, however much Quest has since', () => {
    const reopened = readLedger(saved(), COMMITTED, CATALOG, 999)

    expect(reopened.start.gold).toBe(AT_START)
    expect(coinsLeft(reopened, AT_START + 20)).toBe(120)
  })

  it('takes the file’s coins afresh on every open, so a correction is a commit', () => {
    const reopened = readLedger(saved(), { ...COMMITTED, coins: 17 }, CATALOG, 999)

    expect(coinsLeft(reopened, AT_START)).toBe(17)
  })

  it('starts from Quest’s gold now for a save without a start', () => {
    const { start: _, ...noStart } = saved()
    expect(readLedger(noStart, COMMITTED, CATALOG, 42).start.gold).toBe(42)
  })
})

describe('the file and the tablet together', () => {
  it('reads a save it wrote itself', () => {
    const spent = buy(fresh(), ORC, AT_START)
    const reopened = readLedger(JSON.parse(JSON.stringify(spent.ledger)), COMMITTED, CATALOG, 0)

    expect(coinsLeft(reopened, AT_START)).toBe(50)
    expect('orc-2' in reopened.bought).toBe(true)
  })

  it('keeps the tablet’s purchases when the file changes', () => {
    const spent = buy(fresh(), VIKING, AT_START)
    const reopened = readLedger(spent.ledger, { coins: 100, bought: ['orc-1', 'orc-2'] }, CATALOG, 0)

    expect(Object.keys(reopened.bought).sort()).toEqual(['orc-1', 'orc-2', 'viking-1'])
    expect(coinsLeft(reopened, AT_START)).toBe(60)
  })

  it('keeps what the file says he owns, even if the save lost it', () => {
    expect('orc-1' in readLedger(saved({ bought: {} }), COMMITTED, CATALOG, 0).bought).toBe(true)
  })

  it('drops a granted toy the file no longer lists', () => {
    expect(readLedger(saved(), { coins: 100, bought: [] }, CATALOG, 0).bought).toEqual({})
  })

  it('stops charging for a toy bought here once the file grants it', () => {
    const spent = buy(fresh(), VIKING, AT_START, () => 1_700_000)
    const reopened = readLedger(spent.ledger, { coins: 60, bought: ['orc-1', 'viking-1'] }, CATALOG, 0)

    expect(reopened.bought['viking-1']?.at).toBe(GRANTED)
    expect(coinsLeft(reopened, AT_START)).toBe(60)
  })
})

describe('reading a save that cannot be trusted', () => {
  it('falls back to the file for junk, null and an unknown version', () => {
    for (const raw of [null, 'nonsense', 42, [], { version: 99 }, saved({ version: 3 })]) {
      expect(readLedger(raw, COMMITTED, CATALOG, AT_START)).toEqual(fresh())
    }
  })

  it('works out what was spent rather than believing the save', () => {
    expect(readLedger(saved({ spent: 0 }), COMMITTED, CATALOG, 0).spent).toBe(AT_START - 100)
  })

  it('drops entries in bought that are not purchases', () => {
    const reopened = readLedger(
      saved({
        bought: {
          'orc-2': 'yesterday',
          'viking-1': { at: 12 },
          'viking-2': { at: 12, price: 40 },
        },
      }),
      COMMITTED,
      CATALOG,
      0,
    )

    expect('orc-2' in reopened.bought).toBe(false)
    expect('viking-1' in reopened.bought).toBe(false)
    expect(reopened.bought['viking-2']).toEqual({ at: 12, price: 40 })
  })

  it('clamps a price or a starting gold edited in devtools', () => {
    const reopened = readLedger(
      saved({ start: { gold: -1e9 }, bought: { 'orc-2': { at: 5, price: -1e9 } } }),
      { coins: 0, bought: [] },
      CATALOG,
      0,
    )
    expect(reopened.spent).toBe(0)
  })

  it('stamps what it returns with this build', () => {
    expect(readLedger(null, COMMITTED, CATALOG, 0).version).toBe(LEDGER_VERSION)
  })
})

/**
 * What a tablet that ran the shop before Quest's gold was joined in has saved:
 * a balance of its own, a fingerprint, and moments with no prices.
 */
describe('upgrading a version-1 save', () => {
  const v1 = {
    version: 1,
    base: '[53,["orc-1","orc-2"]]',
    coins: 13,
    bought: { 'orc-1': 0, 'viking-1': 1_700_000, 'orc-2': 'junk' },
  }

  it('keeps the purchases, priced from the catalogue', () => {
    const upgraded = readLedger(v1, COMMITTED, CATALOG, 200)

    expect(upgraded.version).toBe(LEDGER_VERSION)
    expect(upgraded.bought['viking-1']).toEqual({ at: 1_700_000, price: 40 })
    expect(upgraded.bought['orc-1']?.at).toBe(GRANTED)
    expect('orc-2' in upgraded.bought).toBe(false)
  })

  it('forgets its balance and starts the count from Quest’s gold now', () => {
    const upgraded = readLedger(v1, COMMITTED, CATALOG, 200)

    expect(upgraded.start.gold).toBe(200)
    // The file's 100, less the viking it bought.
    expect(coinsLeft(upgraded, 200)).toBe(60)
  })
})

describe('reading the gold out of Quest’s save', () => {
  it('takes the gold from a profile Quest wrote', () => {
    expect(earnedIn({ version: 1, name: 'Миша', gold: 73 })).toBe(73)
  })

  it('sees nothing where there is no sound profile', () => {
    for (const raw of [null, 'x', 7, {}, { version: 2, gold: 50 }, { version: 1, gold: '50' }]) {
      expect(earnedIn(raw)).toBe(0)
    }
  })

  it('clamps a gold count edited in devtools', () => {
    expect(earnedIn({ version: 1, gold: 1e9 })).toBe(MAX_COINS)
    expect(earnedIn({ version: 1, gold: -3 })).toBe(0)
    expect(earnedIn({ version: 1, gold: 12.7 })).toBe(13)
  })
})

describe('what is left to spend', () => {
  it('is never below nothing — after a new game in Quest, say', () => {
    expect(coinsLeft(fresh(), 0)).toBe(0)
  })
})

describe('buying', () => {
  it('records the price and the moment, and takes the price', () => {
    const result = buy(fresh(), VIKING, AT_START, () => 1_700_000)

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.ledger.bought['viking-1']).toEqual({ at: 1_700_000, price: 40 })
    expect(coinsLeft(result.ledger, AT_START)).toBe(60)
  })

  it('leaves the ledger it was given alone', () => {
    const before = fresh()
    buy(before, VIKING, AT_START)

    expect(before.spent).toBe(AT_START - 100)
    expect('viking-1' in before.bought).toBe(false)
  })

  it('refuses what he cannot afford, and changes nothing', () => {
    const ledger = ledgerFrom({ coins: 39, bought: [] }, CATALOG, 0)
    const result = buy(ledger, VIKING, 0)

    expect(result.ok).toBe(false)
    if (result.ok) return

    expect(result.reason).toBe('poor')
    // By identity: a refusal must not so much as re-render the shelf.
    expect(result.ledger).toBe(ledger)
  })

  it('refuses a second tap on a toy already his', () => {
    const owner = fresh()
    const result = buy(owner, ORC_1, AT_START)

    expect(result.ok).toBe(false)
    if (result.ok) return

    expect(result.reason).toBe('owned')
    expect(result.ledger).toBe(owner)
  })

  it('lets the last coins go exactly', () => {
    const result = buy(ledgerFrom({ coins: 40, bought: [] }, CATALOG, 0), VIKING, 0)

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(coinsLeft(result.ledger, 0)).toBe(0)
  })
})

describe('putting a purchase back', () => {
  it('returns the coins and clears the toy', () => {
    const result = refund(buy(fresh(), VIKING, AT_START).ledger, VIKING)

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(coinsLeft(result.ledger, AT_START)).toBe(100)
    expect('viking-1' in result.ledger.bought).toBe(false)
  })

  it('returns what was paid, not what the shelf asks today', () => {
    const result = refund(buy(fresh(), VIKING, AT_START).ledger, { id: 'viking-1', price: 999 })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(coinsLeft(result.ledger, AT_START)).toBe(100)
  })

  it('leaves the ledger it was given alone', () => {
    const before = buy(fresh(), VIKING, AT_START).ledger
    refund(before, VIKING)

    expect('viking-1' in before.bought).toBe(true)
  })

  it('refuses what was never bought, and changes nothing', () => {
    const ledger = fresh()
    const result = refund(ledger, VIKING)

    expect(result.ok).toBe(false)
    if (result.ok) return

    expect(result.reason).toBe('not-bought')
    expect(result.ledger).toBe(ledger)
  })

  /**
   * The one that would be free money. `readLedger` asserts the committed file's
   * purchases on every open, so a toy sold back here would walk in again on the
   * next reload with the coins still in his pocket.
   */
  it('refuses to sell back what the committed file granted', () => {
    const ledger = fresh()
    const result = refund(ledger, ORC_1)

    expect(result.ok).toBe(false)
    if (result.ok) return

    expect(result.reason).toBe('granted')
    expect(result.ledger).toBe(ledger)
  })

  it('refuses it even when the save claims a moment for it', () => {
    // The other writer of this record is a child with devtools open, and a
    // moment typed in against a granted toy is the one edit that would pay.
    const tampered = readLedger(
      saved({ bought: { 'orc-1': { at: 1_700_000, price: 50 } } }),
      COMMITTED,
      CATALOG,
      0,
    )

    expect(tampered.bought['orc-1']?.at).toBe(GRANTED)
    expect(refund(tampered, ORC_1).ok).toBe(false)
  })

  it('can be bought again after being put back', () => {
    const back = refund(buy(fresh(), VIKING, AT_START).ledger, VIKING)
    if (!back.ok) return

    const again = buy(back.ledger, VIKING, AT_START, () => 1_700_001)

    expect(again.ok).toBe(true)
    if (!again.ok) return

    expect(again.ledger.bought['viking-1']?.at).toBe(1_700_001)
  })
})

describe('handing the ledger to the shelf', () => {
  it('reads back as the state the shelf classifies', () => {
    const shelf = shelfOf(buy(fresh(), VIKING, AT_START).ledger, AT_START)

    expect(shelf.coins).toBe(60)
    expect([...shelf.bought].sort()).toEqual(['orc-1', 'viking-1'])
  })
})
