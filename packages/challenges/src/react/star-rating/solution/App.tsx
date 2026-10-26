import { useState } from "react";

const STARS = [1, 2, 3, 4, 5];

export default function App() {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const shown = hovered ?? rating;

  return (
    <div>
      <div data-testid="stars" onMouseLeave={() => setHovered(null)}>
        {STARS.map((n) => (
          <button
            key={n}
            data-testid="star"
            data-filled={String(n <= shown)}
            aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
            onMouseEnter={() => setHovered(n)}
            onClick={() => setRating(n === rating ? 0 : n)}
          >
            {n <= shown ? "★" : "☆"}
          </button>
        ))}
      </div>
      <p data-testid="rating-label">
        {rating === 0 ? "Not rated" : `Rated ${rating} of 5`}
      </p>
    </div>
  );
}
