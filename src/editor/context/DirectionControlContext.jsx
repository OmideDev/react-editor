import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useDirection } from '../hooks/useDirection'

const DirectionControlContext = createContext({
  direction: 'ltr',
  mode: 'auto',
  isRTL: false,
  isLTR: true,
  setDirection: () => {},
  toggleDirection: () => {},
})

/**
 * Owns editor text direction and exposes toolbar toggle (LTR ↔ RTL).
 */
export function DirectionControlProvider({
  direction: directionProp = 'auto',
  children,
}) {
  const [mode, setMode] = useState(
    directionProp === 'rtl' || directionProp === 'ltr' ? directionProp : 'ltr',
  )

  const resolved = useDirection(mode)

  const setDirection = useCallback((next) => {
    if (next === 'rtl' || next === 'ltr') {
      setMode(next)
    }
  }, [])

  const toggleDirection = useCallback(() => {
    setMode((prev) => (prev === 'rtl' ? 'ltr' : 'rtl'))
  }, [])

  const value = useMemo(
    () => ({
      direction: resolved.direction,
      mode,
      isRTL: resolved.isRTL,
      isLTR: resolved.isLTR,
      setDirection,
      toggleDirection,
    }),
    [resolved.direction, resolved.isRTL, resolved.isLTR, mode, setDirection, toggleDirection],
  )

  return (
    <DirectionControlContext.Provider value={value}>
      {children}
    </DirectionControlContext.Provider>
  )
}

export function useEditorDirection() {
  return useContext(DirectionControlContext)
}
