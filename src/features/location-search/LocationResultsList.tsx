import type { LocationMatch } from "./api/geocodingClient";

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
    <ul aria-label="Location search results">
      {results.map((location) => {
        const label = [location.name, location.admin1, location.country].filter(Boolean).join(", ");
        return (
          <li key={location.id}>
            <button type="button" onClick={() => onSelect(location)}>
              {label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
