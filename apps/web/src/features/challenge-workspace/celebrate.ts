// Confetti for an accepted submission. Loaded on demand so it costs nothing
// until someone actually solves a problem.

/** Brand, accepted and difficulty colours, read from the live theme. */
function themeColors() {
  const css = getComputedStyle(document.documentElement)
  return ['--primary', '--accepted', '--easy', '--medium', '--brand-text']
    .map((v) => css.getPropertyValue(v).trim())
    .filter(Boolean)
}

export async function celebrate() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const { default: confetti } = await import('canvas-confetti')
  const colors = themeColors()
  const base = { colors, disableForReducedMotion: true, zIndex: 60, ticks: 220 }
  // Two bursts from the bottom corners, angled toward the middle.
  confetti({
    ...base,
    particleCount: 80,
    angle: 60,
    spread: 70,
    origin: { x: 0, y: 0.9 },
  })
  confetti({
    ...base,
    particleCount: 80,
    angle: 120,
    spread: 70,
    origin: { x: 1, y: 0.9 },
  })
  setTimeout(() => {
    confetti({
      ...base,
      particleCount: 60,
      spread: 100,
      startVelocity: 35,
      origin: { x: 0.5, y: 0.35 },
    })
  }, 250)
}
