// Revealed one at a time, in order. Go from a nudge to almost the answer.
export const hints = [
  'Sort a copy of the players, then work out each rank from the scores. A rank is not the same thing as a row number.',
  'Sort with `b.score - a.score || a.name.localeCompare(b.name, undefined, { sensitivity: "base" })`: the `||` only falls through to the name when the scores are equal.',
  "A player's rank is 1 + the number of players with a strictly higher score. Compute it once, before flipping the order, so it stays tied to the score. Ranks 1, 2 and 3 map to gold, silver and bronze.",
]
