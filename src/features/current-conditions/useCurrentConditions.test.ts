import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCurrentConditions } from "./useCurrentConditions";
import { fetchCurrentConditions } from "./api/weatherClient";
import type { CurrentConditionsRaw } from "./api/weatherClient";
import type { LocationMatch } from "../location-search/api/geocodingClient";

vi.mock("./api/weatherClient", async () => {
  const actual = await vi.importActual<typeof import("./api/weatherClient")>("./api/weatherClient");
  return { ...actual, fetchCurrentConditions: vi.fn() };
});

const mockedFetch = vi.mocked(fetchCurrentConditions);

const paris: LocationMatch = {
  id: 1,
  name: "Paris",
  latitude: 48.85,
  longitude: 2.35,
  country: "France",
};

function rawAt(fetchedAt: number): CurrentConditionsRaw {
  return {
    temperatureC: 20,
    feelsLikeC: 18,
    humidityPct: 55,
    windSpeedKmh: 10,
    precipitationMm: 0,
    weatherCode: 1,
    fetchedAt,
  };
}

describe("useCurrentConditions", () => {
  beforeEach(() => {
    mockedFetch.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts loading with no display data, defaulting to metric (AC-3)", () => {
    mockedFetch.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useCurrentConditions(paris));

    expect(result.current.status).toBe("loading");
    expect(result.current.display).toBeNull();
    expect(result.current.unitsSystem).toBe("metric");
  });

  it("shows ready with converted display data after a successful fetch (AC-1)", async () => {
    mockedFetch.mockResolvedValue(rawAt(Date.now()));
    const { result } = renderHook(() => useCurrentConditions(paris));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.status).toBe("ready");
    expect(result.current.display?.temperature).toBe(20);
    expect(result.current.fetchedAt).not.toBeNull();
  });

  it("shows unavailable on first-load failure, not a blank/loading screen forever (AC-4)", async () => {
    mockedFetch.mockRejectedValue(new Error("network down"));
    const { result } = renderHook(() => useCurrentConditions(paris));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.status).toBe("unavailable");
    expect(result.current.display).toBeNull();
  });

  it("keeps the last good conditions unchanged when a later refresh fails (AC-5)", async () => {
    const firstFetch = Date.now();
    mockedFetch.mockResolvedValueOnce(rawAt(firstFetch));
    const { result } = renderHook(() => useCurrentConditions(paris));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(result.current.status).toBe("ready");

    mockedFetch.mockRejectedValueOnce(new Error("network down"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10 * 60 * 1000);
    });

    expect(result.current.status).toBe("ready");
    expect(result.current.display?.temperature).toBe(20);
    expect(result.current.fetchedAt).toBe(firstFetch);
  });

  it("marks data as stale once it exceeds 2x the Refresh Interval (AC-6)", async () => {
    mockedFetch.mockResolvedValueOnce(rawAt(Date.now()));
    const { result } = renderHook(() => useCurrentConditions(paris));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    mockedFetch.mockRejectedValue(new Error("network down"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(21 * 60 * 1000);
    });

    expect(result.current.isStale).toBe(true);
    expect(result.current.status).toBe("ready");
  });

  it("does not mark data as stale within the threshold (AC-7)", async () => {
    mockedFetch.mockResolvedValueOnce(rawAt(Date.now()));
    const { result } = renderHook(() => useCurrentConditions(paris));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    mockedFetch.mockRejectedValue(new Error("network down"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5 * 60 * 1000);
    });

    expect(result.current.isStale).toBe(false);
  });

  it("switches Units System instantly without calling the Weather Provider again (AC-8)", async () => {
    mockedFetch.mockResolvedValueOnce(rawAt(Date.now()));
    const { result } = renderHook(() => useCurrentConditions(paris));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    const callCountBefore = mockedFetch.mock.calls.length;

    act(() => {
      result.current.setUnitsSystem("imperial");
    });

    expect(mockedFetch.mock.calls.length).toBe(callCountBefore);
    expect(result.current.unitsSystem).toBe("imperial");
    expect(result.current.display?.temperatureUnit).toBe("°F");
  });
});
