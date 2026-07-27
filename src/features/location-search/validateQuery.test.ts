import { describe, it, expect } from "vitest";
import { validateQuery } from "./validateQuery";

describe("validateQuery", () => {
  it("is invalid for an empty query", () => {
    expect(validateQuery("")).toEqual({ valid: false, reason: "too-short" });
  });

  it("is invalid for a query under 2 characters", () => {
    expect(validateQuery("p")).toEqual({ valid: false, reason: "too-short" });
  });

  it("is valid for a query of exactly 2 characters", () => {
    expect(validateQuery("LA")).toEqual({ valid: true });
  });

  it("is valid for a longer query", () => {
    expect(validateQuery("Paris")).toEqual({ valid: true });
  });

  it("treats a whitespace-only query as too short", () => {
    expect(validateQuery("   ")).toEqual({ valid: false, reason: "too-short" });
  });
});
