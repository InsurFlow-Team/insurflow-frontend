import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("./client", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import apiClient from "./client";
import { createClaim, toCreateClaimRequest } from "./claims.service";
import type { CreateClaimRequest } from "./claims.service";
import type { CreateClaimDraft } from "../types";

const mockedPost = vi.mocked(apiClient.post);

const VALID_PAYLOAD: CreateClaimRequest = {
  policyId: "policy-uuid-123",
  plateNumber: "ABC-1234",
  incidentType: "COLLISION",
  incidentLocation: "Nablus - Rafidia Street",
  incidentDate: "2026-09-20",
  latitude: 32.2211,
  longitude: 35.2544,
};

describe("createClaim", () => {
  beforeEach(() => {
    mockedPost.mockReset();
  });

  it("POSTs exactly the verified contract fields to /claims and returns the normalized summary", async () => {
    mockedPost.mockResolvedValue({
      data: {
        success: true,
        message: "Claim created successfully",
        data: {
          id: "claim-uuid",
          claimNumber: "CLM-0001",
          status: "NEW",
          createdAt: "2026-08-26T15:00:00.000Z",
        },
      },
    });

    const result = await createClaim(VALID_PAYLOAD);

    expect(mockedPost).toHaveBeenCalledWith("/claims", VALID_PAYLOAD);
    expect(result).toEqual({
      id: "claim-uuid",
      claimNumber: "CLM-0001",
      status: "NEW",
      customerName: "",
      initialPlateNumber: "",
      incidentCoordinates: null,
      createdAt: "2026-08-26T15:00:00.000Z",
    });
  });

  it("carries the backend's incidentCoordinates echo from the create response into the summary (map marker source)", async () => {
    mockedPost.mockResolvedValue({
      data: {
        success: true,
        message: "Claim created successfully",
        data: {
          id: "claim-uuid",
          claimNumber: "CLM-0001",
          status: "NEW",
          incidentCoordinates: {
            latitude: 32.2211,
            longitude: 35.2544,
            capturedAt: "2026-09-20T09:00:00.000Z",
          },
          createdAt: "2026-08-26T15:00:00.000Z",
        },
      },
    });

    // The marker's coordinates still come from the backend echo — never from
    // what the frontend happened to send.
    const result = await createClaim(VALID_PAYLOAD);

    expect(mockedPost).toHaveBeenCalledWith("/claims", VALID_PAYLOAD);
    expect(result.incidentCoordinates).toEqual({
      latitude: 32.2211,
      longitude: 35.2544,
      capturedAt: "2026-09-20T09:00:00.000Z",
    });
  });

  it("rejects when the backend returns an error (e.g. 400)", async () => {
    mockedPost.mockRejectedValue(new Error("Request failed with status code 400"));

    await expect(createClaim(VALID_PAYLOAD)).rejects.toThrow();
  });

  it("converts the officer-pinned form coordinates (strings) to numbers on the wire and excludes legacy fields", async () => {
    mockedPost.mockResolvedValue({
      data: {
        success: true,
        message: "Claim created",
        data: {
          id: "clm-9",
          claimNumber: "CLM-2026-0009",
          status: "NEW",
          createdAt: "2026-09-09T10:00:00.000Z",
        },
      },
    });

    const draft: CreateClaimDraft = {
      policyId: "policy-uuid-123",
      plateNumber: "ABC-1234",
      incidentType: "COLLISION",
      incidentLocation: "Nablus - Rafidia Street",
      incidentDate: "2026-09-01",
      latitude: "32.2211",
      longitude: "35.2544",
      // Legacy fields - should be excluded from the request
      customerName: "Ahmed Ibrahim",
      customerPhone: "0512345678",
      insurancePolicyNumber: "POL-123456",
      vehicleMake: "Toyota",
      vehicleModel: "Camry",
      vehicleYear: "2022",
      vehicleColor: "White",
      accidentDate: "2026-09-01",
      accidentTime: "14:30",
      description: "Rear collision while waiting at a red light on the highway.",
      damageDescription: "Bumper cracked and trunk lid is misaligned.",
      address: "",
      adjusterId: "adj-1",
      priority: "HIGH",
      assignmentNotes: "Please inspect as soon as possible",
    };

    await createClaim(toCreateClaimRequest(draft));

    expect(mockedPost).toHaveBeenCalledWith("/claims", {
      policyId: "policy-uuid-123",
      plateNumber: "ABC-1234",
      incidentType: "COLLISION",
      incidentLocation: "Nablus - Rafidia Street",
      incidentDate: "2026-09-01",
      latitude: 32.2211,
      longitude: 35.2544,
    });
    expect(mockedPost).not.toHaveBeenCalledWith(
      "/claims",
      expect.objectContaining({ customerName: expect.anything() }),
    );
    expect(mockedPost).not.toHaveBeenCalledWith(
      "/claims",
      expect.objectContaining({ priority: expect.anything() }),
    );
  });

  it("throws when either coordinate is missing or invalid — a claim can never be created without a placed pin", async () => {
    const base = {
      policyId: "policy-uuid-123",
      plateNumber: "ABC-1234",
      incidentType: "COLLISION",
      incidentLocation: "Nablus - Rafidia Street",
      incidentDate: "2026-09-01",
    };

    expect(() =>
      toCreateClaimRequest({ ...base, latitude: "", longitude: "35.2544" }),
    ).toThrow(/coordinates are required/i);
    expect(() =>
      toCreateClaimRequest({ ...base, latitude: "32.2211", longitude: "" }),
    ).toThrow(/coordinates are required/i);
    expect(() =>
      toCreateClaimRequest({ ...base, latitude: "91.0", longitude: "35.2544" }),
    ).toThrow(/coordinates are required/i);
    expect(() =>
      toCreateClaimRequest({ ...base, latitude: "32.2211", longitude: "not-a-number" }),
    ).toThrow(/coordinates are required/i);
  });
});