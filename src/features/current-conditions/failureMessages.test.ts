import { describe, it, expect } from "vitest";
import { failureMessage } from "./failureMessages";

describe("failureMessage", () => {
  it("gives a distinct message for no-data (AC-1)", () => {
    expect(failureMessage("no-data")).toBe("No data for this Location.");
  });

  it("gives a distinct message for provider-unreachable (AC-2)", () => {
    expect(failureMessage("provider-unreachable")).toBe("Weather Provider unreachable.");
  });

  it("gives a distinct message for provider-error (AC-3)", () => {
    expect(failureMessage("provider-error")).toBe("Weather Provider returned an error.");
  });

  it("gives a distinct message for network-error (AC-4)", () => {
    expect(failureMessage("network-error")).toBe("No network connection.");
  });

  it("gives 4 mutually distinct messages", () => {
    const messages = new Set([
      failureMessage("no-data"),
      failureMessage("provider-unreachable"),
      failureMessage("provider-error"),
      failureMessage("network-error"),
    ]);
    expect(messages.size).toBe(4);
  });
});
