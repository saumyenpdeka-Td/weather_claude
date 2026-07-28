import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchCurrentConditions } from "./weatherClient";
import { WeatherProviderUnreachableError } from "../../location-search/api/geocodingClient";

function stubFetchOnce(ok: boolean, current?: Record<string, number>) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok,
      status: ok ? 200 : 500,
      json: () => Promise.resolve(ok ? { current } : {}),
    }),
  );
}

describe("fetchCurrentConditions", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("parses all fields from the Weather Provider response (AC-1)", async () => {
    stubFetchOnce(true, {
      temperature_2m: 18.2,
      apparent_temperature: 16.5,
      relative_humidity_2m: 62,
      wind_speed_10m: 12.4,
      precipitation: 0,
      weather_code: 2,
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

  it("throws WeatherProviderUnreachableError when the network request fails (AC-4)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network down")));

    await expect(fetchCurrentConditions(48.85, 2.35)).rejects.toBeInstanceOf(
      WeatherProviderUnreachableError,
    );
  });

  it("throws WeatherProviderUnreachableError when the provider returns a non-OK response (AC-4)", async () => {
    stubFetchOnce(false);

    await expect(fetchCurrentConditions(48.85, 2.35)).rejects.toBeInstanceOf(
      WeatherProviderUnreachableError,
    );
  });
});
