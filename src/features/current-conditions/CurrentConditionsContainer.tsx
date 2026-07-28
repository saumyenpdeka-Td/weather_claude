import { useActiveLocation } from "../../state/ActiveLocationContext";
import { useCurrentConditions } from "./useCurrentConditions";
import { CurrentConditionsCard } from "./CurrentConditionsCard";

/** Connects the active Location to current-conditions data and its display. */
export function CurrentConditionsContainer() {
  const { activeLocation } = useActiveLocation();
  const { status, display, failureType, fetchedAt, isStale, unitsSystem, setUnitsSystem, refresh } =
    useCurrentConditions(activeLocation);

  if (!activeLocation) {
    return null;
  }

  return (
    <CurrentConditionsCard
      locationName={activeLocation.name}
      status={status}
      display={display}
      failureType={failureType}
      fetchedAt={fetchedAt}
      isStale={isStale}
      unitsSystem={unitsSystem}
      onUnitsChange={setUnitsSystem}
      onRefresh={refresh}
    />
  );
}
