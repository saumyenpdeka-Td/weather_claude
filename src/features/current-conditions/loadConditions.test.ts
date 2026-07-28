import { describe, it, expect, vi, afterEach } from "vitest";
import { loadConditions } from "./loadConditions";
import { fetchCurrentConditions, NetworkError } from "./api/weatherClient";
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

const raw: CurrentConditionsRaw = {
  temperatureC: 20,
  feelsLikeC: 18,
  humidityPct: 55,
  windSpeedKmh: 10,
  precipitationMm: 0,
  weatherCode: 1,
  fetchedAt: 1000,
};

describe("loadConditions", () => {
  afterEach(() => {
    mockedFetch.mockReset();
  });

  it("returns ok:true with the raw reading on success", async () => {
    mockedFetch.mockResolvedValue(raw);

    const result = await loadConditions(paris);

    expect(result).toEqual({ ok: true, raw });
  });

  it("returns ok:false with a classified failureType on error, and never throws", async () => {
    mockedFetch.mockRejectedValue(new NetworkError());

    const result = await loadConditions(paris);

    expect(result).toEqual({ ok: false, failureType: "network-error" });
  });
});
