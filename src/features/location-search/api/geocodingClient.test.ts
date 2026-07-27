import { describe, it, expect, vi, afterEach } from "vitest";
import { searchLocations, WeatherProviderUnreachableError } from "./geocodingClient";

function stubFetchOnce(response: Partial<Response> & { ok: boolean; json?: () => unknown }) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: response.ok,
      status: response.ok ? 200 : 500,
      json: response.json ?? (() => Promise.resolve({})),
    }),
  );
}

describe("searchLocations", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns matching Location results for a valid query", async () => {
    stubFetchOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [{ id: 1, name: "Paris", latitude: 48.85, longitude: 2.35, country: "France" }],
        }),
    });

    const results = await searchLocations("Paris");

    expect(results).toEqual([
      {
        id: 1,
        name: "Paris",
        latitude: 48.85,
        longitude: 2.35,
        country: "France",
        admin1: undefined,
      },
    ]);
  });

  it("includes disambiguating region/country info when multiple countries match", async () => {
    stubFetchOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [
            {
              id: 1,
              name: "Paris",
              latitude: 48.85,
              longitude: 2.35,
              country: "France",
              admin1: "Ile-de-France",
            },
            {
              id: 2,
              name: "Paris",
              latitude: 33.66,
              longitude: -95.55,
              country: "United States",
              admin1: "Texas",
            },
          ],
        }),
    });

    const results = await searchLocations("Paris");

    expect(results[0]).toMatchObject({ country: "France", admin1: "Ile-de-France" });
    expect(results[1]).toMatchObject({ country: "United States", admin1: "Texas" });
  });

  it("returns matches across multiple countries worldwide without filtering to one", async () => {
    stubFetchOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [
            {
              id: 1,
              name: "Springfield",
              latitude: 39.8,
              longitude: -89.6,
              country: "United States",
            },
            { id: 2, name: "Springfield", latitude: -37.9, longitude: 145.0, country: "Australia" },
            {
              id: 3,
              name: "Springfield",
              latitude: 52.7,
              longitude: -1.2,
              country: "United Kingdom",
            },
          ],
        }),
    });

    const results = await searchLocations("Springfield");

    expect(results.map((r) => r.country)).toEqual(["United States", "Australia", "United Kingdom"]);
  });

  it("returns an empty array when no Location matches the query", async () => {
    stubFetchOnce({ ok: true, json: () => Promise.resolve({}) });

    const results = await searchLocations("zzzznotarealplace");

    expect(results).toEqual([]);
  });

  it("throws WeatherProviderUnreachableError when the network request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(searchLocations("Paris")).rejects.toBeInstanceOf(WeatherProviderUnreachableError);
  });

  it("throws WeatherProviderUnreachableError when the provider returns a non-OK response", async () => {
    stubFetchOnce({ ok: false });

    await expect(searchLocations("Paris")).rejects.toBeInstanceOf(WeatherProviderUnreachableError);
  });
});
