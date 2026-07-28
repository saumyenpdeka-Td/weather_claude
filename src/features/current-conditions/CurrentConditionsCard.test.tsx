import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CurrentConditionsCard } from "./CurrentConditionsCard";
import type { DisplayConditions } from "./unitsConversion";
import type { FailureType } from "./classifyFailure";

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

function renderUnavailable(failureType: FailureType) {
  render(
    <CurrentConditionsCard
      locationName="Paris"
      status="unavailable"
      display={null}
      failureType={failureType}
      fetchedAt={null}
      isStale={false}
      unitsSystem="metric"
      onUnitsChange={vi.fn()}
      onRefresh={vi.fn()}
    />,
  );
}

describe("CurrentConditionsCard", () => {
  it("shows a distinct no-data message with retry available (AC-1)", () => {
    renderUnavailable("no-data");
    expect(screen.getByText("No data for this Location.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "NEW OBS" })).toBeInTheDocument();
  });

  it("shows a distinct provider-unreachable message (AC-2)", () => {
    renderUnavailable("provider-unreachable");
    expect(screen.getByText("Weather Provider unreachable.")).toBeInTheDocument();
  });

  it("shows a distinct provider-error message (AC-3)", () => {
    renderUnavailable("provider-error");
    expect(screen.getByText("Weather Provider returned an error.")).toBeInTheDocument();
  });

  it("shows a distinct network-error message (AC-4)", () => {
    renderUnavailable("network-error");
    expect(screen.getByText("No network connection.")).toBeInTheDocument();
  });

  it("never shows a stale badge or live dot alongside a failure message (AC-7 mutual exclusivity)", () => {
    renderUnavailable("network-error");
    expect(screen.queryByText("STALE")).not.toBeInTheDocument();
    expect(screen.queryByText("LIVE")).not.toBeInTheDocument();
  });

  it("renders all fields, timestamp, and a live indicator when fresh (AC-1, AC-2, AC-7)", () => {
    render(
      <CurrentConditionsCard
        locationName="Paris"
        status="ready"
        display={display}
        failureType={null}
        fetchedAt={fetchedAt}
        isStale={false}
        unitsSystem="metric"
        onUnitsChange={vi.fn()}
        onRefresh={vi.fn()}
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

  it("shows a stale stamp badge alongside the original timestamp when data is stale, never a failure message (AC-6, AC-7)", () => {
    render(
      <CurrentConditionsCard
        locationName="Paris"
        status="ready"
        display={display}
        failureType={null}
        fetchedAt={fetchedAt}
        isStale={true}
        unitsSystem="metric"
        onUnitsChange={vi.fn()}
        onRefresh={vi.fn()}
      />,
    );

    expect(screen.getByText("STALE")).toBeInTheDocument();
    expect(screen.getByText(/14:32Z/)).toBeInTheDocument();
    expect(screen.queryByText("LIVE")).not.toBeInTheDocument();
    expect(screen.queryByText(/weather provider|no data|no network/i)).not.toBeInTheDocument();
  });

  it("wires the Units toggle through to onUnitsChange (AC-8)", () => {
    const onUnitsChange = vi.fn();
    render(
      <CurrentConditionsCard
        locationName="Paris"
        status="ready"
        display={display}
        failureType={null}
        fetchedAt={fetchedAt}
        isStale={false}
        unitsSystem="metric"
        onUnitsChange={onUnitsChange}
        onRefresh={vi.fn()}
      />,
    );

    screen.getByRole("button", { name: "°F" }).click();

    expect(onUnitsChange).toHaveBeenCalledWith("imperial");
  });

  it("wires the manual refresh control through to onRefresh (AC-2)", () => {
    const onRefresh = vi.fn();
    render(
      <CurrentConditionsCard
        locationName="Paris"
        status="ready"
        display={display}
        failureType={null}
        fetchedAt={fetchedAt}
        isStale={false}
        unitsSystem="metric"
        onUnitsChange={vi.fn()}
        onRefresh={onRefresh}
      />,
    );

    screen.getByRole("button", { name: "NEW OBS" }).click();

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });
});
