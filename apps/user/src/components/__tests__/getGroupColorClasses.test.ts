import { describe, it, expect } from 'vitest'
import { getGroupColorClasses } from '../getGroupColorClasses'

describe('getGroupColorClasses', () => {
  it('returns classes for known colors', () => {
    expect(getGroupColorClasses('red')).toEqual({ bg: 'bg-red-500', border: 'border-l-red-500' })
    expect(getGroupColorClasses('blue')).toEqual({ bg: 'bg-blue-500', border: 'border-l-blue-500' })
  })

  it('falls back to blue when color is undefined', () => {
    expect(getGroupColorClasses(undefined)).toEqual({ bg: 'bg-blue-500', border: 'border-l-blue-500' })
  })

  it('falls back to blue for unknown color', () => {
    expect(getGroupColorClasses('unknown' as string)).toEqual({ bg: 'bg-blue-500', border: 'border-l-blue-500' })
  })
})


