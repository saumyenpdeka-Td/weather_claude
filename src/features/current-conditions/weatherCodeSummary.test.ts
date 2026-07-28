import { describe, it, expect } from "vitest";
import { weatherCodeSummary } from "./weatherCodeSummary";

describe("weatherCodeSummary", () => {
  it("maps clear sky (AC-1)", () => {
    expect(weatherCodeSummary(0)).toBe("Clear sky");
  });

  it("maps overcast", () => {
    expect(weatherCodeSummary(3)).toBe("Overcast");
  });

  it("maps rain codes", () => {
    expect(weatherCodeSummary(63)).toBe("Rain");
  });

  it("maps thunderstorm codes", () => {
    expect(weatherCodeSummary(95)).toBe("Thunderstorm");
  });

  it("falls back to a generic label for an unrecognized code", () => {
    expect(weatherCodeSummary(9999)).toBe("Unknown conditions");
  });
});
