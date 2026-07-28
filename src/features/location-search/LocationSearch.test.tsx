import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LocationSearch } from "./LocationSearch";
import { ActiveLocationProvider, useActiveLocation } from "../../state/ActiveLocationContext";

function stubFetchOnce(body: unknown, ok = true) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok, status: ok ? 200 : 500, json: () => Promise.resolve(body) }),
  );
}

function ActiveLocationDisplay() {
  const { activeLocation } = useActiveLocation();
  return <span data-testid="active-location">{activeLocation?.name ?? "none"}</span>;
}

function renderLocationSearch() {
  return render(
    <ActiveLocationProvider>
      <LocationSearch />
      <ActiveLocationDisplay />
    </ActiveLocationProvider>,
  );
}

async function searchFor(query: string) {
  fireEvent.change(screen.getByLabelText("City name"), { target: { value: query } });
  fireEvent.click(screen.getByRole("button", { name: "Search" }));
}

describe("LocationSearch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows a too-short message and does not call the Weather Provider (AC-6)", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    renderLocationSearch();
    await searchFor("p");

    expect(screen.getByRole("alert")).toHaveTextContent(/too short/i);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("shows results with disambiguation for a valid query (AC-1, AC-2)", async () => {
    stubFetchOnce({
      results: [
        { id: 1, name: "Paris", latitude: 48.85, longitude: 2.35, country: "France" },
        {
          id: 2,
          name: "Paris",
          latitude: 33.66,
          longitude: -95.55,
          country: "United States",
          admin1: "Texas",
        },
      ],
    });

    renderLocationSearch();
    await searchFor("Paris");

    await waitFor(() => expect(screen.getByText("Paris, France")).toBeInTheDocument());
    expect(screen.getByText("Paris, Texas, United States")).toBeInTheDocument();
  });

  it("makes the selected result the active Location (AC-3)", async () => {
    stubFetchOnce({
      results: [{ id: 1, name: "Paris", latitude: 48.85, longitude: 2.35, country: "France" }],
    });

    renderLocationSearch();
    await searchFor("Paris");
    await waitFor(() => screen.getByText("Paris, France"));
    fireEvent.click(screen.getByText("Paris, France"));

    expect(screen.getByTestId("active-location")).toHaveTextContent("Paris");
  });

  it("shows a no-results message for a query with no matches (AC-4)", async () => {
    stubFetchOnce({});

    renderLocationSearch();
    await searchFor("zzzznotarealplace");

    await waitFor(() => expect(screen.getByText(/no matching locations/i)).toBeInTheDocument());
  });

  it("shows an error with retry, and recovers when retried (AC-5)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network down")));

    renderLocationSearch();
    await searchFor("Paris");

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/couldn't reach/i));

    stubFetchOnce({
      results: [{ id: 1, name: "Paris", latitude: 48.85, longitude: 2.35, country: "France" }],
    });
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => expect(screen.getByText("Paris, France")).toBeInTheDocument());
  });
});
