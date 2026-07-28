import { describe, it, expect } from "vitest";
import { classifyFailure } from "./classifyFailure";
import {
  NetworkError,
  ProviderUnreachableError,
  ProviderError,
  NoDataError,
} from "./api/weatherClient";

describe("classifyFailure", () => {
  it("maps NetworkError to network-error (AC-4)", () => {
    expect(classifyFailure(new NetworkError())).toBe("network-error");
  });

  it("maps ProviderError to provider-error (AC-3)", () => {
    expect(classifyFailure(new ProviderError())).toBe("provider-error");
  });

  it("maps NoDataError to no-data (AC-1)", () => {
    expect(classifyFailure(new NoDataError())).toBe("no-data");
  });

  it("maps ProviderUnreachableError to provider-unreachable (AC-2)", () => {
    expect(classifyFailure(new ProviderUnreachableError())).toBe("provider-unreachable");
  });

  it("falls back to provider-unreachable for an unrecognized error", () => {
    expect(classifyFailure(new Error("something else"))).toBe("provider-unreachable");
  });
});
