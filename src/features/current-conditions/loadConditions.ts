import { fetchCurrentConditions, type CurrentConditionsRaw } from "./api/weatherClient";
import { classifyFailure, type FailureType } from "./classifyFailure";
import type { LocationMatch } from "../location-search/api/geocodingClient";

export type LoadResult =
  { ok: true; raw: CurrentConditionsRaw } | { ok: false; failureType: FailureType };

/** Fetches conditions for a Location and classifies any failure. Never throws. */
export async function loadConditions(location: LocationMatch): Promise<LoadResult> {
  try {
    const raw = await fetchCurrentConditions(location.latitude, location.longitude);
    return { ok: true, raw };
  } catch (err) {
    return { ok: false, failureType: classifyFailure(err) };
  }
}
