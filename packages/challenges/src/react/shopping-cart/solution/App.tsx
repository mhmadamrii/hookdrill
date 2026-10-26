import { useState } from "react";
import { PRODUCTS, type Product } from "./products";

type Line = { product: Product; quantity: number };

const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export default function App() {
  const [cart, setCart] = useState<Line[]>([]);

  function add(product: Product) {
    setCart((lines) =>
      lines.some((l) => l.product.id === product.id)
        ? lines.map((l) =>
            l.product.id === product.id
              ? { ...l, quantity: l.quantity + 1 }
              : l,
          )
        : [...lines, { product, quantity: 1 }],
    );
  }

  function changeQuantity(id: string, delta: number) {
    setCart((lines) =>
      lines
        .map((l) =>
          l.product.id === id ? { ...l, quantity: l.quantity + delta } : l,
        )
        .filter((l) => l.quantity > 0),
    );
  }

  function remove(id: string) {
    setCart((lines) => lines.filter((l) => l.product.id !== id));
  }

  // Derived from the cart on every render instead of stored separately.
  const count = cart.reduce((n, l) => n + l.quantity, 0);
  const total = cart.reduce((n, l) => n + l.product.priceCents * l.quantity, 0);

  return (
    <div>
      <h1>Shop</h1>
      <ul>
        {PRODUCTS.map((product) => (
          <li key={product.id} data-testid="product" data-id={product.id}>
            {product.name} · {formatCents(product.priceCents)}
            <button data-testid="add-button" onClick={() => add(product)}>
              Add to cart
            </button>
          </li>
        ))}
      </ul>

      <h2>Cart</h2>
      {cart.length === 0 ? (
        <p data-testid="empty-cart">Your cart is empty.</p>
      ) : (
        <ul>
          {cart.map(({ product, quantity }) => (
            <li key={product.id} data-testid="cart-item" data-id={product.id}>
              {product.name}
              <button
                data-testid="decrease-button"
                aria-label={`One less ${product.name}`}
                onClick={() => changeQuantity(product.id, -1)}
              >
                −
              </button>
              <span data-testid="item-quantity">{quantity}</span>
              <button
                data-testid="increase-button"
                aria-label={`One more ${product.name}`}
                onClick={() => changeQuantity(product.id, 1)}
              >
                +
              </button>
              <button
                data-testid="remove-button"
                onClick={() => remove(product.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <p>
        Items: <span data-testid="cart-count">{count}</span>
      </p>
      <p>
        Total: <span data-testid="cart-total">{formatCents(total)}</span>
      </p>
    </div>
  );
}
