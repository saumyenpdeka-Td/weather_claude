import { ActiveLocationProvider } from "./state/ActiveLocationContext";
import { LocationSearch } from "./features/location-search/LocationSearch";

/**
 * App shell. Wires shared ActiveLocation state (consumed by this story's
 * search flow and, in a later story, by current-conditions display) around
 * the location-search feature.
 */
export function App() {
  return (
    <ActiveLocationProvider>
      <LocationSearch />
    </ActiveLocationProvider>
  );
}
