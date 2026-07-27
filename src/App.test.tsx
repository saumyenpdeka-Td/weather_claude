import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { App } from "./App";

describe("App", () => {
  it("wires ActiveLocationProvider around LocationSearch and renders it", () => {
    render(<App />);
    expect(screen.getByLabelText("City name")).toBeInTheDocument();
  });
});
