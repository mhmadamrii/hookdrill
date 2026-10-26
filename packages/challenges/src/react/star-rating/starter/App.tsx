const STARS = [1, 2, 3, 4, 5];

export default function App() {
  // TODO: keep the rating in state, add a hover preview, and clear the rating
  // when the current star is clicked again.
  // See the requirements for the data-testid and attributes each element needs.

  return (
    <div>
      <div data-testid="stars">
        {STARS.map((n) => (
          <button
            key={n}
            data-testid="star"
            data-filled="false"
            aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
          >
            ☆
          </button>
        ))}
      </div>
      <p data-testid="rating-label">Not rated</p>
    </div>
  );
}
