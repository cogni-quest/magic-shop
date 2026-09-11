import { describe, expect, it } from 'vitest'
import { ru } from './ru'

describe('counting coins in Russian', () => {
  it('agrees with the last digit', () => {
    expect(ru.coins(1)).toBe('1 монета')
    expect(ru.coins(2)).toBe('2 монеты')
    expect(ru.coins(4)).toBe('4 монеты')
    expect(ru.coins(5)).toBe('5 монет')
    expect(ru.coins(0)).toBe('0 монет')
  })

  it('makes the eleven-to-fourteen exception', () => {
    expect(ru.coins(11)).toBe('11 монет')
    expect(ru.coins(12)).toBe('12 монет')
    expect(ru.coins(14)).toBe('14 монет')
  })

  it('follows the last digit again past twenty', () => {
    expect(ru.coins(21)).toBe('21 монета')
    expect(ru.coins(22)).toBe('22 монеты')
    expect(ru.coins(25)).toBe('25 монет')
    expect(ru.coins(111)).toBe('111 монет')
    expect(ru.coins(121)).toBe('121 монета')
  })
})
