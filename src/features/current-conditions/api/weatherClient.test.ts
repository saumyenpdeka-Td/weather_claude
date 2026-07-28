import { describe, it, expect, vi, afterEach } from "vitest";
import {
  fetchCurrentConditions,
  NetworkError,
  ProviderUnreachableError,
  ProviderError,
  NoDataError,
} from "./weatherClient";

function stubFetch(response: { ok: boolean; json: () => unknown }) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: response.ok,
      status: response.ok ? 200 : 500,
      json: () => Promise.resolve(response.json()),
    }),
  );
}

describe("fetchCurrentConditions", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("parses all fields from the Weather Provider response (AC-1)", async () => {
    stubFetch({
      ok: true,
      json: () => ({
        current: {
          temperature_2m: 18.2,
          apparent_temperature: 16.5,
          relative_humidity_2m: 62,
          wind_speed_10m: 12.4,
          precipitation: 0,
          weather_code: 2,
        },
      }),
    });

    const conditions = await fetchCurrentConditions(48.85, 2.35);

    expect(conditions).toMatchObject({
      temperatureC: 18.2,
      feelsLikeC: 16.5,
      humidityPct: 62,
      windSpeedKmh: 12.4,
      precipitationMm: 0,
      weatherCode: 2,
    });
    expect(typeof conditions.fetchedAt).toBe("number");
  });

  it("throws NetworkError when the device can't reach the network at all (AC-4)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(fetchCurrentConditions(48.85, 2.35)).rejects.toBeInstanceOf(NetworkError);
  });

  it("throws ProviderUnreachableError on a non-OK response with no explicit error body (AC-2)", async () => {
    stubFetch({ ok: false, json: () => ({}) });

    await expect(fetchCurrentConditions(48.85, 2.35)).rejects.toBeInstanceOf(
      ProviderUnreachableError,
    );
  });

  it("throws ProviderError on a non-OK response carrying an explicit provider error (AC-3)", async () => {
    stubFetch({ ok: false, json: () => ({ error: true, reason: "Invalid coordinates" }) });

    await expect(fetchCurrentConditions(48.85, 2.35)).rejects.toBeInstanceOf(ProviderError);
  });

  it("throws NoDataError when the response is OK but has no current conditions (AC-1)", async () => {
    stubFetch({ ok: true, json: () => ({}) });

    await expect(fetchCurrentConditions(48.85, 2.35)).rejects.toBeInstanceOf(NoDataError);
  });

  it("throws ProviderUnreachableError when a non-OK response body isn't parseable JSON (AC-2)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: () => Promise.reject(new SyntaxError("Unexpected token")),
      }),
    );

    await expect(fetchCurrentConditions(48.85, 2.35)).rejects.toBeInstanceOf(
      ProviderUnreachableError,
    );
  });
});
