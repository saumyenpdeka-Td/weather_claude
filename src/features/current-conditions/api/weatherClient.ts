import { WeatherProviderUnreachableError } from "../../location-search/api/geocodingClient";

/** Raw current-conditions reading, always in metric units regardless of display Units System. */
export interface CurrentConditionsRaw {
  temperatureC: number;
  feelsLikeC: number;
  humidityPct: number;
  windSpeedKmh: number;
  precipitationMm: number;
  weatherCode: number;
  fetchedAt: number;
}

const CONDITIONS_ENDPOINT = "https://api.open-meteo.com/v1/forecast";
const CURRENT_FIELDS =
  "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation,weather_code";

/**
 * Fetches current conditions for a Location from Open-Meteo, always in
 * metric units (the API's default) — unit toggling happens client-side via
 * unitsConversion, so this never needs to be called again just to switch
 * display units (AC-8).
 */
export async function fetchCurrentConditions(
  latitude: number,
  longitude: number,
): Promise<CurrentConditionsRaw> {
  let response: Response;
  try {
    response = await fetch(
      `${CONDITIONS_ENDPOINT}?latitude=${latitude}&longitude=${longitude}&current=${CURRENT_FIELDS}`,
    );
  } catch {
    throw new WeatherProviderUnreachableError();
  }

  if (!response.ok) {
    throw new WeatherProviderUnreachableError();
  }

  const data = (await response.json()) as { current: Record<string, number> };
  const c = data.current;

  return {
    temperatureC: c.temperature_2m,
    feelsLikeC: c.apparent_temperature,
    humidityPct: c.relative_humidity_2m,
    windSpeedKmh: c.wind_speed_10m,
    precipitationMm: c.precipitation,
    weatherCode: c.weather_code,
    fetchedAt: Date.now(),
  };
}
