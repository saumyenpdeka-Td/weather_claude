import { useEffect, useRef, useState } from "react";
import { fetchCurrentConditions, type CurrentConditionsRaw } from "./api/weatherClient";
import { toDisplayUnits, type DisplayConditions, type UnitsSystem } from "./unitsConversion";
import type { LocationMatch } from "../location-search/api/geocodingClient";

// COMPONENT-SIZE-JUSTIFICATION: 79 lines — this hook owns 3 tightly coupled
// concerns (fetch/refresh lifecycle, staleness ticking, units state) that
// all read from the same `raw` value. Splitting the staleness tick or units
// state into separate hooks would require passing `raw`/`rawRef` across
// hook boundaries for no testability gain, since none of the three pieces
// is independently useful.

const REFRESH_INTERVAL_MS = 10 * 60 * 1000;
const STALE_THRESHOLD_MS = REFRESH_INTERVAL_MS * 2;
const STALENESS_TICK_MS = 60 * 1000;

export type ConditionsStatus = "loading" | "unavailable" | "ready";

interface UseCurrentConditionsResult {
  status: ConditionsStatus;
  display: DisplayConditions | null;
  fetchedAt: number | null;
  isStale: boolean;
  unitsSystem: UnitsSystem;
  setUnitsSystem: (unitsSystem: UnitsSystem) => void;
}

/**
 * Fetches and refreshes current conditions for a Location on a fixed
 * interval, always in metric (Units System switching is local — see
 * unitsConversion, AC-8). A refresh failure never blanks a prior success:
 * first-load failure surfaces as "unavailable" (AC-4), a later failure
 * leaves the last good reading and its timestamp untouched (AC-5), and
 * staleness is derived from that timestamp against the current time (AC-6/7).
 */
export function useCurrentConditions(location: LocationMatch | null): UseCurrentConditionsResult {
  const [raw, setRaw] = useState<CurrentConditionsRaw | null>(null);
  const [status, setStatus] = useState<ConditionsStatus>("loading");
  const [unitsSystem, setUnitsSystem] = useState<UnitsSystem>("metric");
  const [now, setNow] = useState(() => Date.now());
  const rawRef = useRef<CurrentConditionsRaw | null>(null);

  useEffect(() => {
    rawRef.current = raw;
  }, [raw]);

  useEffect(() => {
    if (!location) return;
    let cancelled = false;

    async function load() {
      try {
        const result = await fetchCurrentConditions(location!.latitude, location!.longitude);
        if (!cancelled) {
          setRaw(result);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) {
          setStatus(rawRef.current ? "ready" : "unavailable");
        }
      }
    }

    void load();
    const intervalId = setInterval(load, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [location]);

  useEffect(() => {
    const tickId = setInterval(() => setNow(Date.now()), STALENESS_TICK_MS);
    return () => clearInterval(tickId);
  }, []);

  return {
    status,
    display: raw ? toDisplayUnits(raw, unitsSystem) : null,
    fetchedAt: raw?.fetchedAt ?? null,
    isStale: raw ? now - raw.fetchedAt > STALE_THRESHOLD_MS : false,
    unitsSystem,
    setUnitsSystem,
  };
}
