Build a five-star rating in `App.tsx` (default export `App`).

## Requirements

- **Rate**: clicking a star sets the rating to that star's number. Stars from 1 up to the rating are filled.
- **Change**: clicking a different star changes the rating.
- **Clear**: clicking the star that matches the current rating clears it back to no rating.
- **Preview**: hovering a star fills the stars up to it without changing the rating. When the pointer leaves the stars, they show the rating again.
- **Label**: shows `Not rated`, or `Rated N of 5`.

Each star exposes `data-filled="true"` when it is filled and `data-filled="false"` when it isn't.

## Required `data-testid` selectors

| Test id        | Element                                       |
| -------------- | --------------------------------------------- |
| `stars`        | the element containing all five stars         |
| `star`         | one `<button>` per star, in order from 1 to 5 |
| `rating-label` | the text label described above                |
