import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("./client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import apiClient from "./client";
import {
  getUsers,
  getFieldAdjusters,
  createUser,
  updateUserStatus,
  resetUserPassword,
  deleteUser,
} from "./users.service";

const mockedGet = vi.mocked(apiClient.get);
const mockedPost = vi.mocked(apiClient.post);
const mockedPatch = vi.mocked(apiClient.patch);
const mockedDelete = vi.mocked(apiClient.delete);

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

  it("normalizes the real /users payload (_id -> id) so row keys and PATCH-by-id work", async () => {
    mockedGet.mockResolvedValue({
      data: {
        success: true,
        message: "ok",
        data: [
          {
            _id: "651a1f8b7f1d2c001f8d4e99",
            name: "Sara",
            employeeCode: "CO-001",
            role: "CLAIMS_OFFICER",
            organizationId: "org-1",
            organizationName: "InsurFlow",
            status: "ACTIVE",
          },
        ],
      },
    });

    const users = await getUsers();

    expect(users[0]).toMatchObject({
      id: "651a1f8b7f1d2c001f8d4e99",
      name: "Sara",
      employeeCode: "CO-001",
      role: "CLAIMS_OFFICER",
      status: "ACTIVE",
    });
  });
});

describe("createUser", () => {
  beforeEach(() => {
    mockedPost.mockReset();
  });

  it("POSTs only the backend-accepted fields (no status, no ADMIN role)", async () => {
    mockedPost.mockResolvedValue({
      data: {
        success: true,
        message: "ok",
        data: { _id: "u-9", name: "Test", employeeCode: "TS-001" },
      },
    });

    await createUser({
      name: "Test User",
      employeeCode: "TS-001",
      password: "Password123!",
      role: "CLAIMS_OFFICER",
    });

    expect(mockedPost).toHaveBeenCalledWith("/users", {
      name: "Test User",
      employeeCode: "TS-001",
      password: "Password123!",
      role: "CLAIMS_OFFICER",
    });
  });
});

describe("updateUserStatus", () => {
  beforeEach(() => {
    mockedPatch.mockReset();
  });

  it("PATCHes /users/:id/status with the new status", async () => {
    mockedPatch.mockResolvedValue({
      data: { success: true, message: "ok", data: {} },
    });

    await updateUserStatus("user-1", "INACTIVE");

    expect(mockedPatch).toHaveBeenCalledWith("/users/user-1/status", {
      status: "INACTIVE",
    });
  });
});

describe("resetUserPassword", () => {
  beforeEach(() => {
    mockedPatch.mockReset();
  });

  it("PATCHes /users/:id/reset-password with the new password", async () => {
    mockedPatch.mockResolvedValue({
      data: { success: true, message: "ok", data: {} },
    });

    await resetUserPassword("user-1", "NewPassword123");

    expect(mockedPatch).toHaveBeenCalledWith("/users/user-1/reset-password", {
      newPassword: "NewPassword123",
    });
  });
});

describe("deleteUser", () => {
  beforeEach(() => {
    mockedDelete.mockReset();
  });

  it("DELETEs /users/:id so the backend removes the account", async () => {
    mockedDelete.mockResolvedValue({
      data: { success: true, message: "ok", data: {} },
    });

    await deleteUser("user-1");

    expect(mockedDelete).toHaveBeenCalledWith("/users/user-1");
  });
});