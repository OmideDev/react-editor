import { useDirection } from '../hooks/useDirection'

/**
 * Applies LTR/RTL/auto direction to the Lexical root.
 */
export function DirectionPlugin({ direction = 'auto' }) {
  useDirection(direction)
  return null
}
