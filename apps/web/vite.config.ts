import { defineConfig } from 'vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  // One .env at the repo root; only VITE_* values reach the client.
  envDir: '../..',
  // ES workers can code-split, so the type checker fetches only the lib files it needs.
  worker: { format: 'es' },
  plugins: [tailwindcss(), tanstackStart(), viteReact()],
})

export default config
