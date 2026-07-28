import { useCallback, useRef, useState } from "react";
import { searchLocations, type LocationMatch } from "./api/geocodingClient";
import { validateQuery } from "./validateQuery";

export type SearchStatus = "idle" | "loading" | "results" | "no-results" | "too-short" | "error";

interface UseLocationSearchResult {
  status: SearchStatus;
  results: LocationMatch[];
  search: (query: string) => void;
  retry: () => void;
}

/**
 * Orchestrates a location search: validates the query (AC-6), calls the
 * Weather Provider, and exposes a single status enum the UI switches on
 * for every outcome (results / no-results / too-short / error). `retry`
 * re-runs the last attempted query — used to recover from `error` (AC-5).
 */
export function useLocationSearch(): UseLocationSearchResult {
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [results, setResults] = useState<LocationMatch[]>([]);
  const lastQueryRef = useRef("");

  const runSearch = useCallback(async (query: string) => {
    const validation = validateQuery(query);
    if (!validation.valid) {
      setStatus("too-short");
      setResults([]);
      return;
    }

    lastQueryRef.current = query;
    setStatus("loading");
    try {
      const matches = await searchLocations(query);
      setResults(matches);
      setStatus(matches.length === 0 ? "no-results" : "results");
    } catch {
      setResults([]);
      setStatus("error");
    }
  }, []);

  const search = useCallback((query: string) => void runSearch(query), [runSearch]);
  const retry = useCallback(() => void runSearch(lastQueryRef.current), [runSearch]);

  return { status, results, search, retry };
}
