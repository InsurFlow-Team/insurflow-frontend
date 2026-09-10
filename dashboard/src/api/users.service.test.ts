import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("./client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import apiClient from "./client";
import { getUsers, getFieldAdjusters } from "./users.service";

const mockedGet = vi.mocked(apiClient.get);

describe("getFieldAdjusters", () => {
  beforeEach(() => {
    mockedGet.mockReset();
  });

  it("GETs the full adjuster team from /users/adjusters (real backend, no fallback)", async () => {
    mockedGet.mockResolvedValue({
      data: {
        success: true,
        message: "ok",
        data: [],
      },
    });

    await getFieldAdjusters();

    expect(mockedGet).toHaveBeenCalledWith("/users/adjusters");
  });

  it("normalizes real backend adjusters (id/_id, availability, activeTasksCount)", async () => {
    mockedGet.mockResolvedValue({
      data: {
        success: true,
        message: "ok",
        data: [
          {
            _id: "651a1f8b7f1d2c001f8d4e92",
            name: "Aya",
            employeeCode: "FT-001",
            role: "FIELD_ADJUSTER",
            organizationId: "org-1",
            organizationName: "InsurFlow",
            status: "ACTIVE",
            availability: "AVAILABLE",
            activeTasksCount: 2,
          },
        ],
      },
    });

    const adjusters = await getFieldAdjusters();

    expect(adjusters).toEqual([
      {
        id: "651a1f8b7f1d2c001f8d4e92",
        name: "Aya",
        employeeCode: "FT-001",
        role: "FIELD_ADJUSTER",
        organizationId: "org-1",
        organizationName: "InsurFlow",
        status: "ACTIVE",
        availability: "AVAILABLE",
        activeTasksCount: 2,
      },
    ]);
  });

  it("propagates backend errors instead of silently falling back to demo users", async () => {
    mockedGet.mockRejectedValue(new Error("Request failed with status code 500"));

    await expect(getFieldAdjusters()).rejects.toThrow();
  });
});

describe("getUsers", () => {
  beforeEach(() => {
    mockedGet.mockReset();
  });

  it("returns real users from /users and never falls back to mock data", async () => {
    mockedGet.mockResolvedValue({
      data: {
        success: true,
        message: "ok",
        data: [
          {
            id: "u-1",
            name: "Alaa",
            employeeCode: "CO-001",
            role: "CLAIMS_OFFICER",
            organizationId: "org-1",
            organizationName: "InsurFlow",
            status: "ACTIVE",
          },
        ],
      },
    });

    await expect(getUsers()).resolves.toHaveLength(1);
  });

  it("rejects when the real endpoint fails (no MOCK_USERS fallback in production)", async () => {
    mockedGet.mockRejectedValue(new Error("network"));

    await expect(getUsers()).rejects.toThrow();
  });
});