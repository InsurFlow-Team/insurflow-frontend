import { describe, expect, it } from "vitest";

import { toCreateClaimRequest, toClaimSummary } from "./claims.service";
import type { CreateClaimDraft } from "../types";

describe("toCreateClaimRequest", () => {
  it("sends ONLY the five verified contract fields and excludes every unsupported frontend/backend field", () => {
    const draft: CreateClaimDraft = {
      customerName: "Ahmed Ibrahim",
      customerPhone: "0512345678",
      initialPlateNumber: "ABC-1234",
      incidentType: "COLLISION",
      incidentLocation: "Riyadh - King Fahd Road",
      // Backend-unsupported domain fields that must be kept on the frontend
      // but never included in the POST /claims payload:
      accidentDate: "2026-09-01",
      accidentTime: "14:30",
      description: "Rear collision while waiting at a red light.",
      damageDescription: "Bumper cracked and trunk lid is misaligned.",
      address: "King Fahd Road, Riyadh",
      latitude: "24.7136",
      longitude: "46.6753",
      insurancePolicyNumber: "POL-123456",
      vehicleMake: "Toyota",
      vehicleModel: "Camry",
      vehicleYear: "2022",
      vehicleColor: "White",
      adjusterId: "adj-1",
      priority: "HIGH",
      assignmentNotes: "Please inspect as soon as possible",
    };

    const request = toCreateClaimRequest(draft);

    expect(request).toEqual({
      customerName: "Ahmed Ibrahim",
      customerPhone: "0512345678",
      initialPlateNumber: "ABC-1234",
      incidentType: "COLLISION",
      incidentLocation: "Riyadh - King Fahd Road",
    });

    expect(Object.keys(request)).toEqual([
      "customerName",
      "customerPhone",
      "initialPlateNumber",
      "incidentType",
      "incidentLocation",
    ]);
  });

  it("never serializes unsupported fields even as empty strings", () => {
    const draft: CreateClaimDraft = {
      customerName: "Ahmed Ibrahim",
      customerPhone: "0512345678",
      initialPlateNumber: "ABC-1234",
      incidentType: "COLLISION",
      incidentLocation: "Riyadh - King Fahd Road",
      accidentDate: "",
      accidentTime: "",
      description: "",
      damageDescription: "",
      address: "",
      latitude: "",
      longitude: "",
    };

    const request = toCreateClaimRequest(draft);

    expect(request).not.toHaveProperty("address");
    expect(request).not.toHaveProperty("latitude");
    expect(request).not.toHaveProperty("longitude");
    expect(request).not.toHaveProperty("accidentDate");
    expect(request).not.toHaveProperty("accidentTime");
    expect(request).not.toHaveProperty("description");
    expect(request).not.toHaveProperty("damageDescription");
    expect(request).not.toHaveProperty("organizationId");
    expect(request).not.toHaveProperty("createdBy");
    expect(request).not.toHaveProperty("createdAt");
    expect(request).not.toHaveProperty("status");
    expect(request).not.toHaveProperty("adjusterId");
    expect(request).not.toHaveProperty("priority");
  });
});

describe("toClaimSummary", () => {
  it("normalizes a flat ClaimSummary-shaped record untouched", () => {
    const record = {
      id: "clm-1",
      claimNumber: "CLM-2026-0001",
      status: "SUBMITTED",
      customerName: "Ahmed Ibrahim",
      initialPlateNumber: "ABC-1234",
      createdAt: "2026-09-09T10:00:00.000Z",
      updatedAt: "2026-09-09T11:00:00.000Z",
    };

    expect(toClaimSummary(record)).toEqual(record);
  });

  it("maps a nested customer/vehicle shape into the flat ClaimSummary model", () => {
    const record = {
      id: "clm-2",
      claimNumber: "CLM-2026-0002",
      status: "NEW",
      customer: { name: "Sara Ali", phone: "0550000000" },
      vehicle: { plateNumber: "XYZ-9876" },
      createdAt: "2026-09-09T10:00:00.000Z",
    };

    expect(toClaimSummary(record)).toEqual({
      id: "clm-2",
      claimNumber: "CLM-2026-0002",
      status: "NEW",
      customerName: "Sara Ali",
      initialPlateNumber: "XYZ-9876",
      createdAt: "2026-09-09T10:00:00.000Z",
      updatedAt: undefined,
    });
  });

  it("does not crash and yields safe defaults when optional fields are missing", () => {
    const result = toClaimSummary({ id: "clm-3" });

    expect(result.id).toBe("clm-3");
    expect(result.status).toBe("NEW");
    expect(result.customerName).toBe("");
    expect(result.initialPlateNumber).toBe("");
    // createdAt falls back to now so date filters never hide the new claim
    expect(Number.isNaN(new Date(result.createdAt).getTime())).toBe(false);
  });

  it("falls back to NEW for unknown statuses and _id when id is absent", () => {
    const result = toClaimSummary({
      _id: "clm-4",
      claimNumber: "CLM-2026-0004",
      status: "DRAFT",
      createdAt: "not-a-date",
    });

    expect(result.id).toBe("clm-4");
    expect(result.status).toBe("NEW");
    expect(Number.isNaN(new Date(result.createdAt).getTime())).toBe(false);
  });

  it("returns NEW/empty defaults for a null or non-object record instead of crashing", () => {
    const nullResult = toClaimSummary(null);
    expect(nullResult.status).toBe("NEW");
    expect(nullResult.claimNumber).toBe("");

    const garbageResult = toClaimSummary("not an object");
    expect(garbageResult.status).toBe("NEW");
    expect(garbageResult.customerName).toBe("");
  });
});