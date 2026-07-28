import { ActiveLocationProvider } from "./state/ActiveLocationContext";
import { LocationSearch } from "./features/location-search/LocationSearch";
import { CurrentConditionsContainer } from "./features/current-conditions/CurrentConditionsContainer";

/** App shell. Wires shared ActiveLocation state around location search and its current-conditions display. */
export function App() {
  return (
    <ActiveLocationProvider>
      <LocationSearch />
      <CurrentConditionsContainer />
    </ActiveLocationProvider>
  );
}
