import { describe, expect, it } from "vitest";
import { quoteTotal } from "./pricing";

describe("sticker pricing", () => {
  it("prices 100 stickers at 5x5 cm at ₦4,300", () => {
    expect(quoteTotal(50, 50, 100)).toBe(4300);
  });
  it("prices 1000 stickers at 10x10 cm at ₦109,900", () => {
    expect(quoteTotal(100, 100, 1000)).toBe(109900);
  });
  it("only sells batches of 100, 500 or 1000", () => {
    expect(quoteTotal(50, 50, 250)).toBeNull();
  });
  it("refuses sizes larger than 16 square inches", () => {
    expect(quoteTotal(150, 150, 100)).toBeNull();
  });
});
