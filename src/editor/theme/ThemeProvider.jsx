import { createContext, useMemo } from 'react'
import { resolveTheme, themeToStyle } from './theme'

export const ThemeContext = createContext({
  theme: 'light',
  resolved: resolveTheme('light'),
  style: themeToStyle(resolveTheme('light')),
  isDark: false,
})

/**
 * Provides editor theme tokens as React context.
 * CSS variables are applied by the Editor surface via `useTheme().style`.
 */
export function ThemeProvider({ theme = 'light', children }) {
  const resolved = useMemo(() => resolveTheme(theme), [theme])
  const cssVars = useMemo(() => themeToStyle(resolved), [resolved])
  const isDark =
    resolved.name === 'dark' ||
    (typeof theme === 'object' && theme?.mode === 'dark')

  const value = useMemo(
    () => ({
      theme,
      resolved,
      style: cssVars,
      isDark,
    }),
    [theme, resolved, cssVars, isDark],
  )

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}
