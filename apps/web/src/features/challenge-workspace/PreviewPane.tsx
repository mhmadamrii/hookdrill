import { useEffect, useRef, useState } from 'react'
import { SandpackPreview, useSandpack } from '@codesandbox/sandpack-react'
import type { SandpackPreviewRef } from '@codesandbox/sandpack-react'

/**
 * Live preview with its own error overlay. Sandpack's built-in overlay reads
 * provider-wide error state, so failures from the hidden test runner leak
 * into it. Here we only listen to the preview's own bundler client.
 */
export function PreviewPane() {
  const ref = useRef<SandpackPreviewRef>(null)
  const { listen } = useSandpack()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const clientId = ref.current?.clientId
    if (!clientId) return
    return listen((msg) => {
      if (msg.type === 'start' || (msg.type === 'done' && !msg.compilatonError)) {
        setError(null)
      } else if (msg.type === 'action' && msg.action === 'show-error') {
        setError(`${msg.title}\n${msg.message}`)
      }
    }, clientId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="relative h-full bg-white">
      <SandpackPreview
        ref={ref}
        showOpenInCodeSandbox={false}
        showSandpackErrorOverlay={false}
        showRefreshButton
        style={{ height: '100%' }}
      />
      {error && (
        <pre className="absolute inset-0 overflow-auto bg-card p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-wrong">
          {error}
        </pre>
      )}
    </div>
  )
}
