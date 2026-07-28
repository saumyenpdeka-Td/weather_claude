import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UnitsToggle } from "./UnitsToggle";

describe("UnitsToggle", () => {
  it("marks the current Units System as pressed", () => {
    render(<UnitsToggle value="metric" onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "°C" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "°F" })).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onChange with imperial when °F is clicked (AC-8)", () => {
    const onChange = vi.fn();
    render(<UnitsToggle value="metric" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "°F" }));

    expect(onChange).toHaveBeenCalledWith("imperial");
  });

  it("calls onChange with metric when °C is clicked (AC-8)", () => {
    const onChange = vi.fn();
    render(<UnitsToggle value="imperial" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "°C" }));

    expect(onChange).toHaveBeenCalledWith("metric");
  });
});
