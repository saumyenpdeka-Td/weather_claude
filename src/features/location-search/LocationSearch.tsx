import { useState, type FormEvent } from "react";
import { useLocationSearch } from "./useLocationSearch";
import { LocationResultsList } from "./LocationResultsList";
import { useActiveLocation } from "../../state/ActiveLocationContext";
import styles from "./LocationSearch.module.css";

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
    <div className={styles.panel}>
      <form onSubmit={handleSubmit} aria-label="Search for a location">
        <label className={styles.label} htmlFor="location-query">
          City name
        </label>
        <div className={styles.row}>
          <input
            id="location-query"
            className={styles.input}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit" className={styles.button}>
            Search
          </button>
        </div>
      </form>

      {status === "too-short" && (
        <p className={styles.notice} role="alert">
          Query too short — enter at least 2 characters.
        </p>
      )}
      {status === "no-results" && <p className={styles.notice}>No matching locations found.</p>}
      {status === "error" && (
        <div className={styles.errorBox} role="alert">
          <p>Couldn&apos;t reach the Weather Provider.</p>
          <button type="button" className={styles.retryButton} onClick={retry}>
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
