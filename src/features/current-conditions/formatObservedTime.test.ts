import { describe, it, expect } from "vitest";
import { formatObservedTime } from "./formatObservedTime";

describe("formatObservedTime", () => {
  it("formats an epoch timestamp as UTC HH:MMZ (AC-2)", () => {
    const epochMs = new Date("2026-07-28T14:32:00Z").getTime();
    expect(formatObservedTime(epochMs)).toBe("14:32Z");
  });

  it("zero-pads single-digit hours and minutes", () => {
    const epochMs = new Date("2026-07-28T04:05:00Z").getTime();
    expect(formatObservedTime(epochMs)).toBe("04:05Z");
  });
});
