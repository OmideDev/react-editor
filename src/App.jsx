import { useCallback, useState } from 'react'
import { Editor } from './editor'

const STORAGE_KEY = 'omid-editor-demo-doc'

function readSavedValue() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function App() {
  const [initialValue] = useState(() => readSavedValue())

  const handleChange = useCallback(({ json }) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(json))
    } catch {
      // ignore
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Editor
          value={initialValue}
          onChange={handleChange}
          direction="rtl"
        />
      </main>
    </div>
  )
}

export default App
