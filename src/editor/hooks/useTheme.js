import { useContext } from 'react'
import { ThemeContext } from '../theme/ThemeProvider'

/**
 * Access the current editor theme tokens.
 */
export function useTheme() {
  return useContext(ThemeContext)
}
