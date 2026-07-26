/** Safe DOM / browser checks for SSR. */
export const canUseDOM = Boolean(
  typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    document.createElement,
)

export function getDocument() {
  return canUseDOM ? document : null
}

export function getWindow() {
  return canUseDOM ? window : null
}
