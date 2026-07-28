import type { CurrentConditionsRaw } from "./api/weatherClient";

export type UnitsSystem = "metric" | "imperial";

/** Conditions converted to the caller's chosen Units System, with unit labels for display. */
export interface DisplayConditions {
  temperature: number;
  feelsLike: number;
  humidityPct: number;
  windSpeed: number;
  precipitation: number;
  temperatureUnit: "°C" | "°F";
  windSpeedUnit: "km/h" | "mph";
  precipitationUnit: "mm" | "in";
  weatherCode: number;
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Converts a raw metric reading into the requested Units System. Pure and
 * synchronous — this is what lets a Units System switch re-render instantly
 * from already-fetched data, with no Weather Provider call (AC-8).
 */
export function toDisplayUnits(
  raw: CurrentConditionsRaw,
  unitsSystem: UnitsSystem,
): DisplayConditions {
  if (unitsSystem === "metric") {
    return {
      temperature: round(raw.temperatureC, 1),
      feelsLike: round(raw.feelsLikeC, 1),
      humidityPct: raw.humidityPct,
      windSpeed: round(raw.windSpeedKmh, 1),
      precipitation: round(raw.precipitationMm, 1),
      temperatureUnit: "°C",
      windSpeedUnit: "km/h",
      precipitationUnit: "mm",
      weatherCode: raw.weatherCode,
    };
  }

  return {
    temperature: round((raw.temperatureC * 9) / 5 + 32, 1),
    feelsLike: round((raw.feelsLikeC * 9) / 5 + 32, 1),
    humidityPct: raw.humidityPct,
    windSpeed: round(raw.windSpeedKmh / 1.60934, 1),
    precipitation: round(raw.precipitationMm / 25.4, 2),
    temperatureUnit: "°F",
    windSpeedUnit: "mph",
    precipitationUnit: "in",
    weatherCode: raw.weatherCode,
  };
}
