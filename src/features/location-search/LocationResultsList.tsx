import type { LocationMatch } from "./api/geocodingClient";
import styles from "./LocationResultsList.module.css";

interface LocationResultsListProps {
  results: LocationMatch[];
  onSelect: (location: LocationMatch) => void;
}

/**
 * Renders search results with disambiguating region/country info (AC-2,
 * AC-7) and reports the chosen result via `onSelect` — the caller is
 * responsible for making it the active Location (AC-3).
 */
export function LocationResultsList({ results, onSelect }: LocationResultsListProps) {
  return (
    <ul className={styles.list} aria-label="Location search results">
      {results.map((location) => {
        const label = [location.name, location.admin1, location.country].filter(Boolean).join(", ");
        return (
          <li key={location.id} className={styles.item}>
            <button
              type="button"
              className={styles.resultButton}
              onClick={() => onSelect(location)}
            >
              {label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
