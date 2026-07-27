import { useState, type FormEvent } from "react";
import { useLocationSearch } from "./useLocationSearch";
import { LocationResultsList } from "./LocationResultsList";
import { useActiveLocation } from "../../state/ActiveLocationContext";

/**
 * Location search: input + submit, and one message per search outcome
 * (too-short, no-results, error+retry, or the results list). Selecting a
 * result makes it the active Location — the current-conditions display for
 * that Location is a separate story's component, not built here.
 */
export function LocationSearch() {
  const [query, setQuery] = useState("");
  const { status, results, search, retry } = useLocationSearch();
  const { setActiveLocation } = useActiveLocation();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    search(query);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} aria-label="Search for a location">
        <label htmlFor="location-query">City name</label>
        <input
          id="location-query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {status === "too-short" && <p role="alert">Query too short — enter at least 2 characters.</p>}
      {status === "no-results" && <p>No matching locations found.</p>}
      {status === "error" && (
        <div role="alert">
          <p>Couldn&apos;t reach the Weather Provider.</p>
          <button type="button" onClick={retry}>
            Retry
          </button>
        </div>
      )}
      {status === "results" && (
        <LocationResultsList results={results} onSelect={setActiveLocation} />
      )}
    </div>
  );
}
