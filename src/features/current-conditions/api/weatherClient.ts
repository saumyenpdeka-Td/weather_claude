import {
  NetworkError,
  ProviderUnreachableError,
  ProviderError,
  NoDataError,
} from "./weatherClientErrors";

export { NetworkError, ProviderUnreachableError, ProviderError, NoDataError };

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

interface ProviderErrorBody {
  error?: boolean;
  reason?: string;
}

/**
 * Fetches current conditions for a Location from Open-Meteo, always in
 * metric units — unit toggling happens client-side via unitsConversion.
 * Throws one of 4 distinct error types (see weatherClientErrors.ts) so
 * callers can show a specific failure message rather than one generic one.
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
    throw new NetworkError();
  }

  if (!response.ok) {
    let body: ProviderErrorBody | null = null;
    try {
      body = (await response.json()) as ProviderErrorBody;
    } catch {
      body = null;
    }
    if (body?.error) {
      throw new ProviderError(body.reason);
    }
    throw new ProviderUnreachableError();
  }

  const data = (await response.json()) as { current?: Record<string, number> };
  if (!data.current) {
    throw new NoDataError();
  }

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
