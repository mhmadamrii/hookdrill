import { useState } from "react";
import { SONGS } from "./songs";

export default function App() {
  const [playlist, setPlaylist] = useState<number[]>([]);

  function add(id: number) {
    if (!playlist.includes(id)) setPlaylist([...playlist, id]);
  }

  function remove(id: number) {
    setPlaylist(playlist.filter((p) => p !== id));
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= playlist.length) return;
    const next = [...playlist];
    [next[index], next[target]] = [next[target], next[index]];
    setPlaylist(next);
  }

  const byId = (id: number) => SONGS.find((s) => s.id === id)!;

  return (
    <div>
      <h2>Library</h2>
      <ul>
        {SONGS.map((song) => (
          <li key={song.id} data-testid="library-item">
            <span data-testid="song-title">{song.title}</span> — {song.artist}
            <button
              data-testid="add-button"
              disabled={playlist.includes(song.id)}
              onClick={() => add(song.id)}
            >
              Add
            </button>
          </li>
        ))}
      </ul>

      <h2>Playlist</h2>
      {playlist.length === 0 ? (
        <p data-testid="playlist-empty">Your playlist is empty.</p>
      ) : (
        <ol>
          {playlist.map((id, i) => (
            <li key={id} data-testid="playlist-item">
              <span data-testid="song-title">{byId(id).title}</span>
              <button
                data-testid="move-up-button"
                disabled={i === 0}
                onClick={() => move(i, -1)}
              >
                Up
              </button>
              <button
                data-testid="move-down-button"
                disabled={i === playlist.length - 1}
                onClick={() => move(i, 1)}
              >
                Down
              </button>
              <button data-testid="remove-button" onClick={() => remove(id)}>
                Remove
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
