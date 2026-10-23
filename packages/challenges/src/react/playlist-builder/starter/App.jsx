import { SONGS } from "./songs.js";

export default function App() {
  // TODO: keep the playlist in state, then implement add, reorder, and remove.
  // See the requirements for the data-testid each element needs.

  return (
    <div>
      <h2>Library</h2>
      <ul>
        {SONGS.map((song) => (
          <li key={song.id} data-testid="library-item">
            <span data-testid="song-title">{song.title}</span> — {song.artist}
            <button data-testid="add-button">Add</button>
          </li>
        ))}
      </ul>

      <h2>Playlist</h2>
      <ul>{/* render one data-testid="playlist-item" per song */}</ul>
    </div>
  );
}
