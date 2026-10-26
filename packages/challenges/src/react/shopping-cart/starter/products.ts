export type Product = { id: string; name: string; priceCents: number };

// Prices are whole cents, so totals add up without floating-point drift.
export const PRODUCTS: Product[] = [
  { id: "apple", name: "Apple", priceCents: 50 },
  { id: "bread", name: "Bread", priceCents: 225 },
  { id: "coffee", name: "Coffee beans", priceCents: 1199 },
  { id: "milk", name: "Oat milk", priceCents: 349 },
];
