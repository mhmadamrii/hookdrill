Build a playlist picker in `App.tsx` (default export `App`), like adding songs to a playlist in Spotify. The song library is in `songs.ts`.

## Requirements

- **Library**: render every song from `SONGS` with an **Add** button.
- **Add**: clicking **Add** appends the song to the end of the playlist. A song can only be in the playlist once: while it is in the playlist, its **Add** button is `disabled`.
- **Reorder**: each playlist item has **Up** and **Down** buttons that move it one position.
  - The **first** item's **Up** button is `disabled`.
  - The **last** item's **Down** button is `disabled`.
  - With a single item, both are `disabled`.
- **Remove**: each playlist item can be removed. Its **Add** button in the library becomes enabled again.
- **Empty state**: when the playlist is empty, show a message with `data-testid="playlist-empty"`. Hide it otherwise.

## Required `data-testid` selectors

| Test id            | Element                                                     |
| ------------------ | ----------------------------------------------------------- |
| `library-item`     | one per song in the library, in `SONGS` order               |
| `add-button`       | adds the song, inside `library-item`                        |
| `playlist-item`    | one per song in the playlist, in playlist order             |
| `song-title`       | the song's title, inside `library-item` and `playlist-item` |
| `move-up-button`   | moves the song up, inside `playlist-item`                   |
| `move-down-button` | moves the song down, inside `playlist-item`                 |
| `remove-button`    | removes the song, inside `playlist-item`                    |
| `playlist-empty`   | empty-playlist message                                      |

Use real `<button>` elements so `disabled` works.
