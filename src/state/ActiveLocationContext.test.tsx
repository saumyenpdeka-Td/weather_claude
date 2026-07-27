import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ActiveLocationProvider, useActiveLocation } from "./ActiveLocationContext";
import type { LocationMatch } from "../features/location-search/api/geocodingClient";

const paris: LocationMatch = {
  id: 1,
  name: "Paris",
  latitude: 48.85,
  longitude: 2.35,
  country: "France",
};

function Consumer() {
  const { activeLocation, setActiveLocation } = useActiveLocation();
  return (
    <div>
      <span>{activeLocation ? activeLocation.name : "none"}</span>
      <button onClick={() => setActiveLocation(paris)}>select</button>
    </div>
  );
}

describe("ActiveLocationContext", () => {
  it("starts with no active Location", () => {
    render(
      <ActiveLocationProvider>
        <Consumer />
      </ActiveLocationProvider>,
    );

    expect(screen.getByText("none")).toBeInTheDocument();
  });

  it("makes the selected Location the active Location (AC-3)", () => {
    render(
      <ActiveLocationProvider>
        <Consumer />
      </ActiveLocationProvider>,
    );

    fireEvent.click(screen.getByText("select"));

    expect(screen.getByText("Paris")).toBeInTheDocument();
  });

  it("throws when used outside an ActiveLocationProvider", () => {
    const renderOutsideProvider = () => render(<Consumer />);
    expect(renderOutsideProvider).toThrow(/ActiveLocationProvider/);
  });
});
