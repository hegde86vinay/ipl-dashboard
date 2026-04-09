import { describe, it, expect } from 'vitest'
import { cn } from '../src/lib/utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const isDisabled = false
    expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active')
  })

  it('should merge Tailwind classes with proper precedence', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('should handle empty and undefined values', () => {
    expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2')
  })
})