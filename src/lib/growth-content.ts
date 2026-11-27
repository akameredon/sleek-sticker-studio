import type { Shape } from "@/lib/pricing";

export type Template = {
  id: string;
  label: string;
  description: string;
  shape: Shape;
  idea: string;
};

export const TEMPLATES: Template[] = [
  {
    id: "bakery",
    label: "Bakery & treats",
    description: "Warm labels for cakes, pastries, and jars.",
    shape: "round",
    idea: "Premium bakery label for my business, warm cream and cocoa colours",
  },
  {
    id: "skincare",
    label: "Beauty & skincare",
    description: "Clean, calm labels for creams and oils.",
    shape: "rectangle",
    idea: "Modern skincare product label, botanical green and soft cream colours",
  },
  {
    id: "drinks",
    label: "Drinks & water",
    description: "Bold labels that stand out in a fridge.",
    shape: "rectangle",
    idea: "Bold Nigerian drinks label, fresh citrus colours and confident type",
  },
  {
    id: "events",
    label: "Events & gifts",
    description: "Memorable stickers for celebrations.",
    shape: "round",
    idea: "Elegant event favour sticker, gold and deep blue celebration style",
  },
  {
    id: "retail",
    label: "Retail products",
    description: "Clear labels that explain your product.",
    shape: "square",
    idea: "Professional retail product sticker with a clear logo area",
  },
  {
    id: "food",
    label: "Food packaging",
    description: "Friendly seals for takeaway and delivery.",
    shape: "square",
    idea: "Friendly food packaging sticker, appetising red and warm yellow",
  },
];
