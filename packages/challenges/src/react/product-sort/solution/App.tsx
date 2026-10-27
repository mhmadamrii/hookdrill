import { useMemo, useState } from "react";
import { PRODUCTS, type Product } from "./products";

type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "newest";

// null means "keep the original order".
const compare: Record<SortKey, ((a: Product, b: Product) => number) | null> = {
  featured: null,
  "price-asc": (a, b) => a.priceCents - b.priceCents,
  "price-desc": (a, b) => b.priceCents - a.priceCents,
  rating: (a, b) => b.rating - a.rating,
  newest: (a, b) => Date.parse(b.addedAt) - Date.parse(a.addedAt),
};

const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export default function App() {
  const [sortKey, setSortKey] = useState<SortKey>("featured");

  // Derived on render. Sort a copy: .sort() works in place and would
  // otherwise scramble PRODUCTS, losing the featured order for good.
  // Array.prototype.sort is stable, so ties keep their featured order.
  const products = useMemo(() => {
    const cmp = compare[sortKey];
    return cmp ? [...PRODUCTS].sort(cmp) : PRODUCTS;
  }, [sortKey]);

  return (
    <div>
      <label>
        Sort by{" "}
        <select
          data-testid="sort-select"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
        >
          <option value="featured">Featured</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="rating">Top rated</option>
          <option value="newest">Newest</option>
        </select>
      </label>
      <ul>
        {products.map((p) => (
          <li key={p.id} data-testid="product" data-id={p.id}>
            <h3>{p.name}</h3>
            <p data-testid="price">{formatCents(p.priceCents)}</p>
            <p>★ {p.rating}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
