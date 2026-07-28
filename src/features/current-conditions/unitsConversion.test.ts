import { describe, it, expect } from "vitest";
import { toDisplayUnits } from "./unitsConversion";
import type { CurrentConditionsRaw } from "./api/weatherClient";

const raw: CurrentConditionsRaw = {
  temperatureC: 20,
  feelsLikeC: 18,
  humidityPct: 55,
  windSpeedKmh: 16.0934,
  precipitationMm: 25.4,
  weatherCode: 1,
  fetchedAt: 1234,
};

describe("toDisplayUnits", () => {
  it("returns metric values unchanged, with metric unit labels (AC-3)", () => {
    const result = toDisplayUnits(raw, "metric");

    expect(result).toEqual({
      temperature: 20,
      feelsLike: 18,
      humidityPct: 55,
      windSpeed: 16.1,
      precipitation: 25.4,
      temperatureUnit: "°C",
      windSpeedUnit: "km/h",
      precipitationUnit: "mm",
      weatherCode: 1,
    });
  });

  it("converts to imperial values with imperial unit labels (AC-1, AC-8)", () => {
    const result = toDisplayUnits(raw, "imperial");

    expect(result.temperature).toBeCloseTo(68, 1);
    expect(result.feelsLike).toBeCloseTo(64.4, 1);
    expect(result.windSpeed).toBeCloseTo(10, 1);
    expect(result.precipitation).toBeCloseTo(1, 2);
    expect(result.temperatureUnit).toBe("°F");
    expect(result.windSpeedUnit).toBe("mph");
    expect(result.precipitationUnit).toBe("in");
    expect(result.weatherCode).toBe(1);
  });

  it("leaves humidity unconverted regardless of Units System", () => {
    expect(toDisplayUnits(raw, "metric").humidityPct).toBe(55);
    expect(toDisplayUnits(raw, "imperial").humidityPct).toBe(55);
  });

  it("performs conversion purely from already-fetched raw data (AC-8)", () => {
    const metricResult = toDisplayUnits(raw, "metric");
    const imperialResult = toDisplayUnits(raw, "imperial");

    expect(metricResult).not.toBe(imperialResult);
    expect(raw.temperatureC).toBe(20);
  });
});
