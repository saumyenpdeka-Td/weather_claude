import { createContext, useContext, useState, type ReactNode } from "react";
import type { LocationMatch } from "../features/location-search/api/geocodingClient";

interface ActiveLocationContextValue {
  activeLocation: LocationMatch | null;
  setActiveLocation: (location: LocationMatch) => void;
}

const ActiveLocationContext = createContext<ActiveLocationContextValue | undefined>(undefined);

/**
 * Holds the single "active Location" shared across the app. This story only
 * writes to it (on search-result selection, AC-3); a later story
 * (current-conditions display) reads it to fetch and render weather —
 * that consumer is intentionally not built here to avoid scope creep across
 * tickets.
 */
export function ActiveLocationProvider({ children }: { children: ReactNode }) {
  const [activeLocation, setActiveLocation] = useState<LocationMatch | null>(null);
  return (
    <ActiveLocationContext.Provider value={{ activeLocation, setActiveLocation }}>
      {children}
    </ActiveLocationContext.Provider>
  );
}

/** Reads/writes the active Location. Throws outside an ActiveLocationProvider. */
export function useActiveLocation(): ActiveLocationContextValue {
  const context = useContext(ActiveLocationContext);
  if (!context) {
    throw new Error("useActiveLocation must be used within an ActiveLocationProvider");
  }
  return context;
}
