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
  customerName: "Ahmed Ibrahim",
  customerPhone: "0512345678",
  initialPlateNumber: "ABC-1234",
  incidentType: "COLLISION",
  incidentLocation: "Riyadh - King Fahd Road",
};

describe("createClaim", () => {
  beforeEach(() => {
    mockedPost.mockReset();
  });

  it("POSTs exactly the verified contract fields to /claims", async () => {
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
      createdAt: "2026-08-26T15:00:00.000Z",
    });
  });

  it("rejects when the backend returns an error (e.g. 400)", async () => {
    mockedPost.mockRejectedValue(new Error("Request failed with status code 400"));

    await expect(createClaim(VALID_PAYLOAD)).rejects.toThrow();
  });

  it("sends exactly the verified contract payload for a full form draft: unsupported fields excluded, empty optionals omitted", async () => {
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
      customerName: "Ahmed Ibrahim",
      customerPhone: "0512345678",
      insurancePolicyNumber: "POL-123456",
      initialPlateNumber: "ABC-1234",
      vehicleMake: "Toyota",
      vehicleModel: "Camry",
      vehicleYear: "2022",
      vehicleColor: "White",
      incidentType: "COLLISION",
      incidentLocation: "Riyadh - King Fahd Road",
      accidentDate: "2026-09-01",
      accidentTime: "14:30",
      description: "Rear collision while waiting at a red light on the highway.",
      damageDescription: "Bumper cracked and trunk lid is misaligned.",
      address: "",
      latitude: "",
      longitude: "",
      adjusterId: "adj-1",
      priority: "HIGH",
      assignmentNotes: "Please inspect as soon as possible",
    };

    await createClaim(toCreateClaimRequest(draft));

    expect(mockedPost).toHaveBeenCalledWith("/claims", {
      customerName: "Ahmed Ibrahim",
      customerPhone: "0512345678",
      initialPlateNumber: "ABC-1234",
      incidentType: "COLLISION",
      incidentLocation: "Riyadh - King Fahd Road",
    });
  });
});