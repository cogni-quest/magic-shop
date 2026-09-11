import { describe, expect, it } from 'vitest'
import {
  MAX_COINS,
  WALLET_VERSION,
  buy,
  canAfford,
  emptyWallet,
  forgetPurchases,
  isBought,
  readWallet,
  refund,
  setCoins,
  shortfall,
} from './wallet'

/** A toy at the price the orcs actually cost, so the sums read like the shop. */
const orc = { id: 'orc-1', price: 50 }

/** A fixed clock, so «when it was bought» is a value a test can name. */
const at = () => 1_700_000_000_000

/** Buys, and fails the test rather than the type-checker when it should not have. */
function bought(coins: number) {
  const result = buy(setCoins(emptyWallet(), coins), orc, at)
  if (!result.ok) throw new Error(`buying at ${coins} coins should have gone through`)
  return result.wallet
}

describe('a fresh wallet', () => {
  it('is empty and stamped with this build version', () => {
    expect(emptyWallet()).toEqual({ version: WALLET_VERSION, coins: 0, bought: {} })
  })
})

describe('setting the balance', () => {
  it('takes a whole number as given', () => {
    expect(setCoins(emptyWallet(), 120).coins).toBe(120)
  })

  it('rounds a fraction — there is no half coin', () => {
    expect(setCoins(emptyWallet(), 12.7).coins).toBe(13)
  })

  it('flattens a negative to nothing rather than refusing it', () => {
    expect(setCoins(emptyWallet(), -5).coins).toBe(0)
  })

  it('caps an absurd number instead of letting it off the screen', () => {
    expect(setCoins(emptyWallet(), 5_000_000).coins).toBe(MAX_COINS)
  })

  it('reads nonsense as nothing', () => {
    expect(setCoins(emptyWallet(), Number.NaN).coins).toBe(0)
  })

  it('does not un-buy anything', () => {
    expect(isBought(setCoins(bought(50), 300), orc.id)).toBe(true)
  })
})

describe('what the child can reach', () => {
  it('can afford a price below the balance', () => {
    expect(canAfford(setCoins(emptyWallet(), 60), orc)).toBe(true)
  })

  it('can afford a price exactly equal to the balance', () => {
    expect(canAfford(setCoins(emptyWallet(), 50), orc)).toBe(true)
  })

  it('cannot afford a price one coin above it', () => {
    expect(canAfford(setCoins(emptyWallet(), 49), orc)).toBe(false)
  })

  it('reports the shortfall, and nothing when there is none', () => {
    expect(shortfall(setCoins(emptyWallet(), 30), orc)).toBe(20)
    expect(shortfall(setCoins(emptyWallet(), 80), orc)).toBe(0)
  })
})

describe('buying', () => {
  it('debits exactly the price and records the moment', () => {
    const wallet = bought(80)
    expect(wallet.coins).toBe(30)
    expect(wallet.bought[orc.id]).toBe(at())
  })

  it('spends the last coin — equal to the price is affordable', () => {
    expect(bought(50).coins).toBe(0)
  })

  it('refuses when the coins are short, and changes nothing', () => {
    const wallet = setCoins(emptyWallet(), 49)
    const result = buy(wallet, orc, at)
    expect(result).toEqual({ ok: false, reason: 'poor', wallet })
    expect(result.wallet).toBe(wallet)
  })

  it('refuses the second tap on a toy already owned', () => {
    const first = bought(200)
    const second = buy(first, orc, at)
    expect(second).toEqual({ ok: false, reason: 'owned', wallet: first })
    // The whole point of the guard: a double tap must not cost a second fifty.
    expect(second.wallet.coins).toBe(150)
  })

  it('leaves the wallet it was handed untouched', () => {
    const wallet = setCoins(emptyWallet(), 80)
    const before = structuredClone(wallet)
    buy(wallet, orc, at)
    expect(wallet).toEqual(before)
  })
})

describe('giving it back', () => {
  it('returns exactly the price and forgets the toy', () => {
    const back = refund(bought(80), orc)
    expect(back.coins).toBe(80)
    expect(isBought(back, orc.id)).toBe(false)
  })

  it('is a no-op for a toy that was never bought', () => {
    const wallet = setCoins(emptyWallet(), 10)
    expect(refund(wallet, orc)).toBe(wallet)
  })

  it('lets the toy be bought again afterwards', () => {
    expect(buy(refund(bought(50), orc), orc, at).ok).toBe(true)
  })
})

describe('clearing the shelf', () => {
  it('forgets the purchases and leaves the balance alone', () => {
    const cleared = forgetPurchases(bought(80))
    expect(cleared.bought).toEqual({})
    expect(cleared.coins).toBe(30)
  })
})

describe('reading a save', () => {
  it('starts fresh on anything that is not a record', () => {
    expect(readWallet(null)).toEqual(emptyWallet())
    expect(readWallet('nonsense')).toEqual(emptyWallet())
    expect(readWallet(42)).toEqual(emptyWallet())
    expect(readWallet(undefined)).toEqual(emptyWallet())
  })

  it('starts fresh on a version it does not know', () => {
    expect(readWallet({ version: 99, coins: 500, bought: { 'orc-1': 1 } })).toEqual(emptyWallet())
  })

  it('back-fills a missing field — a save is never wiped over a gap', () => {
    const wallet = readWallet({ version: WALLET_VERSION, coins: 70 })
    expect(wallet.coins).toBe(70)
    expect(wallet.bought).toEqual({})
  })

  it('re-clamps a hand-edited balance', () => {
    expect(readWallet({ version: WALLET_VERSION, coins: -10, bought: {} }).coins).toBe(0)
    expect(readWallet({ version: WALLET_VERSION, coins: 1e9, bought: {} }).coins).toBe(MAX_COINS)
  })

  it('drops shelf entries that are not moments', () => {
    const wallet = readWallet({
      version: WALLET_VERSION,
      coins: 10,
      bought: { 'orc-1': 1_700_000_000_000, 'orc-2': 'yesterday' },
    })
    expect(wallet.bought).toEqual({ 'orc-1': 1_700_000_000_000 })
  })

  it('survives a round trip through JSON unchanged', () => {
    const wallet = bought(80)
    expect(readWallet(JSON.parse(JSON.stringify(wallet)))).toEqual(wallet)
  })
})
