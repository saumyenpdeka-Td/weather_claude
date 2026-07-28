import { useCallback, useEffect, useRef, useState } from "react";
import { loadConditions } from "./loadConditions";
import { toDisplayUnits, type DisplayConditions, type UnitsSystem } from "./unitsConversion";
import type { CurrentConditionsRaw } from "./api/weatherClient";
import type { FailureType } from "./classifyFailure";
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
  failureType: FailureType | null;
  fetchedAt: number | null;
  isStale: boolean;
  unitsSystem: UnitsSystem;
  setUnitsSystem: (unitsSystem: UnitsSystem) => void;
  refresh: () => void;
}

/**
 * Fetches/refreshes current conditions on a fixed interval, always metric.
 * A failure never blanks a prior success — shown as staleness, not a
 * failure message (`failureType` is only ever set when `raw` is null).
 * `refresh()` triggers an out-of-cycle fetch; each fetch carries a request
 * id so only the most recent result applies, preventing races. Switching
 * Locations resets `raw`/`status` synchronously.
 */
export function useCurrentConditions(location: LocationMatch | null): UseCurrentConditionsResult {
  const [raw, setRaw] = useState<CurrentConditionsRaw | null>(null);
  const [status, setStatus] = useState<ConditionsStatus>("loading");
  const [failureType, setFailureType] = useState<FailureType | null>(null);
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
    const result = await loadConditions(loc);
    if (requestIdRef.current !== requestId) return;

    if (result.ok) {
      setRaw(result.raw);
      setStatus("ready");
      setFailureType(null);
    } else if (rawRef.current) {
      setStatus("ready");
    } else {
      setStatus("unavailable");
      setFailureType(result.failureType);
    }
  }, []);

  useEffect(() => {
    locationRef.current = location;
    if (!location) return;
    setRaw(null);
    setStatus("loading");
    setFailureType(null);
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
    failureType,
    fetchedAt: raw?.fetchedAt ?? null,
    isStale: raw ? now - raw.fetchedAt > STALE_THRESHOLD_MS : false,
    unitsSystem,
    setUnitsSystem,
    refresh,
  };
}
