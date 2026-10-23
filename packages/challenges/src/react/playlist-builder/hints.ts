export const hints = [
  'Keep the library as the static `SONGS` import and store only the playlist in state, as an array of song ids (or song objects).',
  'A song is "in the playlist" if `playlist.includes(song.id)`. Use that to set `disabled` on its Add button.',
  'To move item `i` up, swap it with `i - 1`; to move it down, swap it with `i + 1`. Copy the array first: `const next = [...playlist]`.',
  'The boundary rules fall out of the index: `disabled={i === 0}` for up, `disabled={i === playlist.length - 1}` for down.',
]
