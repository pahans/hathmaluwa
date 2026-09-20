import { useEffect, useRef, useState } from 'react'

type CopyState = 'idle' | 'copied' | 'failed'

// Read-only code box with a copy button. Falls back to execCommand where the Clipboard API is unavailable.
export default function CopyCode({ id, label, value }: { id: string; label: string; value: string }) {
  const boxRef = useRef<HTMLTextAreaElement>(null)
  const timerRef = useRef<number | undefined>(undefined)
  const [state, setState] = useState<CopyState>('idle')

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  async function copy() {
    const box = boxRef.current
    if (!box) return
    box.focus()
    box.select()

    let ok = false
    try {
      await navigator.clipboard.writeText(value)
      ok = true
    } catch {
      try {
        ok = document.execCommand('copy')
      } catch {}
    }

    setState(ok ? 'copied' : 'failed')
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setState('idle'), 2000)
  }

  return (
    <>
      <textarea ref={boxRef} className="hm-badge-code" id={id} aria-label={label} readOnly spellCheck={false} value={value} />
      <button className="hm-btn" type="button" onClick={copy}>
        {state === 'copied' ? 'Copied' : state === 'failed' ? 'Press Ctrl+C to copy' : 'Copy code'}
      </button>
      <span className="hm-sr-only" role="status" aria-live="polite">
        {state === 'copied' ? 'Code copied to clipboard' : state === 'failed' ? 'Select the code and press Ctrl+C to copy' : ''}
      </span>
    </>
  )
}
