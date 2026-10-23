import type { SandpackTheme } from '@codesandbox/sandpack-react'

/** One theme for both modes: every colour is a CSS variable from app.css. */
export const editorTheme: SandpackTheme = {
  colors: {
    surface1: 'var(--card)',
    surface2: 'var(--border)',
    surface3: 'var(--surface-2)',
    clickable: 'var(--muted-foreground)',
    base: 'var(--foreground)',
    disabled: 'var(--muted-foreground)',
    hover: 'var(--foreground)',
    accent: 'var(--brand-text)',
    error: 'var(--wrong)',
    errorSurface: 'var(--card)',
  },
  syntax: {
    plain: 'var(--code-plain)',
    comment: { color: 'var(--code-comment)', fontStyle: 'italic' },
    keyword: 'var(--code-keyword)',
    tag: 'var(--code-tag)',
    punctuation: 'var(--code-punctuation)',
    definition: 'var(--code-definition)',
    property: 'var(--code-property)',
    static: 'var(--code-static)',
    string: 'var(--code-string)',
  },
  font: {
    body: 'var(--font-sans)',
    mono: '"JetBrains Mono Variable", ui-monospace, Menlo, monospace',
    size: '13.5px',
    lineHeight: '22px',
  },
}
