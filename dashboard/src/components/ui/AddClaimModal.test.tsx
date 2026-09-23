// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { screen, waitFor } from "@testing-library/dom";
import type { ClaimSummary, PolicyVerificationResponse } from "../../types";
import { fillClaimForm, setupUserEvent } from "../../test/test-utils";

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

const VERIFIED_POLICY: PolicyVerificationResponse = {
  isEligible: true,
  policy: {
    id: "policy-uuid-123",
    policyNumber: "POL-1000203",
    status: "ACTIVE",
    startDate: "2026-01-01T00:00:00.000Z",
    expiryDate: "2026-12-31T23:59:59.000Z",
  },
  vehicle: {
    id: "vehicle-uuid-456",
    plateNumber: "ABC-1234",
    make: "Toyota",
    model: "Camry",
    year: 2022,
    color: "White",
  },
  customer: {
    id: "customer-uuid-789",
    fullName: "Ahmed Ibrahim",
    phone: "0512345678",
  },
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

function renderModal(verifiedPolicy: PolicyVerificationResponse | null) {
  return render(
    <AddClaimModal
      isOpen
      onClose={onClose}
      onSubmit={onSubmit}
      verifiedPolicy={verifiedPolicy}
    />,
  );
}

describe("AddClaimModal", () => {
  it("mounts while closed without an infinite update loop", () => {
    expect(() =>
      render(
        <AddClaimModal
          isOpen={false}
          onClose={onClose}
          onSubmit={onSubmit}
          verifiedPolicy={null}
        />,
      ),
    ).not.toThrow();
  });

  it("opens, closes, and reopens without an infinite update loop", () => {
    const { rerender } = render(
      <AddClaimModal
        isOpen
        onClose={onClose}
        onSubmit={onSubmit}
        verifiedPolicy={VERIFIED_POLICY}
      />,
    );
    expect(screen.getByText("Create New Claim")).toBeTruthy();

    expect(() =>
      rerender(
        <AddClaimModal
          isOpen={false}
          onClose={onClose}
          onSubmit={onSubmit}
          verifiedPolicy={VERIFIED_POLICY}
        />,
      ),
    ).not.toThrow();

    expect(() =>
      rerender(
        <AddClaimModal
          isOpen
          onClose={onClose}
          onSubmit={onSubmit}
          verifiedPolicy={VERIFIED_POLICY}
        />,
      ),
    ).not.toThrow();
    expect(screen.getByText("Create New Claim")).toBeTruthy();
  });

  it("shows verified customer and vehicle data as read-only with no editable inputs", () => {
    const { container } = renderModal(VERIFIED_POLICY);

    // Verified data is displayed (read-only summary).
    expect(screen.getAllByText("POL-1000203").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Ahmed Ibrahim").length).toBeGreaterThanOrEqual(
      1,
    );
    expect(screen.getAllByText("0512345678").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("ABC-1234").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Toyota Camry").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("2022").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("White").length).toBeGreaterThanOrEqual(1);

    // No editable field exists for customer/vehicle data.
    expect(container.querySelector('input[name="customerName"]')).toBeNull();
    expect(container.querySelector('input[name="customerPhone"]')).toBeNull();
    expect(container.querySelector('input[name="initialPlateNumber"]')).toBeNull();
    expect(container.querySelector('input[name="vehicleMake"]')).toBeNull();
    expect(container.querySelector('input[name="vehicleModel"]')).toBeNull();
    expect(container.querySelector('input[name="vehicleYear"]')).toBeNull();
    expect(container.querySelector('input[name="vehicleColor"]')).toBeNull();
  });

  it("submits only incident details — policy context comes from the verified policy, never customer/vehicle form data", async () => {
    const user = setupUserEvent();
    const { container } = renderModal(VERIFIED_POLICY);

    await fillClaimForm(container);
    await user.click(screen.getByRole("button", { name: "Create Claim" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      incidentType: "COLLISION",
      incidentLocation: "Riyadh - King Fahd Road",
      incidentDate: "2026-09-01",
      latitude: "24.7136",
      longitude: "46.6753",
    });
    expect(onSubmit).not.toHaveBeenCalledWith(
      expect.objectContaining({ customerName: expect.anything() }),
    );
    expect(onSubmit).not.toHaveBeenCalledWith(
      expect.objectContaining({ customerPhone: expect.anything() }),
    );
    expect(onSubmit).not.toHaveBeenCalledWith(
      expect.objectContaining({ initialPlateNumber: expect.anything() }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("requires BOTH coordinates (location is mandatory)", async () => {
    const user = setupUserEvent();
    const { container } = renderModal(VERIFIED_POLICY);

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

  it("blocks submission when no verified policy is present (never posts an empty policyId)", async () => {
    const user = setupUserEvent();
    const { container } = renderModal(null);

    await fillClaimForm(container);
    await user.click(screen.getByRole("button", { name: "Create Claim" }));

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
    expect(screen.getByRole("alert").textContent).toMatch(/لم يتم التحقق/i);
    // The modal stays open with the clear error.
    expect(screen.getByText("Create New Claim")).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
  });
});