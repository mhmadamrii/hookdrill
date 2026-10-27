export type Tab = {
  id: string;
  label: string;
  content: string;
  disabled?: boolean;
};

export const TABS: Tab[] = [
  {
    id: "overview",
    label: "Overview",
    content: "A mechanical keyboard with hot-swap switches.",
  },
  { id: "specs", label: "Specs", content: "75% layout, gasket mount, USB-C." },
  {
    id: "reviews",
    label: "Reviews",
    content: "No reviews yet.",
    disabled: true,
  },
  {
    id: "shipping",
    label: "Shipping",
    content: "Ships in 2 to 3 business days.",
  },
];
