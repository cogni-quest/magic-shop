import { useEffect, useState } from 'react'
import { WALLET_KEY, load, save } from '@/adapters/storage'
import * as purse from '@/core/wallet'
import type { Item } from '@/shop/catalog'

/**
 * The three things a card can be, and the only reason the card needs to ask
 * about the wallet at all.
 */
export type ItemState = 'affordable' | 'short' | 'bought'

export interface Shop {
  readonly coins: number
  /** How many toys are on the shelf — what decides whether clearing it means anything. */
  readonly boughtCount: number
  readonly stateOf: (item: Item) => ItemState
  readonly shortfall: (item: Item) => number
  readonly setCoins: (coins: number) => void
  readonly buy: (item: Item) => void
  readonly refund: (item: Item) => void
  readonly clearPurchases: () => void
}

/**
 * All of the shop's state, in one hook, so the components below stay
 * presentational — CogniQuest's `useBattle` in miniature.
 *
 * The wallet is read synchronously in the initialiser and written back on every
 * change. No loading screen: `localStorage` answers before the first paint, and
 * a shop that flickers through an empty shelf on every open would look broken
 * to a child who bought something yesterday.
 */
export function useWallet(): Shop {
  const [wallet, setWallet] = useState<purse.WalletData>(() => purse.readWallet(load(WALLET_KEY)))

  // Writing on every change, the mount included. The extra write costs nothing
  // and it means there is exactly one place that saves.
  useEffect(() => {
    save(WALLET_KEY, wallet)
  }, [wallet])

  return {
    coins: wallet.coins,
    boughtCount: Object.keys(wallet.bought).length,

    stateOf: (item) => {
      if (purse.isBought(wallet, item.id)) return 'bought'
      return purse.canAfford(wallet, item) ? 'affordable' : 'short'
    },

    shortfall: (item) => purse.shortfall(wallet, item),

    setCoins: (coins) => setWallet((current) => purse.setCoins(current, coins)),

    // The refusals are already unreachable through the buttons, and the core
    // hands back the untouched wallet for both — so this can stay one line and
    // still be safe against a double tap.
    buy: (item) => setWallet((current) => purse.buy(current, item).wallet),

    refund: (item) => setWallet((current) => purse.refund(current, item)),

    clearPurchases: () => setWallet(purse.forgetPurchases),
  }
}
