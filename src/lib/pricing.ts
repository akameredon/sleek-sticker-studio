// Sleekblue sticker pricing, from the business's wholesale cost sheet.
// Batch prices only exist for 100 / 500 / 1000 stickers and sizes between
// 2.25 and 16 square inches. Selling price = production cost / 0.7, rounded up to ₦100.

export const QUANTITIES = [100, 500, 1000] as const;
export type Quantity = (typeof QUANTITIES)[number];

export type Shape = "round" | "square" | "rectangle";

export type SizeOption = { id: string; shape: Shape; widthMm: number; heightMm: number; label: string; hint: string };

export const SIZES: SizeOption[] = [
  { id: "r40", shape: "round", widthMm: 40, heightMm: 40, label: "4 cm", hint: "Jar lids, small labels" },
  { id: "r50", shape: "round", widthMm: 50, heightMm: 50, label: "5 cm", hint: "Most popular" },
  { id: "r75", shape: "round", widthMm: 75, heightMm: 75, label: "7.5 cm", hint: "Bottles, boxes" },
  { id: "s50", shape: "square", widthMm: 50, heightMm: 50, label: "5 × 5 cm", hint: "Logo stickers" },
  { id: "s75", shape: "square", widthMm: 75, heightMm: 75, label: "7.5 × 7.5 cm", hint: "Packaging" },
  { id: "s100", shape: "square", widthMm: 100, heightMm: 100, label: "10 × 10 cm", hint: "Big & bold" },
  { id: "x75", shape: "rectangle", widthMm: 75, heightMm: 50, label: "7.5 × 5 cm", hint: "Product labels" },
  { id: "x100", shape: "rectangle", widthMm: 100, heightMm: 50, label: "10 × 5 cm", hint: "Bottle wraps" },
];

const COST_ANCHORS: Record<Quantity, Array<{ areaIn2: number; cost: number }>> = {
  100: [
    { areaIn2: 2.25, cost: 3000 }, { areaIn2: 4, cost: 3000 }, { areaIn2: 6.25, cost: 4500 },
    { areaIn2: 9, cost: 5000 }, { areaIn2: 12, cost: 6500 }, { areaIn2: 16, cost: 9000 },
  ],
  500: [
    { areaIn2: 2.25, cost: 12500 }, { areaIn2: 4, cost: 12500 }, { areaIn2: 6.25, cost: 20000 },
    { areaIn2: 9, cost: 22500 }, { areaIn2: 12, cost: 30000 }, { areaIn2: 16, cost: 42500 },
  ],
  1000: [
    { areaIn2: 2.25, cost: 20000 }, { areaIn2: 4, cost: 20000 }, { areaIn2: 6.25, cost: 35000 },
    { areaIn2: 9, cost: 40000 }, { areaIn2: 12, cost: 55000 }, { areaIn2: 16, cost: 80000 },
  ],
};

export function isQuantity(q: number): q is Quantity {
  return (QUANTITIES as readonly number[]).includes(q);
}

/** Total price in Naira for a batch, or null when the size/quantity needs a manual quote. */
export function quoteTotal(widthMm: number, heightMm: number, quantity: number): number | null {
  if (!isQuantity(quantity)) return null;
  const areaIn2 = (widthMm / 25.4) * (heightMm / 25.4);
  if (!Number.isFinite(areaIn2) || areaIn2 < 2.25 || areaIn2 > 16) return null;
  const anchors = COST_ANCHORS[quantity];
  let i = anchors.findIndex((a) => areaIn2 <= a.areaIn2);
  if (i <= 0) i = 1;
  const left = anchors[i - 1]!;
  const right = anchors[i]!;
  const ratio = (areaIn2 - left.areaIn2) / (right.areaIn2 - left.areaIn2);
  const cost = Math.ceil(left.cost + ratio * (right.cost - left.cost));
  return Math.ceil(cost / 0.7 / 100) * 100;
}

export const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;
