import { useCallback, useEffect, useRef, useState } from "react";
import { fetchCurrentConditions, type CurrentConditionsRaw } from "./api/weatherClient";
import { toDisplayUnits, type DisplayConditions, type UnitsSystem } from "./unitsConversion";
import type { LocationMatch } from "../location-search/api/geocodingClient";

// COMPONENT-SIZE-JUSTIFICATION: fetch/refresh lifecycle, request sequencing,
// staleness ticking, and units state all read the same `raw` value —
// splitting any one out would require prop-drilling refs for no gain.

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
  refresh: () => void;
}

/**
 * Fetches/refreshes current conditions on a fixed interval, always in
 * metric. A failure never blanks a prior success. `refresh()` triggers an
 * out-of-cycle fetch; every fetch carries a request id, and only the most
 * recently issued one's result is ever applied, so overlapping requests
 * (auto tick + manual refresh) can't race. Switching Locations resets
 * `raw`/`status` synchronously so stale data never renders under a new one.
 */
export function useCurrentConditions(location: LocationMatch | null): UseCurrentConditionsResult {
  const [raw, setRaw] = useState<CurrentConditionsRaw | null>(null);
  const [status, setStatus] = useState<ConditionsStatus>("loading");
  const [unitsSystem, setUnitsSystem] = useState<UnitsSystem>("metric");
  const [now, setNow] = useState(() => Date.now());
  const rawRef = useRef<CurrentConditionsRaw | null>(null);
  const requestIdRef = useRef(0);
  const locationRef = useRef<LocationMatch | null>(location);

  useEffect(() => {
    rawRef.current = raw;
  }, [raw]);

  const load = useCallback(async (loc: LocationMatch) => {
    const requestId = ++requestIdRef.current;
    try {
      const result = await fetchCurrentConditions(loc.latitude, loc.longitude);
      if (requestIdRef.current === requestId) {
        setRaw(result);
        setStatus("ready");
      }
    } catch {
      if (requestIdRef.current === requestId) {
        setStatus(rawRef.current ? "ready" : "unavailable");
      }
    }
  }, []);

  useEffect(() => {
    locationRef.current = location;
    if (!location) return;
    setRaw(null);
    setStatus("loading");
    void load(location);
    const intervalId = setInterval(() => void load(location), REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [location, load]);

  useEffect(() => {
    const tickId = setInterval(() => setNow(Date.now()), STALENESS_TICK_MS);
    return () => clearInterval(tickId);
  }, []);

  const refresh = useCallback(() => {
    if (locationRef.current) void load(locationRef.current);
  }, [load]);

  return {
    status,
    display: raw ? toDisplayUnits(raw, unitsSystem) : null,
    fetchedAt: raw?.fetchedAt ?? null,
    isStale: raw ? now - raw.fetchedAt > STALE_THRESHOLD_MS : false,
    unitsSystem,
    setUnitsSystem,
    refresh,
  };
}
