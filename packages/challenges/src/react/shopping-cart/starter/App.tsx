import { PRODUCTS } from "./products";

export default function App() {
  // TODO: keep the cart in state. Adding a product, changing a quantity and
  // removing an item should all update the list, the item count and the total.
  // See the requirements for the data-testid each element needs.

  return (
    <div>
      <h1>Shop</h1>
      <ul>
        {PRODUCTS.map((product) => (
          <li key={product.id} data-testid="product" data-id={product.id}>
            {product.name}
            <button data-testid="add-button">Add to cart</button>
          </li>
        ))}
      </ul>

      <h2>Cart</h2>
      <p data-testid="empty-cart">Your cart is empty.</p>
      <p>
        Items: <span data-testid="cart-count">0</span>
      </p>
      <p>
        Total: <span data-testid="cart-total">$0.00</span>
      </p>
    </div>
  );
}
