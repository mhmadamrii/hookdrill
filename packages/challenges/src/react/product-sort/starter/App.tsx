import { PRODUCTS } from "./products";

export default function App() {
  // TODO: sort the products by the option chosen in the dropdown, and show
  // each price as dollars ($9.99). Don't change the PRODUCTS array itself.
  // See the requirements for the data-testid each element needs.

  return (
    <div>
      <label>
        Sort by{" "}
        <select data-testid="sort-select">
          <option value="featured">Featured</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="rating">Top rated</option>
          <option value="newest">Newest</option>
        </select>
      </label>
      <ul>
        {PRODUCTS.map((p) => (
          <li key={p.id} data-testid="product" data-id={p.id}>
            <h3>{p.name}</h3>
            <p data-testid="price">{p.priceCents}</p>
            <p>★ {p.rating}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
