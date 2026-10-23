import { pastContests, type Player } from '@/lib/sample-data'

function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++)
    h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const seedFor = (handle: string) => (hash(handle) % 100_000) + 1

/** Deterministic rating history for a sample player, ending at their current rating. */
export function ratingHistory(player: Player) {
  const rnd = mulberry32(hash(player.handle))
  const n = Math.max(2, player.contests)
  const start = Math.max(900, Math.round(player.rating - 500 - rnd() * 500))
  const out: number[] = []
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    const trend = start + (player.rating - start) * (1 - (1 - t) ** 1.6)
    const noise = (rnd() - 0.5) * 160 * (1 - t * 0.6)
    out.push(Math.round(trend + noise))
  }
  out[0] = start
  out[n - 1] = player.rating
  return out
}

/** Sample per-difficulty split of a player's solved count. */
export function solvedSplit(player: Player) {
  const rnd = mulberry32(hash(player.handle) ^ 0x9e3779b9)
  const hard = Math.round(player.solved * (0.12 + rnd() * 0.08))
  const easy = Math.round(player.solved * (0.36 + rnd() * 0.1))
  return { easy, medium: player.solved - easy - hard, hard }
}

/** Their last few contests, aligned with the tail of the rating history. */
export function recentContests(player: Player, history: number[]) {
  const rnd = mulberry32(hash(player.handle) ^ 0x51ed27)
  return pastContests
    .slice(0, Math.min(pastContests.length, history.length - 1))
    .map((c, i) => {
      const idx = history.length - 1 - i
      const participants = c.participants ?? 1000
      const strength = Math.max(0.002, (3000 - history[idx]) / 3000)
      return {
        contest: c,
        rank: Math.max(
          1,
          Math.round(participants * strength * (0.15 + rnd() * 0.5)),
        ),
        rating: history[idx],
        delta: history[idx] - history[idx - 1],
      }
    })
}
