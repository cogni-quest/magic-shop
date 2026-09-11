import { describe, expect, it } from 'vitest'
import { faultsIn } from '@/core/shelf'
import { ITEMS } from './catalog'
import { STATE } from './state'

/**
 * The file a parent edits at ten in the evening, checked by the thing CI runs
 * before it deploys. A mistyped id would otherwise show up as a toy the child
 * owns and cannot see, or one he is still saving for after it was given to him.
 */
describe('the state file as committed', () => {
  it('has nothing wrong with it', () => {
    expect(
      faultsIn(
        STATE,
        ITEMS.map((item) => item.id),
      ),
    ).toEqual([])
  })
})
