Build a product grid with a sort dropdown in `App.tsx` (default export `App`). The products are given in `products.ts`.

## Requirements

- **Sort options**: a `<select>` with these option values:
  - `featured`: the order of `PRODUCTS` (selected by default);
  - `price-asc`: cheapest first;
  - `price-desc`: most expensive first;
  - `rating`: highest rating first;
  - `newest`: latest `addedAt` first.
- **Prices are numbers**: compare `priceCents` as numbers, so $9.99 comes before $100.00.
- **Ties**: products with an equal price or rating keep their featured order, in every sort.
- **Price format**: show each price in dollars with two decimals, `$` first: `999` cents is `$9.99`, `10000` is `$100.00`.
- **Don't mutate the data**: choosing **Featured** again brings back the original order.

## Required `data-testid` selectors

| Test id       | Element                                                                |
| ------------- | ---------------------------------------------------------------------- |
| `sort-select` | the sort `<select>`                                                    |
| `product`     | one card per product, in display order, with `data-id` set to its `id` |
| `price`       | the formatted price, inside its product card                           |
