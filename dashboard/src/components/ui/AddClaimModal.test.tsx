// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { screen, waitFor } from "@testing-library/dom";
import type { ClaimSummary } from "../../types";
import { fillClaimForm, PLATE_PLACEHOLDER, setupUserEvent } from "../../test/test-utils";

vi.setConfig({ testTimeout: 20000 });

vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: () => <div data-testid="marker" />,
  useMapEvents: () => ({}),
  useMap: () => ({
    flyTo: vi.fn(),
    getZoom: () => 14,
  }),
}));

vi.mock("leaflet", () => ({
  default: {
    divIcon: vi.fn(() => ({})),
  },
  divIcon: vi.fn(() => ({})),
}));

import AddClaimModal from "./AddClaimModal";

const CREATED_SUMMARY: ClaimSummary = {
  id: "claim-uuid",
  claimNumber: "CLM-0001",
  status: "NEW",
  customerName: "Ahmed Ibrahim",
  initialPlateNumber: "ABC-1234",
  createdAt: "2026-08-26T15:00:00.000Z",
};

const onSubmit = vi.fn();
const onClose = vi.fn();

beforeEach(() => {
  onSubmit.mockReset();
  onSubmit.mockResolvedValue(CREATED_SUMMARY);
  onClose.mockReset();
});

afterEach(() => {
  cleanup();
});

describe("AddClaimModal", () => {
  it("mounts while closed without an infinite update loop", () => {
    expect(() =>
      render(
        <AddClaimModal isOpen={false} onClose={onClose} onSubmit={onSubmit} />,
      ),
    ).not.toThrow();
  });

  it("opens, closes, and reopens without an infinite update loop", () => {
    const { rerender } = render(
      <AddClaimModal isOpen onClose={onClose} onSubmit={onSubmit} />,
    );
    expect(screen.getByText("Create New Claim")).toBeTruthy();

    expect(() =>
      rerender(<AddClaimModal isOpen={false} onClose={onClose} onSubmit={onSubmit} />),
    ).not.toThrow();

    expect(() =>
      rerender(<AddClaimModal isOpen onClose={onClose} onSubmit={onSubmit} />),
    ).not.toThrow();
    expect(screen.getByText("Create New Claim")).toBeTruthy();
  });

  it("License Plate input is a controlled input bound to initialPlateNumber", async () => {
    const user = setupUserEvent();
    const { container } = render(
      <AddClaimModal isOpen onClose={onClose} onSubmit={onSubmit} />,
    );

    const plate = screen.getByPlaceholderText(PLATE_PLACEHOLDER) as HTMLInputElement;

    await user.type(plate, "abc-1234");
    expect(plate.value).toBe("ABC-1234");

    await user.clear(plate);
    await user.type(plate, "xy9");
    expect(plate.value).toBe("XY9");

    await fillClaimForm(container, { includePlate: false });

    await user.click(screen.getByRole("button", { name: "Create Claim" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ initialPlateNumber: "XY9" }),
    );
  });

  it("submits the complete frontend form model via onSubmit without assignment fields", async () => {
    const user = setupUserEvent();
    const { container } = render(
      <AddClaimModal isOpen onClose={onClose} onSubmit={onSubmit} />,
    );

    await fillClaimForm(container);
    await user.click(screen.getByRole("button", { name: "Create Claim" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        customerName: "Ahmed Ibrahim",
        customerPhone: "0512345678",
        initialPlateNumber: "ABC-1234",
        incidentType: "COLLISION",
        incidentLocation: "Riyadh - King Fahd Road",
        accidentDate: "2026-09-01",
        accidentTime: "14:30",
        latitude: "24.7136",
        longitude: "46.6753",
      }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("requires BOTH coordinates (location is mandatory)", async () => {
    const user = setupUserEvent();
    const { container } = render(
      <AddClaimModal isOpen onClose={onClose} onSubmit={onSubmit} />,
    );

    await fillClaimForm(container, { includeCoordinates: false });

    expect(
      (
        screen.getByRole("button", { name: "Create Claim" }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);

    const latInput = container.querySelector('input[name="latitude"]');
    if (latInput) {
      fireEvent.change(latInput, { target: { name: "latitude", value: "24.7136" } });
    }

    expect(
      (
        screen.getByRole("button", { name: "Create Claim" }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);

    const lngInput = container.querySelector('input[name="longitude"]');
    if (lngInput) {
      fireEvent.change(lngInput, { target: { name: "longitude", value: "46.6753" } });
    }

    await user.click(screen.getByRole("button", { name: "Create Claim" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });
});