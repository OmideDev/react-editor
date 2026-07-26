export const THEME_PRESETS = {
  light: {
    name: 'light',
    primary: '#0f172a',
    radius: '16px',
    vars: {
      '--editor-bg': '#ffffff',
      '--editor-text': '#0f172a',
      '--editor-muted': '#64748b',
      '--editor-border': '#e2e8f0',
      '--editor-toolbar': 'rgba(255, 255, 255, 0.95)',
      '--editor-hover': '#f1f5f9',
      '--editor-active': '#0f172a',
      '--editor-active-text': '#ffffff',
      '--editor-placeholder': '#94a3b8',
      '--editor-focus-ring': 'rgba(148, 163, 184, 0.28)',
      '--editor-popover': '#ffffff',
      '--editor-popover-border': '#e2e8f0',
      '--editor-shadow': '0 1px 2px rgb(15 23 42 / 0.04)',
      '--editor-caret': '#0f172a',
      '--editor-surface': '#f8fafc',
      '--editor-danger': '#dc2626',
      '--editor-danger-bg': '#fef2f2',
    },
  },
  dark: {
    name: 'dark',
    primary: '#e2e8f0',
    radius: '16px',
    vars: {
      '--editor-bg': '#0f172a',
      '--editor-text': '#e2e8f0',
      '--editor-muted': '#94a3b8',
      '--editor-border': '#1e293b',
      '--editor-toolbar': 'rgba(15, 23, 42, 0.95)',
      '--editor-hover': '#1e293b',
      '--editor-active': '#e2e8f0',
      '--editor-active-text': '#0f172a',
      '--editor-placeholder': '#64748b',
      '--editor-focus-ring': 'rgba(148, 163, 184, 0.22)',
      '--editor-popover': '#111827',
      '--editor-popover-border': '#334155',
      '--editor-shadow': '0 8px 24px rgb(0 0 0 / 0.35)',
      '--editor-caret': '#e2e8f0',
      '--editor-surface': '#111827',
      '--editor-danger': '#f87171',
      '--editor-danger-bg': '#450a0a',
    },
  },
}

/**
 * Resolve theme prop into CSS variables + metadata.
 * @param {'light'|'dark'|object} theme
 */
export function resolveTheme(theme = 'light') {
  if (typeof theme === 'string') {
    return THEME_PRESETS[theme] ?? THEME_PRESETS.light
  }

  if (theme && typeof theme === 'object') {
    const baseName = theme.mode === 'dark' ? 'dark' : 'light'
    const base = THEME_PRESETS[baseName]
    const primary = theme.primary ?? base.primary
    const radius = theme.radius ?? base.radius

    return {
      name: 'custom',
      primary,
      radius,
      vars: {
        ...base.vars,
        ...(theme.vars || {}),
        '--editor-primary': primary,
        '--editor-radius': radius,
        ...(theme.primary
          ? {
              '--editor-active': primary,
            }
          : null),
      },
    }
  }

  return THEME_PRESETS.light
}

export function themeToStyle(themeConfig) {
  return {
    ...themeConfig.vars,
    '--editor-primary': themeConfig.primary,
    '--editor-radius': themeConfig.radius,
  }
}
