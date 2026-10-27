export type Product = {
  id: number;
  name: string;
  /** Price in cents: 999 means $9.99. */
  priceCents: number;
  /** 0 to 5, one decimal. */
  rating: number;
  /** ISO date, YYYY-MM-DD. */
  addedAt: string;
};

// The "featured" order is the order of this array.
export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Canvas Tote",
    priceCents: 2499,
    rating: 4.5,
    addedAt: "2024-03-10",
  },
  {
    id: 2,
    name: "Desk Lamp",
    priceCents: 999,
    rating: 4.8,
    addedAt: "2023-11-02",
  },
  {
    id: 3,
    name: "Wool Blanket",
    priceCents: 10000,
    rating: 4.2,
    addedAt: "2024-06-18",
  },
  {
    id: 4,
    name: "Notebook Set",
    priceCents: 1250,
    rating: 4.8,
    addedAt: "2024-01-15",
  },
  {
    id: 5,
    name: "Ceramic Mug",
    priceCents: 2499,
    rating: 3.9,
    addedAt: "2024-09-01",
  },
  {
    id: 6,
    name: "Water Bottle",
    priceCents: 1999,
    rating: 4.5,
    addedAt: "2022-12-24",
  },
  {
    id: 7,
    name: "Headphones",
    priceCents: 8999,
    rating: 4.6,
    addedAt: "2024-02-29",
  },
  {
    id: 8,
    name: "Pen Pack",
    priceCents: 450,
    rating: 3.9,
    addedAt: "2023-07-07",
  },
];
