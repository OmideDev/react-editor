import { THEME_PRESETS, resolveTheme, themeToStyle } from '../theme/theme'

/**
 * Public theme API.
 */
export const EditorTheme = {
  presets: THEME_PRESETS,
  resolve: resolveTheme,
  toStyle: themeToStyle,
  light: THEME_PRESETS.light,
  dark: THEME_PRESETS.dark,
}

export { THEME_PRESETS, resolveTheme, themeToStyle }
