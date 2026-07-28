import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ActiveLocationProvider, useActiveLocation } from "../../state/ActiveLocationContext";
import { CurrentConditionsContainer } from "./CurrentConditionsContainer";
import type { LocationMatch } from "../location-search/api/geocodingClient";

const paris: LocationMatch = {
  id: 1,
  name: "Paris",
  latitude: 48.85,
  longitude: 2.35,
  country: "France",
};

function Selector({ location }: { location: LocationMatch }) {
  const { setActiveLocation } = useActiveLocation();
  return (
    <button type="button" onClick={() => setActiveLocation(location)}>
      select
    </button>
  );
}

function stubFetchOnce() {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          current: {
            temperature_2m: 18,
            apparent_temperature: 16,
            relative_humidity_2m: 60,
            wind_speed_10m: 10,
            precipitation: 0,
            weather_code: 1,
          },
        }),
    }),
  );
}

describe("CurrentConditionsContainer", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders nothing when there is no active Location", () => {
    const { container } = render(
      <ActiveLocationProvider>
        <CurrentConditionsContainer />
      </ActiveLocationProvider>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("displays conditions for the active Location once one is selected", async () => {
    stubFetchOnce();
    render(
      <ActiveLocationProvider>
        <Selector location={paris} />
        <CurrentConditionsContainer />
      </ActiveLocationProvider>,
    );

    await act(async () => {
      screen.getByText("select").click();
    });

    expect(await screen.findByText("18°C")).toBeInTheDocument();
    expect(screen.getByText("PARIS")).toBeInTheDocument();
  });
});
