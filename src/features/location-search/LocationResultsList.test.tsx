import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LocationResultsList } from "./LocationResultsList";
import type { LocationMatch } from "./api/geocodingClient";

const parisFrance: LocationMatch = {
  id: 1,
  name: "Paris",
  latitude: 48.85,
  longitude: 2.35,
  country: "France",
  admin1: "Ile-de-France",
};

const parisTexas: LocationMatch = {
  id: 2,
  name: "Paris",
  latitude: 33.66,
  longitude: -95.55,
  country: "United States",
  admin1: "Texas",
};

describe("LocationResultsList", () => {
  it("shows disambiguating region/country info for each result (AC-2, AC-7)", () => {
    render(<LocationResultsList results={[parisFrance, parisTexas]} onSelect={vi.fn()} />);

    expect(screen.getByText("Paris, Ile-de-France, France")).toBeInTheDocument();
    expect(screen.getByText("Paris, Texas, United States")).toBeInTheDocument();
  });

  it("calls onSelect with the chosen Location when clicked (AC-3)", () => {
    const onSelect = vi.fn();
    render(<LocationResultsList results={[parisFrance, parisTexas]} onSelect={onSelect} />);

    fireEvent.click(screen.getByText("Paris, Texas, United States"));

    expect(onSelect).toHaveBeenCalledWith(parisTexas);
  });

  it("renders one item per result without omitting any country", () => {
    render(<LocationResultsList results={[parisFrance, parisTexas]} onSelect={vi.fn()} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});
