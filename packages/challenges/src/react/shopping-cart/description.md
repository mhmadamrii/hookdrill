Build a shopping cart in `App.tsx` (default export `App`). The products are given in `products.ts`; prices are in whole cents.

## Requirements

- **Add**: each product has an **Add to cart** button. Adding a product that isn't in the cart adds it with quantity 1, at the end of the cart. Adding one that is already there raises its quantity by 1 instead of adding a second row.
- **Quantity**: each cart item has **+** and **−** buttons. Pressing **−** at quantity 1 removes the item.
- **Remove**: each cart item has a **Remove** button that takes it out whatever its quantity. The other items keep their order and quantities.
- **Item count**: the total number of units in the cart (2 apples and 1 bread is 3).
- **Total**: the sum of price × quantity, formatted as dollars with two decimals, e.g. `$3.75`. An empty cart shows `$0.00`.
- **Empty state**: show the empty message only while the cart is empty.

## Required `data-testid` selectors

| Test id           | Element                                                       |
| ----------------- | ------------------------------------------------------------- |
| `product`         | one per product, with `data-id` set to the product's `id`     |
| `add-button`      | adds the product to the cart, inside `product`                |
| `cart-item`       | one per cart line, with `data-id` set to the product's `id`   |
| `item-quantity`   | the line's quantity, as text, inside `cart-item`              |
| `increase-button` | raises the quantity by 1, inside `cart-item`                  |
| `decrease-button` | lowers the quantity by 1, inside `cart-item`                  |
| `remove-button`   | removes the line, inside `cart-item`                          |
| `cart-count`      | the total number of units, as text                            |
| `cart-total`      | the total price, as text, e.g. `$3.75`                        |
| `empty-cart`      | the empty-cart message, rendered only while the cart is empty |
