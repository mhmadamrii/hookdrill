import { defineConfig } from 'vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  // One .env at the repo root; only VITE_* values reach the client.
  envDir: '../..',
  // ES workers can code-split, so the type checker fetches only the lib files it needs.
  worker: { format: 'es' },
  // Pre-bundle deps that are only reached lazily (type-check worker, confetti on a
  // solve, editor lint). Otherwise dev discovers them mid-session, re-optimizes and
  // reloads, and a half-reloaded page can end up with two copies of React
  // ("Cannot read properties of null (reading 'useState')").
  // react-tweet ships CSS modules, which Node can't import during SSR; let Vite bundle it.
  ssr: { noExternal: ['react-tweet'] },
  optimizeDeps: {
    include: ['typescript', 'canvas-confetti', '@codemirror/lint'],
  },
  // nitro() emits the server output (.vercel/output on Vercel, auto-detected).
  plugins: [tailwindcss(), tanstackStart(), nitro(), viteReact()],
})

export default config
