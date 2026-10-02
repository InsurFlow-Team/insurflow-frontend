import { describe, expect, it, vi } from "vitest";

vi.mock("./client", () => ({
  default: {
    get: vi.fn(),
  },
}));

import apiClient from "./client";
import { getClaimById } from "./claims.service";

const mockedGet = vi.mocked(apiClient.get);

describe("getClaimById", () => {
  it("GETs /claims/:claimId and returns data.accident through unchanged", async () => {
    const backendClaim = {
      id: "clm-1",
      claimNumber: "CLM-DEMO-INS-0042",
      status: "IN_PROGRESS",
      accident: {
        accidentType: "REAR_END_COLLISION",
        accidentDate: "2026-09-08",
        accidentTime: "14:30",
        description: "Vehicle rear-ended at a red light by a third party.",
        damageDescription: "Cracked rear bumper and shattered tail light.",
      },
    };

    mockedGet.mockResolvedValue({
      data: {
        success: true,
        message: "Claim retrieved successfully",
        data: backendClaim,
      },
    });

    const result = await getClaimById("clm-1");

    expect(mockedGet).toHaveBeenCalledWith("/claims/clm-1");
    expect(result).toEqual(backendClaim);
    expect(result.accident?.accidentType).toBe("REAR_END_COLLISION");
    expect(result.accident?.accidentDate).toBe("2026-09-08");
    expect(result.accident?.accidentTime).toBe("14:30");
  });

  it("keeps accident null when the backend returns no accident data", async () => {
    mockedGet.mockResolvedValue({
      data: {
        success: true,
        message: "Claim retrieved successfully",
        data: { id: "clm-2", claimNumber: "CLM-2", status: "NEW", accident: null },
      },
    });

    const result = await getClaimById("clm-2");

    expect(result.accident).toBeNull();
  });
});