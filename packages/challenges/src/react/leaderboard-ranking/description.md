Build a leaderboard in `App.tsx` (default export `App`). The players are given in `players.ts`, in no particular order.

## Requirements

- **Order**: list the players by score, highest first.
- **Ties**: players with equal scores are ordered by name A→Z, **ignoring upper and lower case**.
- **Competition ranking**: show each player's rank. Tied players share a rank, and the next rank skips the places they used: scores 100, 90, 90, 80 rank **1, 2, 2, 4**. Show the rank as just the number.
- **Medals**: players ranked 1, 2 and 3 get `data-medal="gold"`, `"silver"` and `"bronze"` on their row. It goes by **rank**, not row: a tie at 3 gives every tied player bronze, and nobody ranked 4 or lower gets a medal. Other rows have no `data-medal` attribute.
- **Flip the order**: the order button switches to lowest score first, and back again. Ties stay A→Z by name. Ranks don't change: a rank is about the score, not the position in the list.

## Required `data-testid` selectors

| Test id        | Element                                                                                                   |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| `player`       | one row per player, in display order, with `data-id` set to their `id`, and `data-medal` for ranks 1 to 3 |
| `rank`         | the player's rank as text, inside their row                                                               |
| `order-button` | switches between highest first and lowest first                                                           |
