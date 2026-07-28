import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CurrentConditionsCard } from "./CurrentConditionsCard";
import type { DisplayConditions } from "./unitsConversion";

const display: DisplayConditions = {
  temperature: 18,
  feelsLike: 16,
  humidityPct: 62,
  windSpeed: 12,
  precipitation: 0,
  temperatureUnit: "°C",
  windSpeedUnit: "km/h",
  precipitationUnit: "mm",
  weatherCode: 2,
};

const fetchedAt = new Date("2026-07-28T14:32:00Z").getTime();

describe("CurrentConditionsCard", () => {
  it("shows an explicit unavailable state, not a blank screen (AC-4)", () => {
    render(
      <CurrentConditionsCard
        locationName="Paris"
        status="unavailable"
        display={null}
        fetchedAt={null}
        isStale={false}
        unitsSystem="metric"
        onUnitsChange={vi.fn()}
      />,
    );

    expect(screen.getByText(/conditions unavailable/i)).toBeInTheDocument();
    expect(screen.getByText("NO SIGNAL")).toBeInTheDocument();
  });

  it("renders all fields, timestamp, and a live indicator when fresh (AC-1, AC-2, AC-7)", () => {
    render(
      <CurrentConditionsCard
        locationName="Paris"
        status="ready"
        display={display}
        fetchedAt={fetchedAt}
        isStale={false}
        unitsSystem="metric"
        onUnitsChange={vi.fn()}
      />,
    );

    expect(screen.getByText("18°C")).toBeInTheDocument();
    expect(screen.getByText(/feels like 16°C/i)).toBeInTheDocument();
    expect(screen.getByText(/62%/)).toBeInTheDocument();
    expect(screen.getByText(/12 km\/h/)).toBeInTheDocument();
    expect(screen.getByText("Partly cloudy")).toBeInTheDocument();
    expect(screen.getByText(/14:32Z/)).toBeInTheDocument();
    expect(screen.getByText("LIVE")).toBeInTheDocument();
    expect(screen.queryByText("STALE")).not.toBeInTheDocument();
  });

  it("shows a stale stamp badge alongside the original timestamp when data is stale (AC-6)", () => {
    render(
      <CurrentConditionsCard
        locationName="Paris"
        status="ready"
        display={display}
        fetchedAt={fetchedAt}
        isStale={true}
        unitsSystem="metric"
        onUnitsChange={vi.fn()}
      />,
    );

    expect(screen.getByText("STALE")).toBeInTheDocument();
    expect(screen.getByText(/14:32Z/)).toBeInTheDocument();
    expect(screen.queryByText("LIVE")).not.toBeInTheDocument();
  });

  it("wires the Units toggle through to onUnitsChange (AC-8)", () => {
    const onUnitsChange = vi.fn();
    render(
      <CurrentConditionsCard
        locationName="Paris"
        status="ready"
        display={display}
        fetchedAt={fetchedAt}
        isStale={false}
        unitsSystem="metric"
        onUnitsChange={onUnitsChange}
      />,
    );

    screen.getByRole("button", { name: "°F" }).click();

    expect(onUnitsChange).toHaveBeenCalledWith("imperial");
  });
});
