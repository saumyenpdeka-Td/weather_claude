// COMPONENT-SIZE-JUSTIFICATION: 65 lines — bundles the LocationMatch type,
// the WeatherProviderUnreachableError type, and the fetch/parse logic that
// uses both. Splitting the types into a separate file would scatter a single
// cohesive contract across two files for no testability gain.

/** A single candidate Location returned by the Weather Provider's geocoding search. */
export interface LocationMatch {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  /** Country name — used to disambiguate same-named Locations (AC-2, AC-7). */
  country: string;
  /** Region/state, when the provider has one — further disambiguates matches. */
  admin1?: string;
}

/** Thrown when the Weather Provider can't be reached or returns a failure response. */
export class WeatherProviderUnreachableError extends Error {
  constructor() {
    super("Weather Provider is unreachable");
    this.name = "WeatherProviderUnreachableError";
  }
}

const GEOCODING_ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";

interface OpenMeteoGeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

interface OpenMeteoGeocodingResponse {
  results?: OpenMeteoGeocodingResult[];
}

/**
 * Searches Open-Meteo's geocoding API for Locations matching a free-text
 * query. Returns every match worldwide (AC-7) — the caller decides what to
 * do with an empty array (AC-4). Network failures and non-OK responses both
 * surface as WeatherProviderUnreachableError so callers can offer one retry
 * path (AC-5) regardless of which failed.
 */
export async function searchLocations(query: string): Promise<LocationMatch[]> {
  let response: Response;
  try {
    response = await fetch(`${GEOCODING_ENDPOINT}?name=${encodeURIComponent(query)}&count=20`);
  } catch {
    throw new WeatherProviderUnreachableError();
  }

  if (!response.ok) {
    throw new WeatherProviderUnreachableError();
  }

  const data = (await response.json()) as OpenMeteoGeocodingResponse;

  return (data.results ?? []).map((result) => ({
    id: result.id,
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    country: result.country,
    admin1: result.admin1,
  }));
}
