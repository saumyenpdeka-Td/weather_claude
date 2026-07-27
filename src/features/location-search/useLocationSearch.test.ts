import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useLocationSearch } from "./useLocationSearch";
import { searchLocations, WeatherProviderUnreachableError } from "./api/geocodingClient";
import type { LocationMatch } from "./api/geocodingClient";

vi.mock("./api/geocodingClient", async () => {
  const actual =
    await vi.importActual<typeof import("./api/geocodingClient")>("./api/geocodingClient");
  return { ...actual, searchLocations: vi.fn() };
});

const mockedSearch = vi.mocked(searchLocations);

const paris: LocationMatch = {
  id: 1,
  name: "Paris",
  latitude: 48.85,
  longitude: 2.35,
  country: "France",
};

describe("useLocationSearch", () => {
  beforeEach(() => {
    mockedSearch.mockReset();
  });

  it("starts idle with no results", () => {
    const { result } = renderHook(() => useLocationSearch());
    expect(result.current.status).toBe("idle");
    expect(result.current.results).toEqual([]);
  });

  it("shows too-short without calling the Weather Provider (AC-6)", () => {
    const { result } = renderHook(() => useLocationSearch());

    act(() => result.current.search("p"));

    expect(result.current.status).toBe("too-short");
    expect(mockedSearch).not.toHaveBeenCalled();
  });

  it("shows results for a valid query (AC-1)", async () => {
    mockedSearch.mockResolvedValue([paris]);
    const { result } = renderHook(() => useLocationSearch());

    act(() => result.current.search("Paris"));

    await waitFor(() => expect(result.current.status).toBe("results"));
    expect(result.current.results).toEqual([paris]);
  });

  it("shows no-results when the Weather Provider finds nothing (AC-4)", async () => {
    mockedSearch.mockResolvedValue([]);
    const { result } = renderHook(() => useLocationSearch());

    act(() => result.current.search("zzzznotarealplace"));

    await waitFor(() => expect(result.current.status).toBe("no-results"));
  });

  it("shows error on Weather Provider failure and recovers via retry (AC-5)", async () => {
    mockedSearch.mockRejectedValueOnce(new WeatherProviderUnreachableError());
    const { result } = renderHook(() => useLocationSearch());

    act(() => result.current.search("Paris"));
    await waitFor(() => expect(result.current.status).toBe("error"));

    mockedSearch.mockResolvedValueOnce([paris]);
    act(() => result.current.retry());

    await waitFor(() => expect(result.current.status).toBe("results"));
    expect(mockedSearch).toHaveBeenCalledTimes(2);
    expect(mockedSearch).toHaveBeenLastCalledWith("Paris");
  });
});
